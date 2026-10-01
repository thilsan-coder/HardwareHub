import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/stock_movement_model.dart';

class StockMovementCard extends StatelessWidget {
  final StockMovementModel movement;
  final VoidCallback onTap;

  const StockMovementCard({
    super.key,
    required this.movement,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color typeColor;
    Color typeBg;
    IconData typeIcon;
    String typeLabel;
    String sign;

    if (movement.isIn) {
      typeColor = AppTheme.success;
      typeBg = AppTheme.successBg;
      typeIcon = Icons.arrow_downward_rounded;
      typeLabel = 'STOCK IN';
      sign = '+';
    } else if (movement.isOut) {
      typeColor = AppTheme.danger;
      typeBg = AppTheme.dangerBg;
      typeIcon = Icons.arrow_upward_rounded;
      typeLabel = 'STOCK OUT';
      sign = '-';
    } else if (movement.isDamage) {
      typeColor = const Color(0xFFE11D48); // Rose 600
      typeBg = const Color(0xFFFFF1F2);
      typeIcon = Icons.report_problem_rounded;
      typeLabel = 'DAMAGE';
      sign = '-';
    } else {
      typeColor = AppTheme.primary;
      typeBg = AppTheme.primaryLight;
      typeIcon = Icons.tune_rounded;
      typeLabel = 'ADJUSTMENT';
      sign = movement.quantityChanged >= 0 ? '+' : '';
    }

    final product = movement.product;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.slate200, width: 1),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Type Pill, SKU & Timestamp
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: typeBg,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: typeColor.withAlpha(80), width: 1),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(typeIcon, color: typeColor, size: 12),
                              const SizedBox(width: 4),
                              Text(
                                typeLabel,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.5,
                                  color: typeColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (product != null) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.slate100,
                              borderRadius: BorderRadius.circular(6),
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
                      ],
                    ),
                    Text(
                      movement.createdAt,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppTheme.slate400,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Middle: Product Name & Quantity Changed
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        product != null ? product.name : 'Unknown Product',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.slate900,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '$sign${movement.quantityChanged.abs()} units',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: typeColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),

                // Reason / Audit Memo
                Text(
                  movement.reason,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.slate600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),

                // Bottom: Stock Delta Progression (Prev -> New)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.slate50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.slate200, width: 0.8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Audit Trail: ${movement.previousStock} → ${movement.newStock} units',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.slate700,
                        ),
                      ),
                      Text(
                        'By: ${movement.userName ?? 'Admin'}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.slate500,
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
