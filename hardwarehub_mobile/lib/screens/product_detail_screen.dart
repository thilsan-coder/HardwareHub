import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/product_model.dart';
import '../services/product_service.dart';
import '../widgets/status_badge.dart';
import 'product_form_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final int productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final ProductService _productService = ProductService();
  ProductModel? _product;
  bool _isLoading = true;
  bool _isDeleting = false;

  @override
  void initState() {
    super.initState();
    _loadProduct();
  }

  Future<void> _loadProduct() async {
    setState(() => _isLoading = true);
    try {
      final p = await _productService.getProduct(widget.productId);
      if (mounted) {
        setState(() {
          _product = p;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load product: $e'),
            backgroundColor: AppTheme.danger,
          ),
        );
      }
    }
  }

  void _navigateToEdit() async {
    if (_product == null) return;
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProductFormScreen(product: _product),
      ),
    );
    if (result == true) {
      _loadProduct();
    }
  }

  void _confirmDelete() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bgCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppTheme.borderSlate),
        ),
        title: Row(
          children: const [
            Icon(Icons.delete_sweep_rounded, color: AppTheme.danger, size: 24),
            SizedBox(width: 8),
            Text('Move to Recycle Bin?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 17)),
          ],
        ),
        content: Text(
          'Are you sure you want to delete "${_product?.name}"? It will be safely moved to the Recycle Bin and can be restored at any time.',
          style: const TextStyle(fontSize: 13, color: AppTheme.textMuted, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.danger,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _performDelete();
            },
            child: const Text('Move to Bin', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  Future<void> _performDelete() async {
    if (_product == null) return;
    setState(() => _isDeleting = true);

    try {
      final res = await _productService.deleteProduct(_product!.id);
      if (mounted) {
        setState(() => _isDeleting = false);
        if (res.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.message ?? 'Product moved to Recycle Bin'),
              backgroundColor: AppTheme.success,
            ),
          );
          Navigator.pop(context, true); // Return true to refresh caller
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.message ?? 'Failed to delete product'),
              backgroundColor: AppTheme.danger,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isDeleting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error deleting product: $e'),
            backgroundColor: AppTheme.danger,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppTheme.bgDark,
        appBar: AppBar(title: const Text('Product Details')),
        body: const Center(child: CircularProgressIndicator(color: AppTheme.primaryLight)),
      );
    }

    if (_product == null) {
      return Scaffold(
        backgroundColor: AppTheme.bgDark,
        appBar: AppBar(title: const Text('Product Details')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline_rounded, size: 48, color: AppTheme.danger),
              const SizedBox(height: 12),
              const Text('Product not found or has been removed.', style: TextStyle(color: AppTheme.textMuted)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }

    final p = _product!;
    final isOut = p.isOutOfStock;
    final isLow = p.isLowStock;
    final stockProgress = p.quantity > 50 ? 1.0 : (p.quantity / 50.0).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        title: Text(p.name, overflow: TextOverflow.ellipsis),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined, color: AppTheme.textMuted),
            tooltip: 'Edit SKU',
            onPressed: _navigateToEdit,
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded, color: AppTheme.danger),
            tooltip: 'Move to Recycle Bin',
            onPressed: _confirmDelete,
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: AppTheme.bgSurface,
          border: Border(top: BorderSide(color: AppTheme.borderSlate, width: 1)),
        ),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _confirmDelete,
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.danger,
                  side: const BorderSide(color: AppTheme.danger),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.delete_sweep_outlined, size: 18),
                label: const Text('Recycle Bin', style: TextStyle(fontWeight: FontWeight.w800)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primary.withAlpha(120),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton.icon(
                  onPressed: _navigateToEdit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.edit_rounded, size: 18, color: Colors.white),
                  label: const Text('Edit Details', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white)),
                ),
              ),
            ),
          ],
        ),
      ),
      body: _isDeleting
          ? const Center(child: CircularProgressIndicator(color: AppTheme.danger))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Main Hero Product Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.bgCard,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppTheme.borderSlate, width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(100),
                          blurRadius: 20,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            StatusBadge(status: p.category, isCategory: true),
                            StatusBadge(status: p.status),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text(
                          p.name,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.textWhite,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Text(
                              'SKU CODE: ',
                              style: TextStyle(fontSize: 11, color: AppTheme.textDim, fontWeight: FontWeight.w800, letterSpacing: 0.6),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppTheme.bgSurface,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: AppTheme.borderSlate),
                              ),
                              child: Text(
                                p.sku,
                                style: const TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.primaryLight,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 18),
                        const Divider(color: AppTheme.borderSlate, height: 1),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'UNIT PRICE',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.8,
                                    color: AppTheme.textDim,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '\$${p.price.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w900,
                                    color: AppTheme.primaryLight,
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Text(
                                  'INVENTORY ASSET VALUE',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.8,
                                    color: AppTheme.textDim,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '\$${(p.price * p.quantity).toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w900,
                                    color: AppTheme.textWhite,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Stock Level Health Card with Gauge
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.bgCard,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppTheme.borderSlate),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'WAREHOUSE STOCK LEVEL',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                            color: AppTheme.textDim,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isOut
                                    ? AppTheme.dangerBg
                                    : isLow
                                        ? AppTheme.warningBg
                                        : AppTheme.successBg,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: isOut
                                      ? AppTheme.danger.withAlpha(100)
                                      : isLow
                                          ? AppTheme.warning.withAlpha(100)
                                          : AppTheme.success.withAlpha(100),
                                ),
                              ),
                              child: Icon(
                                isOut
                                    ? Icons.error_outline_rounded
                                    : isLow
                                        ? Icons.warning_amber_rounded
                                        : Icons.check_circle_outline_rounded,
                                color: isOut
                                    ? AppTheme.danger
                                    : isLow
                                        ? AppTheme.warning
                                        : AppTheme.success,
                                size: 28,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${p.quantity} Units in Warehouse',
                                    style: const TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w900,
                                      color: AppTheme.textWhite,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    isOut
                                        ? 'Out of stock — immediate restock needed!'
                                        : isLow
                                            ? 'Below low stock alert (${p.lowStockThreshold} units)'
                                            : 'Stock is healthy (Alert threshold: ${p.lowStockThreshold})',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                      color: isOut
                                          ? AppTheme.danger
                                          : isLow
                                              ? AppTheme.warning
                                              : AppTheme.textMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: stockProgress,
                            minHeight: 6,
                            backgroundColor: AppTheme.bgSurface,
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
                  const SizedBox(height: 16),

                  // Description Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.bgCard,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppTheme.borderSlate),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'PRODUCT SPECIFICATIONS',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                            color: AppTheme.textDim,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          p.description != null && p.description!.isNotEmpty
                              ? p.description!
                              : 'No technical description provided for this product.',
                          style: TextStyle(
                            fontSize: 13,
                            height: 1.5,
                            color: p.description != null && p.description!.isNotEmpty
                                ? AppTheme.textMuted
                                : AppTheme.textDim,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }
}
