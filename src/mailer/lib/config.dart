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

    return MailerConfig(
      resendApiKey: apiKey,
      from: _orDefault(environment['CONTACT_FROM'], defaultFrom),
      to: _orDefault(environment['CONTACT_TO'], defaultTo),
      port: port,
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
}
