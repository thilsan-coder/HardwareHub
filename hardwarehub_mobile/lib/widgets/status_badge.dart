import 'package:flutter/material.dart';
import '../config/theme.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final bool isCategory;

  const StatusBadge({
    super.key,
    required this.status,
    this.isCategory = false,
  });

  @override
  Widget build(BuildContext context) {
    if (isCategory) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: const Color(0xFFEEF2FF), // Indigo 50
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFFC7D2FE), width: 0.8), // Indigo 200
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 5,
              height: 5,
              decoration: const BoxDecoration(
                color: Color(0xFF4F46E5), // Indigo 600
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 5),
            Text(
              status.toUpperCase(),
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
                color: Color(0xFF4338CA), // Indigo 700
              ),
            ),
          ],
        ),
      );
    }

    final s = status.toLowerCase();
    final isActive = s == 'active';
    final isOut = s.contains('out') || s == 'out of stock';
    final isLow = s.contains('low') || s == 'low stock';

    Color textColor;
    Color bgColor;
    Color borderColor;
    String label;

    if (isActive) {
      textColor = AppTheme.success;
      bgColor = AppTheme.successBg;
      borderColor = AppTheme.success.withAlpha(80);
      label = 'ACTIVE';
    } else if (isOut) {
      textColor = AppTheme.danger;
      bgColor = AppTheme.dangerBg;
      borderColor = AppTheme.danger.withAlpha(80);
      label = 'OUT OF STOCK';
    } else if (isLow) {
      textColor = AppTheme.warning;
      bgColor = AppTheme.warningBg;
      borderColor = AppTheme.warning.withAlpha(80);
      label = 'LOW STOCK';
    } else {
      textColor = AppTheme.textMuted;
      bgColor = AppTheme.bgCard;
      borderColor = AppTheme.borderSlate;
      label = status.toUpperCase();
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: textColor,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: textColor.withAlpha(150),
                  blurRadius: 6,
                  spreadRadius: 1,
                ),
              ],
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.6,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
