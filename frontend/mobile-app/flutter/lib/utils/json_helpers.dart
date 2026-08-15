/// Laravel's Eloquent `decimal:N` casts (used throughout billing/lab/doctor
/// fee fields) serialize to JSON as **strings** (e.g. `"1500.00"`), not
/// numbers — unlike plain `integer`/`float` columns. A naive `as num?` cast
/// throws a [TypeError] the moment such a field is null-free but
/// string-typed. These helpers accept both shapes so model parsing never
/// depends on which cast a given backend column happens to use.
double? asDouble(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value);
  return null;
}

int? asInt(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? double.tryParse(value)?.toInt();
  return null;
}
