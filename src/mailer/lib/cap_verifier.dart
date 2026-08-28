import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'log.dart';

/// Outcome of verifying a widget token against the Cap standalone server.
enum CapVerdict {
  /// Cap confirmed the token (`{"success": true}`).
  valid,

  /// Cap rejected the token, or answered with a non-2xx status.
  invalid,

  /// Cap could not be reached (timeout, socket error). The caller fails
  /// open: losing a real lead costs more than one spam email during an
  /// outage of the captcha service.
  unavailable,
}

/// Verifies Cap widget tokens against a self-hosted Cap Standalone instance.
///
/// The only file that talks to Cap's HTTP API — every failure mode is
/// translated into a [CapVerdict] here, so the handler never sees a raw
/// exception.
final class CapVerifier {
  CapVerifier({
    required String siteverifyUrl,
    required String secretKey,
    HttpClient? client,
  }) : _siteverifyUrl = Uri.parse(siteverifyUrl),
       _secretKey = secretKey,
       _client = client ?? HttpClient();

  final Uri _siteverifyUrl;
  final String _secretKey;
  final HttpClient _client;

  static const Duration _timeout = Duration(seconds: 5);

  Future<CapVerdict> verify(String token) async {
    try {
      final HttpClientRequest request = await _client
          .postUrl(_siteverifyUrl)
          .timeout(_timeout);
      request.headers.contentType = ContentType.json;
      request.write(
        jsonEncode(<String, Object?>{'secret': _secretKey, 'response': token}),
      );

      final HttpClientResponse response = await request.close().timeout(
        _timeout,
      );
      final String body = await response
          .transform(utf8.decoder)
          .join()
          .timeout(_timeout);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        logInfo('cap siteverify rejected', <String, Object?>{
          'statusCode': response.statusCode,
        });
        return CapVerdict.invalid;
      }

      final Object? decoded = jsonDecode(body);
      final bool success =
          decoded is Map<String, Object?> && decoded['success'] == true;
      return success ? CapVerdict.valid : CapVerdict.invalid;
    } on TimeoutException catch (error) {
      logError('cap siteverify unreachable', <String, Object?>{
        'reason': 'timeout',
        'message': error.message,
      });
      return CapVerdict.unavailable;
    } on SocketException catch (error) {
      logError('cap siteverify unreachable', <String, Object?>{
        'reason': 'socket',
        'message': error.message,
      });
      return CapVerdict.unavailable;
    } on HttpException catch (error) {
      logError('cap siteverify unreachable', <String, Object?>{
        'reason': 'http',
        'message': error.message,
      });
      return CapVerdict.unavailable;
    } on FormatException catch (error) {
      // Unparsable response body. Treat like an unreachable server: fail
      // open rather than block every submission on a malformed reply.
      logError('cap siteverify unreachable', <String, Object?>{
        'reason': 'decode',
        'message': error.message,
      });
      return CapVerdict.unavailable;
    }
  }

  void close() => _client.close(force: true);
}
