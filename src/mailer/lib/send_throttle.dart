/// Caps total sends per hour across all clients, protecting the Resend quota
/// from distributed spam that per-IP rate limiting cannot see.
///
/// A simple in-memory token bucket. State is lost on restart — the bucket
/// refills to full — which is acceptable for a single container and is
/// documented in specs/contact-form-anti-spam.md.
final class SendThrottle {
  SendThrottle({required int maxPerHour, DateTime Function()? now})
    : _maxPerHour = maxPerHour,
      _now = now ?? DateTime.now,
      _tokens = maxPerHour.toDouble() {
    _lastRefill = _now();
  }

  final int _maxPerHour;
  final DateTime Function() _now;

  double _tokens;
  late DateTime _lastRefill;

  /// Takes a token if one is available. False means "answer 429".
  bool tryAcquire() {
    _refill();
    if (_tokens < 1) return false;
    _tokens -= 1;
    return true;
  }

  /// Whole seconds until the next token exists. Zero while tokens remain.
  int get retryAfterSeconds {
    _refill();
    if (_tokens >= 1) return 0;
    final double tokensNeeded = 1 - _tokens;
    final double secondsPerToken = 3600 / _maxPerHour;
    return (tokensNeeded * secondsPerToken).ceil();
  }

  void _refill() {
    final DateTime now = _now();
    final double elapsedSeconds =
        now.difference(_lastRefill).inMicroseconds / 1e6;
    if (elapsedSeconds <= 0) return;

    final double refilled = elapsedSeconds * (_maxPerHour / 3600);
    _tokens = (_tokens + refilled).clamp(0, _maxPerHour.toDouble());
    _lastRefill = now;
  }
}
