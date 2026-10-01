class DashboardStatsModel {
  final int totalProducts;
  final int activeProducts;
  final int healthyStockCount;
  final int lowStockCount;
  final int outOfStockCount;
  final double totalInventoryValue;

  DashboardStatsModel({
    required this.totalProducts,
    required this.activeProducts,
    required this.healthyStockCount,
    required this.lowStockCount,
    required this.outOfStockCount,
    required this.totalInventoryValue,
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) {
    return DashboardStatsModel(
      totalProducts: json['total_products'] is int ? json['total_products'] : int.tryParse('${json['total_products']}') ?? 0,
      activeProducts: json['active_products'] is int ? json['active_products'] : int.tryParse('${json['active_products']}') ?? 0,
      healthyStockCount: json['healthy_stock_count'] is int ? json['healthy_stock_count'] : int.tryParse('${json['healthy_stock_count']}') ?? 0,
      lowStockCount: json['low_stock_count'] is int ? json['low_stock_count'] : int.tryParse('${json['low_stock_count']}') ?? 0,
      outOfStockCount: json['out_of_stock_count'] is int ? json['out_of_stock_count'] : int.tryParse('${json['out_of_stock_count']}') ?? 0,
      totalInventoryValue: json['total_inventory_value'] != null
          ? (double.tryParse('${json['total_inventory_value']}') ?? 0.0)
          : 0.0,
    );
  }
}
