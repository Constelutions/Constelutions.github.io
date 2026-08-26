/// Service ids the form is allowed to submit.
///
/// Mirrors the ids in `../src/repositories/services.json` plus the literal
/// "other" option rendered by Contact.astro.
const Set<String> allowedServiceIds = <String>{
  'development',
  'design',
  'integrations',
  'consulting',
  'other',
};

const int _maxNameLength = 100;
const int _maxEmailLength = 254;
const int _maxCompanyLength = 100;
const int _maxMessageLength = 5000;

final RegExp _emailPattern = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

/// A validated contact-form submission.
final class ContactRequest {
  const ContactRequest({
    required this.name,
    required this.email,
    required this.message,
    required this.company,
    required this.service,
  });

  final String name;
  final String email;
  final String message;

  /// Empty when the visitor left the optional company field blank.
  final String company;

  /// Empty when the visitor left the select on its default option.
  final String service;

  /// Validates a decoded JSON body, naming every field that failed.
  static ContactValidation validate(Object? body) {
    if (body is! Map<String, Object?>) {
      return const ContactRejected(<String>['body']);
    }

    final String name = _readString(body['name']);
    final String email = _readString(body['email']);
    final String message = _readString(body['message']);
    final String company = _readString(body['company']);
    final String service = _readString(body['service']);

    final List<String> invalid = <String>[
      if (name.isEmpty || name.length > _maxNameLength) 'name',
      if (email.isEmpty ||
          email.length > _maxEmailLength ||
          !_emailPattern.hasMatch(email))
        'email',
      if (message.isEmpty || message.length > _maxMessageLength) 'message',
      if (company.length > _maxCompanyLength) 'company',
      if (service.isNotEmpty && !allowedServiceIds.contains(service)) 'service',
    ];

    if (invalid.isNotEmpty) return ContactRejected(invalid);

    return ContactAccepted(
      ContactRequest(
        name: name,
        email: email,
        message: message,
        company: company,
        service: service,
      ),
    );
  }

  /// Non-string JSON values collapse to empty and are caught by the
  /// required-field checks.
  static String _readString(Object? value) =>
      value is String ? value.trim() : '';
}

/// Result of validating a submission.
sealed class ContactValidation {
  const ContactValidation();
}

/// The submission is well-formed.
final class ContactAccepted extends ContactValidation {
  const ContactAccepted(this.request);

  final ContactRequest request;
}

/// The submission failed validation on [fields].
final class ContactRejected extends ContactValidation {
  const ContactRejected(this.fields);

  final List<String> fields;
}
