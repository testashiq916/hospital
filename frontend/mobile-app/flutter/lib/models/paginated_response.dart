/// Wraps a Laravel `paginate()` JSON envelope:
/// `{ data: [...], current_page, last_page, per_page, total, ... }`.
class PaginatedResponse<T> {
  final List<T> data;
  final int currentPage;
  final int lastPage;
  final int total;

  const PaginatedResponse({
    required this.data,
    required this.currentPage,
    required this.lastPage,
    required this.total,
  });

  bool get hasMore => currentPage < lastPage;

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final rawData = (json['data'] as List?) ?? const [];
    return PaginatedResponse<T>(
      data: rawData
          .whereType<Map>()
          .map((e) => fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      currentPage: (json['current_page'] as num?)?.toInt() ?? 1,
      lastPage: (json['last_page'] as num?)?.toInt() ?? 1,
      total: (json['total'] as num?)?.toInt() ?? rawData.length,
    );
  }

  /// Some endpoints (e.g. today-queue) return a bare JSON array instead of a
  /// paginator. Wrap those uniformly so callers never have to special-case.
  factory PaginatedResponse.fromList(
    List<dynamic> json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final items = json
        .whereType<Map>()
        .map((e) => fromJson(Map<String, dynamic>.from(e)))
        .toList();
    return PaginatedResponse<T>(
      data: items,
      currentPage: 1,
      lastPage: 1,
      total: items.length,
    );
  }
}
