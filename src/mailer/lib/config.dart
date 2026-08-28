/// Thrown when the process environment cannot produce a usable configuration.
final class MailerConfigException implements Exception {
  const MailerConfigException(this.message);

  final String message;

  @override
  String toString() => 'MailerConfigException: $message';
}

/// Runtime configuration, resolved once at startup.
final class MailerConfig {
  const MailerConfig({
    required this.resendApiKey,
    required this.from,
    required this.to,
    required this.port,
    required this.capSiteverifyUrl,
    required this.capSecretKey,
    required this.maxSendsPerHour,
  });

  /// Reads configuration from [environment], throwing [MailerConfigException]
  /// if anything required is missing or unusable.
  factory MailerConfig.fromEnvironment(Map<String, String> environment) {
    final String apiKey = (environment['RESEND_API_KEY'] ?? '').trim();
    if (apiKey.isEmpty) {
      throw const MailerConfigException(
        'RESEND_API_KEY is required but was empty or unset.',
      );
    }

    final String rawPort = (environment['PORT'] ?? '8080').trim();
    final int? port = int.tryParse(rawPort);
    if (port == null || port < 1 || port > 65535) {
      throw MailerConfigException('PORT must be 1-65535, got "$rawPort".');
    }

    // Presence enables captcha enforcement. Unset skips the check entirely,
    // which keeps local dev and the first-deploy bootstrap working before a
    // Cap site key exists — see specs/contact-form-anti-spam.md.
    final String rawCapUrl = (environment['CAP_SITEVERIFY_URL'] ?? '').trim();
    final String? capSiteverifyUrl = rawCapUrl.isEmpty ? null : rawCapUrl;
    if (capSiteverifyUrl != null && Uri.tryParse(capSiteverifyUrl) == null) {
      throw MailerConfigException(
        'CAP_SITEVERIFY_URL must be a valid URL, got "$rawCapUrl".',
      );
    }

    final String capSecretKey = (environment['CAP_SECRET_KEY'] ?? '').trim();
    if (capSiteverifyUrl != null && capSecretKey.isEmpty) {
      throw const MailerConfigException(
        'CAP_SECRET_KEY is required when CAP_SITEVERIFY_URL is set.',
      );
    }

    final String rawMaxSends = (environment['MAX_SENDS_PER_HOUR'] ?? '4')
        .trim();
    final int? maxSendsPerHour = int.tryParse(rawMaxSends);
    if (maxSendsPerHour == null || maxSendsPerHour < 1) {
      throw MailerConfigException(
        'MAX_SENDS_PER_HOUR must be a positive integer, got "$rawMaxSends".',
      );
    }

    return MailerConfig(
      resendApiKey: apiKey,
      from: _orDefault(environment['CONTACT_FROM'], defaultFrom),
      to: _orDefault(environment['CONTACT_TO'], defaultTo),
      port: port,
      capSiteverifyUrl: capSiteverifyUrl,
      capSecretKey: capSiteverifyUrl == null ? null : capSecretKey,
      maxSendsPerHour: maxSendsPerHour,
    );
  }

  /// Sender used when CONTACT_FROM is unset. Must stay on a Resend-verified
  /// domain.
  static const String defaultFrom =
      'Constelutions <no-reply@constelutions.tech>';

  /// Destination used when CONTACT_TO is unset.
  static const String defaultTo = 'theconstelutions@gmail.com';

  static String _orDefault(String? value, String fallback) {
    final String trimmed = (value ?? '').trim();
    return trimmed.isEmpty ? fallback : trimmed;
  }

  /// Resend API key. Never logged, never returned in a response body.
  final String resendApiKey;

  /// Sender address.
  final String from;

  /// Destination inbox for contact submissions.
  final String to;

  /// TCP port to listen on.
  final int port;

  /// Cap Standalone's siteverify endpoint, e.g.
  /// `http://cap:3000/<site_key>/siteverify`. Null skips captcha enforcement
  /// entirely (local dev, first-deploy bootstrap).
  final String? capSiteverifyUrl;

  /// The Cap site key's secret. Never logged. Null iff [capSiteverifyUrl] is.
  final String? capSecretKey;

  /// Global cap on verified sends per hour, protecting the Resend quota from
  /// distributed spam that per-IP limiting cannot see.
  final int maxSendsPerHour;
}
