class ProductModel {
  final int id;
  final String name;
  final String sku;
  final String? description;
  final double price;
  final int quantity;
  final int lowStockThreshold;
  final String category;
  final String status;
  final String? deletedAt;
  final String? deletedAtHuman;
  final String? createdAt;

  ProductModel({
    required this.id,
    required this.name,
    required this.sku,
    this.description,
    required this.price,
    required this.quantity,
    this.lowStockThreshold = 10,
    required this.category,
    required this.status,
    this.deletedAt,
    this.deletedAtHuman,
    this.createdAt,
  });

  bool get isActive => status.toLowerCase() == 'active';
  bool get isOutOfStock => quantity <= 0;
  bool get isLowStock => quantity > 0 && quantity <= lowStockThreshold;
  bool get isHealthyStock => quantity > lowStockThreshold;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] is int ? json['id'] : int.tryParse('${json['id']}') ?? 0,
      name: json['name'] ?? '',
      sku: json['sku'] ?? '',
      description: json['description'],
      price: json['price'] != null ? (double.tryParse('${json['price']}') ?? 0.0) : 0.0,
      quantity: json['quantity'] != null ? (int.tryParse('${json['quantity']}') ?? 0) : 0,
      lowStockThreshold: json['low_stock_threshold'] != null
          ? (int.tryParse('${json['low_stock_threshold']}') ?? 10)
          : 10,
      category: json['category'] ?? 'General',
      status: json['status'] ?? 'active',
      deletedAt: json['deleted_at'],
      deletedAtHuman: json['deleted_at_human'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'sku': sku,
      'description': description,
      'price': price,
      'quantity': quantity,
      'low_stock_threshold': lowStockThreshold,
      'category': category,
      'status': status,
    };
  }
}
