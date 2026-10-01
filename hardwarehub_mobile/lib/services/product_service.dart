import '../models/dashboard_stats_model.dart';
import '../models/product_model.dart';
import 'api_service.dart';

class ProductService {
  static final ProductService _instance = ProductService._internal();
  factory ProductService() => _instance;
  ProductService._internal();

  final ApiService _api = ApiService();

  // 1. Dashboard Metrics Summary
  Future<DashboardStatsModel?> getDashboardSummary() async {
    final res = await _api.get('/dashboard/summary');
    if (res.success && res.data != null && res.data['data'] != null) {
      return DashboardStatsModel.fromJson(res.data['data']);
    }
    return null;
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

    if (res.success && res.data != null && res.data['products'] is List) {
      return (res.data['products'] as List)
          .map((item) => ProductModel.fromJson(item))
          .toList();
    }
    return [];
  }

  // 3. Get Single Product
  Future<ProductModel?> getProduct(int id) async {
    final res = await _api.get('/products/$id');
    if (res.success && res.data != null && res.data['product'] != null) {
      return ProductModel.fromJson(res.data['product']);
    }
    return null;
  }

  // 4. Create Product
  Future<ApiResponse> createProduct(Map<String, dynamic> data) async {
    return await _api.post('/products', data);
  }

  // 5. Update Product
  Future<ApiResponse> updateProduct(int id, Map<String, dynamic> data) async {
    return await _api.put('/products/$id', data);
  }

  // 6. Soft Delete Product (Move to Recycle Bin)
  Future<ApiResponse> deleteProduct(int id) async {
    return await _api.delete('/products/$id');
  }

  // 7. Get Recycle Bin Products List
  Future<List<ProductModel>> getRecycleBinProducts({String? search}) async {
    final queryString = search != null && search.trim().isNotEmpty
        ? '?search=${Uri.encodeComponent(search.trim())}'
        : '';

    final res = await _api.get('/recycle-bin$queryString');

    if (res.success && res.data != null && res.data['products'] is List) {
      return (res.data['products'] as List)
          .map((item) => ProductModel.fromJson(item))
          .toList();
    }
    return [];
  }

  // 8. Restore Product from Recycle Bin
  Future<ApiResponse> restoreProduct(int id) async {
    return await _api.post('/recycle-bin/$id/restore', {});
  }

  // 9. Permanently Force Delete Product
  Future<ApiResponse> forceDeleteProduct(int id) async {
    return await _api.delete('/recycle-bin/$id/force-delete');
  }
}
