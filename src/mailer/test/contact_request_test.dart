import 'package:mailer/contact_request.dart';
import 'package:mailer/mail_sender.dart';
import 'package:test/test.dart';

List<String> rejectedFields(Object? body) {
  final ContactValidation result = ContactRequest.validate(body);
  return result is ContactRejected ? result.fields : <String>[];
}

Map<String, Object?> validBody() => <String, Object?>{
  'name': 'Ada Lovelace',
  'email': 'ada@example.com',
  'message': 'Hola, me interesa su servicio.',
  'company': 'Analytical Engines',
  'service': 'development',
  'website': '',
};

void main() {
  group('validate', () {
    test('accepts a complete submission and trims it', () {
      final Map<String, Object?> body = validBody()
        ..['name'] = '  Ada Lovelace  ';
      final ContactValidation result = ContactRequest.validate(body);

      expect(result, isA<ContactAccepted>());
      expect((result as ContactAccepted).request.name, 'Ada Lovelace');
    });

    test('accepts a submission without the optional fields', () {
      final Map<String, Object?> body = validBody()
        ..remove('company')
        ..remove('service');
      expect(ContactRequest.validate(body), isA<ContactAccepted>());
    });

    test('reports every invalid field at once', () {
      expect(
        rejectedFields(<String, Object?>{
          'name': '',
          'email': 'not-an-email',
          'message': '   ',
        }),
        <String>['name', 'email', 'message'],
      );
    });

    test('rejects a non-object body', () {
      expect(rejectedFields(<Object?>['nope']), <String>['body']);
      expect(rejectedFields(null), <String>['body']);
    });

    test('rejects a service id outside the allowlist', () {
      expect(
        rejectedFields(validBody()..['service'] = '; DROP TABLE'),
        <String>['service'],
      );
    });

    test('rejects over-long values', () {
      expect(rejectedFields(validBody()..['name'] = 'a' * 101), <String>[
        'name',
      ]);
      expect(rejectedFields(validBody()..['message'] = 'a' * 5001), <String>[
        'message',
      ]);
    });

    test('treats non-string JSON values as missing', () {
      expect(rejectedFields(validBody()..['name'] = 42), <String>['name']);
    });

    test('traps a submission with the honeypot filled', () {
      final ContactValidation result = ContactRequest.validate(
        validBody()..['website'] = 'http://spam.example',
      );

      expect(result, isA<ContactTrapped>());
      expect((result as ContactTrapped).reason, 'honeypot');
    });

    test('honeypot outranks field validation', () {
      final ContactValidation result =
          ContactRequest.validate(<String, Object?>{
            'name': '',
            'email': 'not-an-email',
            'message': '',
            'website': 'http://spam.example',
          });

      expect(result, isA<ContactTrapped>());
    });
  });

  group('escapeHtml', () {
    test('escapes markup a visitor could inject into the email', () {
      expect(
        escapeHtml('<script>alert("x")</script>'),
        '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
      );
    });

    test('escapes ampersands first so entities are not doubled', () {
      expect(escapeHtml('a & <b>'), 'a &amp; &lt;b&gt;');
    });
  });
}
