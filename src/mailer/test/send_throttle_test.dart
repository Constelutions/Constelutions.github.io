import 'package:mailer/send_throttle.dart';
import 'package:test/test.dart';

void main() {
  group('SendThrottle', () {
    test('allows a burst up to the hourly cap', () {
      final SendThrottle throttle = SendThrottle(maxPerHour: 4);

      for (var i = 0; i < 4; i++) {
        expect(throttle.tryAcquire(), isTrue);
      }
    });

    test('rejects once the bucket is empty', () {
      final SendThrottle throttle = SendThrottle(maxPerHour: 4);

      for (var i = 0; i < 4; i++) {
        throttle.tryAcquire();
      }

      expect(throttle.tryAcquire(), isFalse);
    });

    test('refills a token after a fraction of the window', () {
      DateTime now = DateTime.utc(2026, 1, 1);
      final SendThrottle throttle = SendThrottle(maxPerHour: 4, now: () => now);

      for (var i = 0; i < 4; i++) {
        expect(throttle.tryAcquire(), isTrue);
      }
      expect(throttle.tryAcquire(), isFalse);

      // 1/4 of the hour at cap 4 refills exactly one token.
      now = now.add(const Duration(minutes: 15));
      expect(throttle.tryAcquire(), isTrue);
      expect(throttle.tryAcquire(), isFalse);
    });

    test('reports seconds until the next token', () {
      DateTime now = DateTime.utc(2026, 1, 1);
      final SendThrottle throttle = SendThrottle(maxPerHour: 4, now: () => now);

      expect(throttle.retryAfterSeconds, 0);

      for (var i = 0; i < 4; i++) {
        throttle.tryAcquire();
      }

      final int retryAfter = throttle.retryAfterSeconds;
      expect(retryAfter, greaterThan(0));
      expect(retryAfter, lessThanOrEqualTo(900));

      now = now.add(Duration(seconds: retryAfter));
      expect(throttle.tryAcquire(), isTrue);
    });
  });
}
