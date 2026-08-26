import 'dart:io';

import 'package:dart_resend/dart_resend.dart';
import 'package:mailer/config.dart';
import 'package:mailer/contact_handler.dart';
import 'package:mailer/log.dart';
import 'package:mailer/mail_sender.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;

Future<void> main(List<String> arguments) async {
  // Handled before config is read, so a healthcheck never depends on
  // RESEND_API_KEY being present. See README.md.
  if (arguments.contains('--health')) {
    exit(await _probeHealth());
  }

  final MailerConfig config;
  try {
    config = MailerConfig.fromEnvironment(Platform.environment);
  } on MailerConfigException catch (error) {
    logError('startup aborted', <String, Object?>{'reason': error.message});
    exit(1);
  }

  // One client for the process lifetime, closed only on shutdown.
  final Resend resend = Resend(
    apiKey: config.resendApiKey,
    timeout: const Duration(seconds: 10),
  );

  final Handler handler = const Pipeline()
      .addMiddleware(requestLogger())
      .addHandler(buildRouter(MailSender(resend: resend, config: config)).call);

  final HttpServer server = await shelf_io.serve(
    handler,
    InternetAddress.anyIPv4,
    config.port,
    poweredByHeader: null,
  );
  server.autoCompress = true;

  // nginx owns security headers at the edge. See README.md.
  for (final String header in <String>[
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
  ]) {
    server.defaultResponseHeaders.removeAll(header);
  }

  logInfo('mailer listening', <String, Object?>{
    'port': server.port,
    'from': config.from,
    'to': config.to,
  });

  for (final ProcessSignal signal in <ProcessSignal>[
    ProcessSignal.sigterm,
    ProcessSignal.sigint,
  ]) {
    signal.watch().listen((_) async {
      logInfo('shutting down');
      await server.close();
      resend.close();
      exit(0);
    });
  }
}

/// Probes the running server's health endpoint. Returns a process exit code.
Future<int> _probeHealth() async {
  final String port = (Platform.environment['PORT'] ?? '8080').trim();
  final HttpClient client = HttpClient()
    ..connectionTimeout = const Duration(seconds: 3);

  try {
    final HttpClientRequest request = await client.get(
      '127.0.0.1',
      int.tryParse(port) ?? 8080,
      '/api/health',
    );
    final HttpClientResponse response = await request.close();
    await response.drain<void>();
    return response.statusCode == 200 ? 0 : 1;
  } on Object {
    return 1;
  } finally {
    client.close(force: true);
  }
}
