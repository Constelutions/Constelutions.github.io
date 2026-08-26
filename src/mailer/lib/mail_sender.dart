import 'package:dart_resend/dart_resend.dart';

import 'config.dart';
import 'contact_request.dart';
import 'log.dart';

/// Sends contact submissions through Resend.
///
/// The only file that imports `dart_resend`: every Resend type, exceptions
/// included, is translated into a [SendOutcome] here. See README.md.
final class MailSender {
  const MailSender({required Resend resend, required MailerConfig config})
    : _resend = resend,
      _config = config;

  final Resend _resend;
  final MailerConfig _config;

  Future<SendOutcome> send(ContactRequest request) async {
    try {
      final ResendResponse<ResendId> response = await _resend.emails.send(
        SendEmailRequest.raw(
          from: _config.from,
          to: <String>[_config.to],
          replyTo: <String>[request.email],
          subject: _subjectFor(request),
          html: _htmlBodyFor(request),
          text: _textBodyFor(request),
        ),
      );

      final ResendRateLimit? rateLimit = response.rateLimit;
      logInfo('contact email sent', <String, Object?>{
        'emailId': response.data.id,
        'requestId': response.requestId,
        'rateLimitRemaining': rateLimit?.remaining,
        'rateLimitLimit': rateLimit?.limit,
      });
      return const SendOutcome.sent();
    } on ResendException catch (error, stackTrace) {
      return _translate(error, stackTrace);
    }
  }

  /// Maps a Resend failure onto the status the browser should see.
  ///
  /// ResendTimeoutException extends ResendNetworkException, so it must stay
  /// matched first — see README.md.
  SendOutcome _translate(ResendException error, StackTrace stackTrace) {
    switch (error) {
      case ResendApiException():
        logError('resend rejected the request', <String, Object?>{
          'statusCode': error.statusCode,
          'name': error.name,
          'requestId': error.requestId,
          'body': error.responseBody,
        });
        return const SendOutcome.failed(502);

      case ResendTimeoutException():
        logError('resend timed out', <String, Object?>{
          'timeout': error.timeout,
          'message': error.message,
        });
        return const SendOutcome.failed(504);

      case ResendNetworkException():
        logError('resend transport failure', <String, Object?>{
          'method': error.method,
          'uri': error.uri,
          'message': error.message,
        });
        return const SendOutcome.failed(502);

      case ResendDecodeException():
        logError('could not decode the resend response', <String, Object?>{
          'statusCode': error.statusCode,
          'body': error.responseBody,
          'stackTrace': stackTrace,
        });
        return const SendOutcome.failed(502);
    }
  }

  String _subjectFor(ContactRequest request) {
    final String service = request.service.isEmpty
        ? 'sin especificar'
        : request.service;
    return 'Nuevo contacto: ${request.name} - $service';
  }

  String _textBodyFor(ContactRequest request) => <String>[
    'Nombre: ${request.name}',
    'Correo: ${request.email}',
    if (request.company.isNotEmpty) 'Empresa: ${request.company}',
    'Servicio: ${request.service.isEmpty ? "sin especificar" : request.service}',
    '',
    'Mensaje:',
    request.message,
  ].join('\n');

  String _htmlBodyFor(ContactRequest request) {
    final StringBuffer rows = StringBuffer()
      ..write(_row('Nombre', request.name))
      ..write(_row('Correo', request.email));

    if (request.company.isNotEmpty) {
      rows.write(_row('Empresa', request.company));
    }
    rows.write(
      _row(
        'Servicio',
        request.service.isEmpty ? 'sin especificar' : request.service,
      ),
    );

    return '<html><body style="font-family:sans-serif;line-height:1.5">'
        '<h2 style="margin:0 0 16px">Nuevo contacto desde constelutions.tech</h2>'
        '<table cellpadding="0" cellspacing="0">$rows</table>'
        '<h3 style="margin:24px 0 8px">Mensaje</h3>'
        '<p style="white-space:pre-wrap;margin:0">'
        '${escapeHtml(request.message)}'
        '</p>'
        '</body></html>';
  }

  String _row(String label, String value) =>
      '<tr><td style="padding:2px 12px 2px 0;color:#666">$label</td>'
      '<td style="padding:2px 0"><strong>${escapeHtml(value)}</strong></td></tr>';
}

/// Escapes the five characters significant in HTML text and attribute
/// contexts. Ampersand is replaced first — see README.md.
String escapeHtml(String value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

/// Outcome of an attempted send, free of any Resend type.
final class SendOutcome {
  const SendOutcome.sent() : statusCode = null;

  const SendOutcome.failed(int this.statusCode);

  /// Null when the email was accepted; otherwise the HTTP status the browser
  /// should receive.
  final int? statusCode;

  bool get isSent => statusCode == null;
}
