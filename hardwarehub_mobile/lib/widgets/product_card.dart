import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/product_model.dart';
import 'status_badge.dart';

class ProductCard extends StatelessWidget {
  final ProductModel product;
  final VoidCallback onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isOut = product.isOutOfStock;
    final isLow = product.isLowStock;
    final stockProgress = product.quantity > 50 ? 1.0 : (product.quantity / 50.0).clamp(0.0, 1.0);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isOut
              ? AppTheme.danger.withAlpha(80)
              : isLow
                  ? AppTheme.warning.withAlpha(80)
                  : AppTheme.slate200,
          width: 1,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: onTap,
          splashColor: AppTheme.primary.withAlpha(30),
          highlightColor: AppTheme.primary.withAlpha(15),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Category Badge, SKU, Status Badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        StatusBadge(status: product.category, isCategory: true),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppTheme.slate100,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppTheme.slate200, width: 0.8),
                          ),
                          child: Text(
                            product.sku,
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.slate700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    StatusBadge(status: product.status),
                  ],
                ),
                const SizedBox(height: 12),

                // Middle: Product Name & Glowing Price Tag
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        product.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.slate900,
                          letterSpacing: -0.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withAlpha(80),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        '\$${product.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                if (product.description != null && product.description!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    product.description!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.slate600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 14),

                // Stock Health Meter & Status Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppTheme.slate50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.slate200, width: 1),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                isOut
                                    ? Icons.cancel_outlined
                                    : isLow
                                        ? Icons.warning_amber_rounded
                                        : Icons.inventory_2_outlined,
                                size: 15,
                                color: isOut
                                    ? AppTheme.danger
                                    : isLow
                                        ? AppTheme.warning
                                        : AppTheme.success,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                isOut
                                    ? '0 Units (Out of Stock)'
                                    : isLow
                                        ? '${product.quantity} Units (Low Stock Alert)'
                                        : '${product.quantity} Units in Inventory',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: isOut
                                      ? AppTheme.danger
                                      : isLow
                                          ? AppTheme.warning
                                          : AppTheme.slate800,
                                ),
                              ),
                            ],
                          ),
                          const Icon(
                            Icons.arrow_forward_ios_rounded,
                            size: 13,
                            color: AppTheme.slate400,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      // Progress Bar
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: stockProgress,
                          minHeight: 4,
                          backgroundColor: AppTheme.slate200,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            isOut
                                ? AppTheme.danger
                                : isLow
                                    ? AppTheme.warning
                                    : AppTheme.success,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
