import '../models/stock_movement_model.dart';
import 'api_service.dart';

class StockMovementService {
  static final StockMovementService _instance = StockMovementService._internal();
  factory StockMovementService() => _instance;
  StockMovementService._internal();

  final ApiService _api = ApiService();

  // 1. Get Stock Movements List
  Future<List<StockMovementModel>> getStockMovements({
    String? search,
    String? type,
    int? productId,
  }) async {
    final queryParams = <String, String>{};
    if (search != null && search.trim().isNotEmpty) queryParams['search'] = search.trim();
    if (type != null && type != 'All') queryParams['type'] = type.toLowerCase();
    if (productId != null) queryParams['product_id'] = productId.toString();

    final queryString = queryParams.isNotEmpty
        ? '?${queryParams.entries.map((e) => '${e.key}=${Uri.encodeComponent(e.value)}').join('&')}'
        : '';

    final res = await _api.get('/stock-movements$queryString');

    if (res.success && res.data != null) {
      final list = res.data['movements'] ?? res.data['data'] ?? (res.data is List ? res.data : null);
      if (list is List) {
        return list.map((item) => StockMovementModel.fromJson(item)).toList();
      }
    }
    return [];
  }

  // 2. Get Single Stock Movement
  Future<StockMovementModel?> getStockMovement(int id) async {
    final res = await _api.get('/stock-movements/$id');
    if (res.success && res.data != null && res.data['movement'] != null) {
      return StockMovementModel.fromJson(res.data['movement']);
    }
    return null;
  }

  // 3. Create Stock Movement (IN / OUT / ADJUSTMENT / DAMAGE)
  Future<ApiResponse> createStockMovement(Map<String, dynamic> data) async {
    return await _api.post('/stock-movements', data);
  }

  // 4. Update Stock Movement
  Future<ApiResponse> updateStockMovement(int id, Map<String, dynamic> data) async {
    return await _api.put('/stock-movements/$id', data);
  }

  // 5. Soft Delete Stock Movement
  Future<ApiResponse> deleteStockMovement(int id) async {
    return await _api.delete('/stock-movements/$id');
  }

  // 6. Recycle Bin Movements
  Future<List<StockMovementModel>> getRecycleBinStockMovements({String? search}) async {
    final queryString = search != null && search.trim().isNotEmpty
        ? '?search=${Uri.encodeComponent(search.trim())}'
        : '';

    final res = await _api.get('/recycle-bin/stock-movements$queryString');

    if (res.success && res.data != null) {
      final list = res.data['movements'] ?? res.data['data'] ?? (res.data is List ? res.data : null);
      if (list is List) {
        return list.map((item) => StockMovementModel.fromJson(item)).toList();
      }
    }
    return [];
  }

  // 7. Restore Movement
  Future<ApiResponse> restoreStockMovement(int id) async {
    return await _api.post('/recycle-bin/stock-movements/$id/restore', {});
  }

  // 8. Force Delete Movement
  Future<ApiResponse> forceDeleteStockMovement(int id) async {
    return await _api.delete('/recycle-bin/stock-movements/$id/force-delete');
  }
}
