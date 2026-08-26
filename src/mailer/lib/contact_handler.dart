import 'dart:async';
import 'dart:convert';

import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

import 'contact_request.dart';
import 'log.dart';
import 'mail_sender.dart';

/// Bodies larger than this are refused before being decoded.
const int maxBodyBytes = 32 * 1024;

/// Builds the router. Routes are mounted under /api/ to match the nginx
/// location that proxies here.
Router buildRouter(MailSender sender) {
  final Router router = Router(notFoundHandler: _notFound);

  router.get('/api/health', (Request request) => _json(200, {'ok': true}));
  router.post(
    '/api/contact',
    (Request request) => _handleContact(request, sender),
  );

  return router;
}

Future<Response> _handleContact(Request request, MailSender sender) async {
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
    case ContactRejected(:final List<String> fields):
      return _json(400, <String, Object?>{
        'error': 'validation',
        'fields': fields,
      });

    case ContactAccepted(:final ContactRequest request):
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

Response _json(int statusCode, Map<String, Object?> body) => Response(
  statusCode,
  body: jsonEncode(body),
  headers: <String, String>{
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
);

final class _PayloadTooLarge implements Exception {
  const _PayloadTooLarge();
}
