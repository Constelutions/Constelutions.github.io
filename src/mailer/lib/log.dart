import 'dart:io';

import 'package:shelf/shelf.dart';

/// Structured logging to stdout/stderr, timestamped in UTC. See README.md.
void logInfo(String message, [Map<String, Object?> fields = const {}]) =>
    stdout.writeln(_format('INFO', message, fields));

void logError(String message, [Map<String, Object?> fields = const {}]) =>
    stderr.writeln(_format('ERROR', message, fields));

String _format(String level, String message, Map<String, Object?> fields) {
  final StringBuffer buffer = StringBuffer()
    ..write(DateTime.now().toUtc().toIso8601String())
    ..write(' [$level] ')
    ..write(message);

  for (final MapEntry<String, Object?> field in fields.entries) {
    if (field.value == null) continue;
    buffer.write(' ${field.key}=${field.value}');
  }
  return buffer.toString();
}

/// Request logging middleware, replacing shelf's logRequests() so every line
/// shares one clock. See README.md.
Middleware requestLogger() => (Handler inner) {
  return (Request request) async {
    final Stopwatch watch = Stopwatch()..start();
    final Response response = await inner(request);
    watch.stop();

    final Map<String, Object?> fields = <String, Object?>{
      'method': request.method,
      'path': '/${request.url.path}',
      'status': response.statusCode,
      'durationMs': watch.elapsedMilliseconds,
    };

    if (response.statusCode >= 500) {
      logError('request failed', fields);
    } else {
      logInfo('request', fields);
    }
    return response;
  };
};
