# Fail2ban and IP bans

Specification for extending the VPS's fail2ban setup and adding managed IP
blocklisting. Companion to [contact-form-anti-spam.md](contact-form-anti-spam.md):
that spec rejects abusive requests at the application edge; this one bans the
IPs behind sustained abuse at the host firewall, so they stop consuming any
resources at all.

Implementation spans two repositories:

| Repo | Path | Changes |
| --- | --- | --- |
| `infra` | `vps/ansible/roles/fail2ban/` | Jail template rewrite, new filter, new tasks |
| `infra` | `vps/ansible/roles/firewall/` | Static blocklist chain + systemd unit |
| `infra` | `vps/ansible/group_vars/all.yml` | New variables |
| `infra` | `vps/ansible/README.md` | Role documentation |
| `Constelutions.github.io` | `src/docker-compose.yml` | journald logging driver on `marketing-site` |

Current state (`infra` repo): the `fail2ban` role installs fail2ban with a
single `[sshd]` jail (`maxretry 5`, `findtime 600`, `bantime 3600`) rendered
from `roles/fail2ban/templates/jail.local.j2`; the `firewall` role manages
UFW (default deny incoming; 47182/80/443 open). Debian/Ubuntu targets, so
fail2ban ≥ 1.0 — everything below relies only on ≥ 0.11 features.

This spec is self-contained: every file path, variable, and directive is
fixed here. Implement it as written.

## The Docker bypass — why the current setup cannot ban web traffic

fail2ban's default banaction inserts rules into the `INPUT` chain (or UFW's
chains). Traffic to Docker-published ports — Traefik's 80/443 — flows
through the `FORWARD`/`DOCKER` chains and **never touches `INPUT`**. A jail
aimed at HTTP would report the IP as banned while the attacker keeps
hammering the site. The `[sshd]` jail is unaffected only because sshd runs
on the host.

Every HTTP-facing ban in this spec therefore lands in the `DOCKER-USER`
chain, which Docker consults first for forwarded traffic and never flushes
once it exists. Host-level bans are effective for this stack: Coolify's
Traefik terminates TLS on the same VPS, so the source IP of the TCP
connection is the real client, not an upstream proxy.

## Goals

| Goal | Mechanism |
| --- | --- |
| Repeat SSH offenders banned progressively longer | `bantime.increment` in `[DEFAULT]` |
| IPs banned by any jail repeatedly get week-long bans | `[recidive]` jail |
| Sustained `/api/` abuse (post-rate-limit 429s, captcha 403s) banned at the firewall | `[contact-abuse]` jail reading the site container's journal |
| Never ban ourselves or the stack's internal traffic | `ignoreip` |
| "Ban this IP permanently" is a one-line PR | `firewall_banned_ips` static blocklist |

## Implementation

### Step 1 — Site repo: journald logging for the nginx container

The `[contact-abuse]` jail needs nginx's access log (the only log that has
both the real client IP and the response status). It is container stdout,
which Docker's default `json-file` driver writes to per-container paths that
change on every redeploy. Switch the driver so the log lands in the host
journal under a stable tag instead.

`src/docker-compose.yml`, `marketing-site` service:

```yaml
    # nginx access/error logs go to the host journal under a stable tag so
    # fail2ban's contact-abuse jail can read them without chasing
    # per-container json-file paths. `docker logs` still works with this
    # driver.
    logging:
      driver: journald
      options:
        tag: marketing-site
```

`docker logs marketing-site` keeps working (the journald driver supports
read-back), and the entries also appear via
`journalctl CONTAINER_TAG=marketing-site`.

### Step 2 — infra: variables (`vps/ansible/group_vars/all.yml`)

Add below the existing `fail2ban_*` block:

```yaml
# Progressive banning: each re-offense doubles the ban, capped at a week.
# dbpurgeage keeps offense history long enough for recidive to see repeats.
fail2ban_bantime_increment: true
fail2ban_bantime_factor: 2
fail2ban_bantime_maxtime: 1w
fail2ban_dbpurgeage: 30d

# Never ban loopback or the private ranges the docker/Coolify stack uses
# internally. Append your own static IP here to make lockouts impossible
# from that address (optional — the sshd canary in ssh_hardening is the
# main lockout guard).
fail2ban_ignoreip:
  - 127.0.0.1/8
  - ::1
  - 10.0.0.0/8
  - 172.16.0.0/12
  - 192.168.0.0/16

# The contact-abuse jail bans on nginx access-log lines, which carry the
# real client IP ONLY once the realip fix from
# Constelutions.github.io/specs/contact-form-anti-spam.md is deployed.
# Before that fix every /api/ request logs Coolify's proxy IP, and this
# jail would ban the proxy — a site-wide outage. Leave false until the
# anti-spam spec's nginx changes are live.
fail2ban_contact_jail_enabled: false

# IPs (or CIDRs) dropped unconditionally, in both INPUT and DOCKER-USER.
# Managed by roles/firewall — add an entry, run the playbook.
firewall_banned_ips: []
```

### Step 3 — infra: rewrite `roles/fail2ban/templates/jail.local.j2`

Three explicit jails, not a data-driven loop — with this few, explicit
sections are easier to review than a generic template (recorded under
Considered and rejected).

```jinja
# Managed by Ansible (role: fail2ban) — do not edit by hand.
# Mirrors the "Installing Fail2Ban" section in docs/vps-setup.md.

[DEFAULT]
# Never ban loopback or the stack's internal private ranges.
ignoreip = {{ fail2ban_ignoreip | join(' ') }}

# Progressive banning: repeat offenders get exponentially longer bans, so a
# patient brute-forcer can't just come back when a flat ban expires.
bantime.increment = {{ fail2ban_bantime_increment | lower }}
bantime.factor = {{ fail2ban_bantime_factor }}
bantime.maxtime = {{ fail2ban_bantime_maxtime }}
dbpurgeage = {{ fail2ban_dbpurgeage }}

[sshd]
enabled = true
port = {{ ssh_port }}
maxretry = {{ fail2ban_maxretry }}
findtime = {{ fail2ban_findtime }}
bantime = {{ fail2ban_bantime }}

# Meta-jail: reads fail2ban's own log and hands week-long bans to IPs that
# other jails banned repeatedly. Two ban actions because one chain cannot
# cover both paths: INPUT guards host services (sshd), DOCKER-USER guards
# forwarded container traffic (Traefik's 80/443) — see the Docker bypass
# note in specs/fail2ban-ip-bans.md.
[recidive]
enabled = true
logpath = /var/log/fail2ban.log
findtime = 1d
maxretry = 5
bantime = 1w
action = iptables-allports[name=recidive]
         iptables-allports[name=recidive-docker, chain=DOCKER-USER]

# Bans IPs that keep hitting /api/ with 403 (failed captcha) or 429
# (rate-limited) responses. nginx's limit_req already answers 429 at 3r/m,
# so this fires only on clients that keep pushing AFTER being rate-limited
# — it is the escalation, not the first line. Ban must land in DOCKER-USER:
# an INPUT ban would not touch docker-forwarded traffic.
[contact-abuse]
enabled = {{ fail2ban_contact_jail_enabled | lower }}
backend = systemd
journalmatch = CONTAINER_TAG=marketing-site
filter = contact-abuse
maxretry = 10
findtime = 300
bantime = {{ fail2ban_bantime }}
banaction = iptables-allports[chain=DOCKER-USER]
```

### Step 4 — infra: new filter `roles/fail2ban/files/filter-contact-abuse.conf`

Deployed to `/etc/fail2ban/filter.d/contact-abuse.conf`. Matches the site's
nginx `main` log format (`$remote_addr - $remote_user [$time_local]
"$request" $status …` — see `src/site/nginx.conf` in the site repo), which
starts with the real client IP once realip is active. It deliberately does
**not** match `$http_x_forwarded_for` at the line's end — that header is
client-controlled and matching it would let an attacker ban arbitrary IPs.

```ini
# Managed by Ansible (role: fail2ban) — do not edit by hand.
# Matches nginx `main`-format access lines for /api/ requests answered with
# 403 (captcha_failed) or 429 (rate_limited). The journald backend feeds
# this the raw container log line via CONTAINER_TAG=marketing-site.
[Definition]
failregex = ^<HOST> - \S+ \[[^\]]+\] "[A-Z]+ /api/\S* [^"]*" (?:403|429) 
ignoreregex =
```

(Note the trailing space after `(?:403|429)` — it anchors the status field
against matching 4030-style byte counts.)

### Step 5 — infra: `roles/fail2ban/tasks/main.yml` additions

After the install task:

```yaml
# The systemd backend (contact-abuse jail) needs the python bindings; apt's
# Recommends usually pulls this in, but be explicit so a minimal image or
# --no-install-recommends host doesn't silently break the jail.
- name: Install systemd journal bindings for fail2ban
  ansible.builtin.apt:
    name: python3-systemd
    state: present

- name: Deploy the contact-abuse filter
  ansible.builtin.copy:
    src: filter-contact-abuse.conf
    dest: /etc/fail2ban/filter.d/contact-abuse.conf
    owner: root
    group: root
    mode: "0644"
  notify: Restart fail2ban
```

The existing template/service tasks and the `Restart fail2ban` handler are
unchanged. Bans survive the restart: fail2ban ≥ 0.11 persists them in
`/var/lib/fail2ban/fail2ban.sqlite3` and re-applies them on start.

### Step 6 — infra: static blocklist (`roles/firewall/`)

A dedicated `BLOCKLIST` chain referenced from both `INPUT` and
`DOCKER-USER`, populated by a templated script and re-applied at boot by a
systemd oneshot (iptables rules are not reboot-persistent, and this host
reboots nightly via unattended-upgrades). Flush-and-repopulate makes the
script idempotent and makes removals take effect on the next run.

`roles/firewall/templates/apply-ip-blocklist.sh.j2` →
`/usr/local/sbin/apply-ip-blocklist` (mode `0750`):

```jinja
#!/bin/sh
# Managed by Ansible (role: firewall) — do not edit by hand.
# Applies the firewall_banned_ips blocklist to a dedicated chain hooked
# into both INPUT (host services) and DOCKER-USER (forwarded container
# traffic). Docker creates DOCKER-USER only if missing and never flushes a
# pre-existing one, so creating it here is safe pre- and post-docker.
set -eu

iptables -N BLOCKLIST 2>/dev/null || true
iptables -F BLOCKLIST
{% for ip in firewall_banned_ips %}
iptables -A BLOCKLIST -s {{ ip }} -j DROP
{% endfor %}

iptables -N DOCKER-USER 2>/dev/null || true
iptables -C INPUT -j BLOCKLIST 2>/dev/null || iptables -I INPUT 1 -j BLOCKLIST
iptables -C DOCKER-USER -j BLOCKLIST 2>/dev/null || iptables -I DOCKER-USER 1 -j BLOCKLIST
```

`roles/firewall/files/ip-blocklist.service` →
`/etc/systemd/system/ip-blocklist.service`:

```ini
# Managed by Ansible (role: firewall).
# Re-applies the static IP blocklist after every boot. After=docker.service
# so the DOCKER-USER jump is inserted ahead of whatever docker set up.
[Unit]
Description=Apply static IP blocklist
After=docker.service network.target

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/apply-ip-blocklist
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

`roles/firewall/tasks/main.yml` additions (after the existing UFW tasks):

```yaml
- name: Deploy the IP blocklist script
  ansible.builtin.template:
    src: apply-ip-blocklist.sh.j2
    dest: /usr/local/sbin/apply-ip-blocklist
    owner: root
    group: root
    mode: "0750"
  notify: Apply IP blocklist

- name: Install the IP blocklist boot service
  ansible.builtin.copy:
    src: ip-blocklist.service
    dest: /etc/systemd/system/ip-blocklist.service
    owner: root
    group: root
    mode: "0644"
  notify: Apply IP blocklist

- name: Enable the IP blocklist boot service
  ansible.builtin.systemd:
    name: ip-blocklist
    enabled: true
    daemon_reload: true
```

New `roles/firewall/handlers/main.yml`:

```yaml
---
- name: Apply IP blocklist
  ansible.builtin.systemd:
    name: ip-blocklist
    state: restarted
```

Banning an IP is now: add it to `firewall_banned_ips` in
`group_vars/all.yml`, open a PR, run the playbook.

### Step 7 — infra: docs

`vps/ansible/README.md`:

- Update playbook step 14 ("Install Fail2ban with an sshd jail") to mention
  the three jails, progressive bans, and the `DOCKER-USER` requirement for
  the HTTP jail.
- Document `fail2ban_contact_jail_enabled` and its dependency on the site
  repo's realip deployment (link this spec), and `firewall_banned_ips` as
  the manual-ban workflow.

## Rollout order

1. **Now**: Steps 2–7 with `fail2ban_contact_jail_enabled: false` — sshd
   increments, recidive, ignoreip, and the blocklist have no dependencies.
2. **Site repo**: Step 1 (journald driver) can ship any time; it only
   changes where logs land.
3. **After** `contact-form-anti-spam.md`'s nginx realip changes are
   deployed and verified (access log shows real client IPs): flip
   `fail2ban_contact_jail_enabled: true` and re-run the playbook. Flipping
   it earlier bans Coolify's proxy IP and takes the whole site down.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `fail2ban_maxretry` / `fail2ban_findtime` / `fail2ban_bantime` | `5` / `600` / `3600` | Existing sshd knobs, unchanged |
| `fail2ban_bantime_increment` | `true` | Double each re-offense's ban |
| `fail2ban_bantime_factor` | `2` | Growth factor |
| `fail2ban_bantime_maxtime` | `1w` | Ban cap |
| `fail2ban_dbpurgeage` | `30d` | Offense-history retention |
| `fail2ban_ignoreip` | loopback + RFC1918 | Never-ban list |
| `fail2ban_contact_jail_enabled` | `false` | Gate for the /api/ abuse jail — see Rollout order |
| `firewall_banned_ips` | `[]` | Permanent manual bans (INPUT + DOCKER-USER) |

## Verification

On the VPS after a playbook run:

```bash
# All expected jails up (contact-abuse only after the flag is flipped)
sudo fail2ban-client status
sudo fail2ban-client status recidive

# The contact-abuse jail actually sees the container's journal
journalctl CONTAINER_TAG=marketing-site -n 5

# Filter matches real traffic: generate a few 429s (7 rapid POSTs to
# /api/contact from an external machine), then
sudo fail2ban-client status contact-abuse   # bans/currently failed > 0

# A web ban actually blocks: while banned from that machine,
curl -m 5 https://<site>/                   # times out, not 200
sudo iptables -L f2b-contact-abuse -n       # shows the DROP
sudo iptables -L DOCKER-USER -n             # chain referenced first

# Never self-ban: from an ignoreip address the same burst produces
# "Ignore <ip>" lines in /var/log/fail2ban.log, no ban

# Static blocklist: add a test IP to firewall_banned_ips, run the playbook
sudo iptables -L BLOCKLIST -n               # DROP for the IP
sudo systemctl status ip-blocklist          # enabled, exited 0
# reboot (or wait for the 04:00 window) → rules present again

# Ban persistence: sudo systemctl restart fail2ban → previously banned IPs
# reappear in fail2ban-client status output (sqlite-backed)
```

## Considered and rejected

- **Banning from the mailer's trap logs** (`submission trapped`, etc.) —
  those lines deliberately carry no client IP (PII-free by design in the
  anti-spam spec), and the mailer never sees a trustworthy IP anyway. The
  nginx access log has both the IP and the status; use it.
- **Matching `$http_x_forwarded_for` in the filter** — client-controlled;
  matching it lets an attacker feed fake IPs into the ban list.
- **`ufw deny` / `ufw route deny` for web bans** — UFW's chains sit after
  Docker's in the FORWARD path, so ordering is not guaranteed;
  `DOCKER-USER` is the chain Docker documents for exactly this.
- **A data-driven jail loop in the template** — three jails; explicit
  sections are easier to review than a generic structure (YAGNI).
- **Jails on Traefik's own access logs** — redundant once the nginx log is
  wired, and Coolify manages Traefik's config; touching it fights the tool.
- **GeoIP country blocking** — real prospects travel; standing maintenance
  cost for marginal benefit at this traffic level.
- **CrowdSec instead of fail2ban** — capable replacement (shared blocklists,
  native Docker support) but a full migration plus a SaaS-ish console;
  fail2ban is already deployed and the delta above is small. Revisit if ban
  management outgrows this setup.

## Known trade-offs

- **The contact-abuse jail is coupled to the nginx log format** — if
  `log_format main` in `src/site/nginx.conf` changes, the failregex must
  follow. The verification's live-match check is the guard.
- **Flush-and-repopulate blocklist** briefly (milliseconds) leaves the
  chain empty during a re-run. Acceptable.
- **`bantime.maxtime = 1w` with increment** means a truly persistent
  attacker returns weekly; `firewall_banned_ips` is the permanent answer
  for those.
- **journald driver** moves container logs into the system journal —
  disk-usage accounting shifts from Docker's log rotation to journald's
  (`SystemMaxUse` defaults apply). `docker logs` behavior is unchanged.
- **DOCKER-USER bans block all forwarded ports for the IP**, not just HTTP
  — intended (allports), but worth knowing when reading `iptables` output.
