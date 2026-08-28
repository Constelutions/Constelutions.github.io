import 'dart:async';
import 'dart:convert';

import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

import 'cap_verifier.dart';
import 'contact_request.dart';
import 'log.dart';
import 'mail_sender.dart';
import 'send_throttle.dart';

/// Bodies larger than this are refused before being decoded.
const int maxBodyBytes = 32 * 1024;

/// Builds the router. Routes are mounted under /api/ to match the nginx
/// location that proxies here.
///
/// [capVerifier] is null when CAP_SITEVERIFY_URL is unset, which skips
/// captcha enforcement entirely.
Router buildRouter(
  MailSender sender,
  SendThrottle throttle,
  CapVerifier? capVerifier,
) {
  final Router router = Router(notFoundHandler: _notFound);

  router.get('/api/health', (Request request) => _json(200, {'ok': true}));
  router.post(
    '/api/contact',
    (Request request) => _handleContact(request, sender, throttle, capVerifier),
  );

  return router;
}

Future<Response> _handleContact(
  Request request,
  MailSender sender,
  SendThrottle throttle,
  CapVerifier? capVerifier,
) async {
  final String body;
  try {
    body = await _readLimited(request);
  } on _PayloadTooLarge {
    return _json(413, <String, Object?>{'error': 'too_large'});
  }

  final Object? decoded;
  try {
    decoded = jsonDecode(body);
  } on FormatException {
    return _json(400, <String, Object?>{
      'error': 'validation',
      'fields': <String>['body'],
    });
  }

  final ContactValidation validation = ContactRequest.validate(decoded);
  switch (validation) {
    // Fake success: a 400 naming the honeypot field would hand the bot its
    // exact fix, and the trap must fire before siteverify so dumb bots never
    // consume Cap challenge capacity.
    case ContactTrapped(:final String reason):
      logInfo('submission trapped', <String, Object?>{'reason': reason});
      return _json(200, <String, Object?>{'ok': true});

    case ContactRejected(:final List<String> fields):
      return _json(400, <String, Object?>{
        'error': 'validation',
        'fields': fields,
      });

    case ContactAccepted(:final ContactRequest request):
      if (capVerifier != null) {
        final String token =
            decoded is Map<String, Object?> && decoded['capToken'] is String
            ? (decoded['capToken']! as String).trim()
            : '';

        // 403 rather than fake success: Cap tokens are one-time and expire,
        // so a human with a stale token needs actionable feedback to
        // re-solve. The PoW itself is the wall — telling a bot its token
        // failed reveals nothing useful.
        final CapVerdict verdict = token.isEmpty
            ? CapVerdict.invalid
            : await capVerifier.verify(token);
        if (verdict == CapVerdict.invalid) {
          logInfo('captcha rejected', <String, Object?>{
            'emptyToken': token.isEmpty,
          });
          return _json(403, <String, Object?>{'error': 'captcha_failed'});
        }
        // CapVerdict.unavailable falls through: fail open. CapVerifier
        // already logged the error.
      }

      // Throttle only submissions that would actually send — trapped,
      // rejected and captcha-failed requests must not starve legitimate
      // visitors of the shared hourly budget.
      if (!throttle.tryAcquire()) {
        logInfo('submission throttled', <String, Object?>{
          'retryAfterSeconds': throttle.retryAfterSeconds,
        });
        return _json(
          429,
          <String, Object?>{'error': 'rate_limited'},
          headers: <String, String>{
            'retry-after': '${throttle.retryAfterSeconds}',
          },
        );
      }

      final SendOutcome outcome = await sender.send(request);
      if (outcome.isSent) {
        return _json(200, <String, Object?>{'ok': true});
      }
      // MailSender already logged the detail; the client gets a generic code.
      return _json(outcome.statusCode!, <String, Object?>{
        'error': 'send_failed',
      });
  }
}

/// Reads the body while enforcing [maxBodyBytes] against both the declared
/// Content-Length and the actual byte count.
Future<String> _readLimited(Request request) async {
  final int? declared = request.contentLength;
  if (declared != null && declared > maxBodyBytes) {
    throw const _PayloadTooLarge();
  }

  final List<int> bytes = <int>[];
  await for (final List<int> chunk in request.read()) {
    bytes.addAll(chunk);
    if (bytes.length > maxBodyBytes) throw const _PayloadTooLarge();
  }
  return utf8.decode(bytes, allowMalformed: true);
}

Response _notFound(Request request) {
  logInfo('unrouted request', <String, Object?>{
    'method': request.method,
    'path': '/${request.url.path}',
  });
  return _json(404, <String, Object?>{'error': 'not_found'});
}

Response _json(
  int statusCode,
  Map<String, Object?> body, {
  Map<String, String> headers = const {},
}) => Response(
  statusCode,
  body: jsonEncode(body),
  headers: <String, String>{
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  },
);

final class _PayloadTooLarge implements Exception {
  const _PayloadTooLarge();
}
