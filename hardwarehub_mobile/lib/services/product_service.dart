import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/dashboard_stats_model.dart';
import '../models/product_model.dart';
import 'api_service.dart';

class ProductService {
  static final ProductService _instance = ProductService._internal();
  factory ProductService() => _instance;
  ProductService._internal();

  final ApiService _api = ApiService();

  static const String _keyCachedSummary = 'cached_dashboard_summary_v2';
  static const String _keyCachedProducts = 'cached_products_list_v2';

  // In-memory cache
  DashboardStatsModel? _inMemorySummary;
  List<ProductModel>? _inMemoryProducts;

  Future<DashboardStatsModel?> getCachedDashboardSummary() async {
    if (_inMemorySummary != null) return _inMemorySummary;
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = prefs.getString(_keyCachedSummary);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        final decoded = jsonDecode(jsonStr);
        if (decoded is Map<String, dynamic>) {
          _inMemorySummary = DashboardStatsModel.fromJson(decoded);
          return _inMemorySummary;
        }
      }
    } catch (_) {}
    return null;
  }

  // 1. Dashboard Metrics Summary
  Future<DashboardStatsModel?> getDashboardSummary() async {
    final res = await _api.get('/dashboard/summary');
    if (res.success && res.data != null) {
      final map = res.data['data'] ?? res.data['summary'] ?? (res.data is Map<String, dynamic> ? res.data : null);
      if (map != null && map is Map<String, dynamic>) {
        final model = DashboardStatsModel.fromJson(map);
        _inMemorySummary = model;
        try {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(_keyCachedSummary, jsonEncode(map));
        } catch (_) {}
        return model;
      }
    }
    return await getCachedDashboardSummary();
  }

  // 2. Products List (with search & filter)
  Future<List<ProductModel>> getProducts({String? search, String? category, String? status}) async {
    final queryParams = <String, String>{};
    if (search != null && search.trim().isNotEmpty) queryParams['search'] = search.trim();
    if (category != null && category != 'All') queryParams['category'] = category;
    if (status != null && status != 'All') queryParams['status'] = status.toLowerCase();

    final queryString = queryParams.isNotEmpty
        ? '?${queryParams.entries.map((e) => '${e.key}=${Uri.encodeComponent(e.value)}').join('&')}'
        : '';

    final res = await _api.get('/products$queryString');

    if (res.success && res.data != null) {
      final list = res.data['data'] ?? res.data['products'] ?? (res.data is List ? res.data : null);
      if (list is List) {
        final items = list.map((item) => ProductModel.fromJson(item)).toList();
        if (search == null && (category == null || category == 'All') && (status == null || status == 'All')) {
          _inMemoryProducts = items;
          try {
            final prefs = await SharedPreferences.getInstance();
            await prefs.setString(_keyCachedProducts, jsonEncode(list));
          } catch (_) {}
        }
        return items;
      }
    }

    // If request failed on default view, return cached products
    if (search == null && (category == null || category == 'All') && (status == null || status == 'All')) {
      if (_inMemoryProducts != null && _inMemoryProducts!.isNotEmpty) {
        return _inMemoryProducts!;
      }
      try {
        final prefs = await SharedPreferences.getInstance();
        final jsonStr = prefs.getString(_keyCachedProducts);
        if (jsonStr != null && jsonStr.isNotEmpty) {
          final decoded = jsonDecode(jsonStr);
          if (decoded is List) {
            _inMemoryProducts = decoded.map((i) => ProductModel.fromJson(i)).toList();
            return _inMemoryProducts!;
          }
        }
      } catch (_) {}
    }

    return _inMemoryProducts ?? [];
  }

  // 3. Get Single Product
  Future<ProductModel?> getProduct(int id) async {
    final res = await _api.get('/products/$id');
    if (res.success && res.data != null) {
      final obj = res.data['data'] ?? res.data['product'] ?? (res.data is Map ? res.data : null);
      if (obj != null && obj is Map<String, dynamic>) {
        return ProductModel.fromJson(obj);
      }
    }
    return null;
  }

  // 4. Create Product
  Future<ApiResponse> createProduct(Map<String, dynamic> data) async {
    final res = await _api.post('/products', data);
    if (res.success) {
      // Invalidate cache to trigger fresh pull
      getDashboardSummary();
    }
    return res;
  }

  // 5. Update Product
  Future<ApiResponse> updateProduct(int id, Map<String, dynamic> data) async {
    final res = await _api.put('/products/$id', data);
    if (res.success) {
      getDashboardSummary();
    }
    return res;
  }

  // 6. Soft Delete Product (Move to Recycle Bin)
  Future<ApiResponse> deleteProduct(int id) async {
    final res = await _api.delete('/products/$id');
    if (res.success) {
      getDashboardSummary();
    }
    return res;
  }

  // 7. Get Recycle Bin Products List
  Future<List<ProductModel>> getRecycleBinProducts({String? search}) async {
    final queryString = search != null && search.trim().isNotEmpty
        ? '?search=${Uri.encodeComponent(search.trim())}'
        : '';

    final res = await _api.get('/recycle-bin$queryString');

    if (res.success && res.data != null) {
      final list = res.data['products'] ?? res.data['data'] ?? (res.data is List ? res.data : null);
      if (list is List) {
        return list.map((item) => ProductModel.fromJson(item)).toList();
      }
    }
    return [];
  }

  // 8. Restore Product from Recycle Bin
  Future<ApiResponse> restoreProduct(int id) async {
    final res = await _api.post('/recycle-bin/$id/restore', {});
    if (res.success) {
      getDashboardSummary();
    }
    return res;
  }

  // 9. Permanently Force Delete Product
  Future<ApiResponse> forceDeleteProduct(int id) async {
    return await _api.delete('/recycle-bin/$id/force-delete');
  }
}
