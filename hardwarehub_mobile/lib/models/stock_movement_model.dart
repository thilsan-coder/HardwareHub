class StockMovementProduct {
  final int id;
  final String name;
  final String sku;
  final String category;
  final double price;
  final bool isDeleted;

  StockMovementProduct({
    required this.id,
    required this.name,
    required this.sku,
    required this.category,
    required this.price,
    this.isDeleted = false,
  });

  factory StockMovementProduct.fromJson(Map<String, dynamic> json) {
    return StockMovementProduct(
      id: json['id'] is int ? json['id'] : int.tryParse('${json['id']}') ?? 0,
      name: json['name'] ?? '',
      sku: json['sku'] ?? '',
      category: json['category'] ?? 'General',
      price: json['price'] != null ? (double.tryParse('${json['price']}') ?? 0.0) : 0.0,
      isDeleted: json['is_deleted'] == true,
    );
  }
}

class StockMovementModel {
  final int id;
  final String type; // 'in', 'out', 'adjustment', 'damage'
  final int quantityChanged;
  final int previousStock;
  final int newStock;
  final String reason;
  final String createdAt;
  final StockMovementProduct? product;
  final String? userName;
  final String? deletedAt;

  StockMovementModel({
    required this.id,
    required this.type,
    required this.quantityChanged,
    required this.previousStock,
    required this.newStock,
    required this.reason,
    required this.createdAt,
    this.product,
    this.userName,
    this.deletedAt,
  });

  bool get isIn => type.toLowerCase() == 'in';
  bool get isOut => type.toLowerCase() == 'out';
  bool get isAdjustment => type.toLowerCase() == 'adjustment';
  bool get isDamage => type.toLowerCase() == 'damage';

  factory StockMovementModel.fromJson(Map<String, dynamic> json) {
    return StockMovementModel(
      id: json['id'] is int ? json['id'] : int.tryParse('${json['id']}') ?? 0,
      type: json['type'] ?? 'in',
      quantityChanged: json['quantity_changed'] is int
          ? json['quantity_changed']
          : int.tryParse('${json['quantity_changed']}') ?? 0,
      previousStock: json['previous_stock'] is int
          ? json['previous_stock']
          : int.tryParse('${json['previous_stock']}') ?? 0,
      newStock: json['new_stock'] is int
          ? json['new_stock']
          : int.tryParse('${json['new_stock']}') ?? 0,
      reason: json['reason'] ?? 'Standard Stock Movement',
      createdAt: json['created_at'] ?? 'Just now',
      product: json['product'] != null && json['product'] is Map<String, dynamic>
          ? StockMovementProduct.fromJson(json['product'])
          : null,
      userName: json['user'] != null && json['user'] is Map ? json['user']['name'] : 'Admin',
      deletedAt: json['deleted_at'],
    );
  }
}
