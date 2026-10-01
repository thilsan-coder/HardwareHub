import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/product_model.dart';
import '../models/stock_movement_model.dart';
import '../services/product_service.dart';
import '../services/stock_movement_service.dart';

class StockMovementFormScreen extends StatefulWidget {
  final int? initialProductId;
  final StockMovementModel? movement;

  const StockMovementFormScreen({
    super.key,
    this.initialProductId,
    this.movement,
  });

  @override
  State<StockMovementFormScreen> createState() => _StockMovementFormScreenState();
}

class _StockMovementFormScreenState extends State<StockMovementFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final StockMovementService _movementService = StockMovementService();
  final ProductService _productService = ProductService();

  List<ProductModel> _products = [];
  ProductModel? _selectedProduct;
  late String _type; // 'in', 'out', 'adjustment', 'damage'
  late TextEditingController _quantityController;
  late TextEditingController _reasonController;

  bool _isLoadingProducts = true;
  bool _isSubmitting = false;

  bool get isEdit => widget.movement != null;

  @override
  void initState() {
    super.initState();
    final m = widget.movement;
    _type = m?.type ?? 'in';
    _quantityController = TextEditingController(
      text: m != null ? m.quantityChanged.abs().toString() : '1',
    );
    _reasonController = TextEditingController(text: m?.reason ?? '');
    _loadProducts();
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoadingProducts = true);
    try {
      final items = await _productService.getProducts();
      if (mounted) {
        setState(() {
          _products = items;
          if (widget.movement != null && widget.movement!.product != null) {
            _selectedProduct = items.firstWhere(
              (p) => p.id == widget.movement!.product!.id,
              orElse: () => items.first,
            );
          } else if (widget.initialProductId != null) {
            _selectedProduct = items.firstWhere(
              (p) => p.id == widget.initialProductId,
              orElse: () => items.first,
            );
          } else if (items.isNotEmpty) {
            _selectedProduct = items.first;
          }
          _isLoadingProducts = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingProducts = false);
    }
  }

  int get anticipatedNewStock {
    if (_selectedProduct == null) return 0;
    final qty = int.tryParse(_quantityController.text.trim()) ?? 0;
    int baseStock = _selectedProduct!.quantity;

    if (isEdit && widget.movement != null && widget.movement!.product?.id == _selectedProduct!.id) {
      if (widget.movement!.type == 'in') {
        baseStock = (baseStock - widget.movement!.quantityChanged.abs()).clamp(0, 999999).toInt();
      } else if (widget.movement!.type == 'out' || widget.movement!.type == 'damage') {
        baseStock += widget.movement!.quantityChanged.abs();
      } else if (widget.movement!.type == 'adjustment') {
        baseStock = widget.movement!.previousStock;
      }
    }

    if (_type == 'in') {
      return baseStock + qty;
    } else if (_type == 'out' || _type == 'damage') {
      return (baseStock - qty).clamp(0, 999999).toInt();
    } else {
      return qty;
    }
  }

  Future<void> _submitMovement() async {
    if (!_formKey.currentState!.validate() || _selectedProduct == null) return;

    final qty = int.tryParse(_quantityController.text.trim()) ?? 0;

    int effectiveAvailable = _selectedProduct!.quantity;
    if (isEdit && widget.movement != null && widget.movement!.product?.id == _selectedProduct!.id) {
      if (widget.movement!.type == 'out' || widget.movement!.type == 'damage') {
        effectiveAvailable += widget.movement!.quantityChanged.abs();
      } else if (widget.movement!.type == 'in') {
        effectiveAvailable = (effectiveAvailable - widget.movement!.quantityChanged.abs()).clamp(0, 999999).toInt();
      }
    }

    if ((_type == 'out' || _type == 'damage') && qty > effectiveAvailable) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Cannot dispatch $qty units! Available stock is only $effectiveAvailable.'),
          backgroundColor: AppTheme.danger,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final payload = {
      'product_id': _selectedProduct!.id,
      'type': _type,
      'quantity': qty,
      'quantity_changed': qty,
      'reason': _reasonController.text.trim().isEmpty ? 'Manual stock update' : _reasonController.text.trim(),
    };

    try {
      final res = isEdit
          ? await _movementService.updateStockMovement(widget.movement!.id, payload)
          : await _movementService.createStockMovement(payload);

      if (mounted) {
        setState(() => _isSubmitting = false);
        if (res.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.message ?? (isEdit ? 'Stock movement updated successfully' : 'Stock movement recorded successfully')),
              backgroundColor: AppTheme.success,
            ),
          );
          Navigator.pop(context, true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.message ?? 'Failed to record movement'),
              backgroundColor: AppTheme.danger,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: AppTheme.danger,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.slate50,
      appBar: AppBar(
        title: Text(isEdit ? 'Edit Stock Movement' : 'Log Stock Movement'),
      ),
      body: _isLoadingProducts
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Product Selection Card
                    _buildCard(
                      title: 'PRODUCT SELECTION',
                      icon: Icons.inventory_2_outlined,
                      children: [
                        DropdownButtonFormField<ProductModel>(
                          initialValue: _selectedProduct,
                          isExpanded: true,
                          dropdownColor: Colors.white,
                          style: const TextStyle(color: AppTheme.slate900, fontSize: 14, fontWeight: FontWeight.w600),
                          decoration: const InputDecoration(
                            labelText: 'Select Product *',
                            prefixIcon: Icon(Icons.qr_code_rounded, color: AppTheme.primary),
                          ),
                          items: _products.map((p) {
                            return DropdownMenuItem(
                              value: p,
                              child: Text(
                                '${p.name} (${p.sku}) — ${p.quantity} in stock',
                                style: const TextStyle(color: AppTheme.slate900),
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedProduct = val);
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Movement Type Card
                    _buildCard(
                      title: 'MOVEMENT TYPE',
                      icon: Icons.tune_rounded,
                      children: [
                        Row(
                          children: [
                            _buildTypeOption('in', 'Stock In (+)', AppTheme.success, Icons.arrow_downward_rounded),
                            const SizedBox(width: 8),
                            _buildTypeOption('out', 'Stock Out (-)', AppTheme.danger, Icons.arrow_upward_rounded),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            _buildTypeOption('adjustment', 'Adjustment', AppTheme.primary, Icons.tune_rounded),
                            const SizedBox(width: 8),
                            _buildTypeOption('damage', 'Damaged (-)', const Color(0xFFE11D48), Icons.report_problem_rounded),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Quantity & Audit Memo Card
                    _buildCard(
                      title: 'QUANTITY & AUDIT MEMO',
                      icon: Icons.edit_note_rounded,
                      children: [
                        TextFormField(
                          controller: _quantityController,
                          keyboardType: TextInputType.number,
                          style: const TextStyle(color: AppTheme.slate900, fontSize: 15, fontWeight: FontWeight.w700),
                          onChanged: (val) => setState(() {}),
                          decoration: const InputDecoration(
                            labelText: 'Units Quantity *',
                            hintText: 'e.g. 10',
                            prefixIcon: Icon(Icons.numbers_rounded, color: AppTheme.primary),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) return 'Quantity is required';
                            final num = int.tryParse(val.trim());
                            if (num == null || num <= 0) return 'Must be a positive integer';
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _reasonController,
                          maxLines: 2,
                          style: const TextStyle(color: AppTheme.slate900, fontSize: 13, fontWeight: FontWeight.w500),
                          decoration: const InputDecoration(
                            labelText: 'Reason / Memo (Optional)',
                            hintText: 'e.g. Supplier delivery, customer dispatch, audit fix',
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Preview calculation banner
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppTheme.slate100,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.slate200),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('CURRENT STOCK', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.slate500)),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${_selectedProduct?.quantity ?? 0} units',
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.slate900),
                                  ),
                                ],
                              ),
                              const Icon(Icons.arrow_forward_rounded, color: AppTheme.slate400),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  const Text('ANTICIPATED STOCK', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.slate500)),
                                  const SizedBox(height: 2),
                                  Text(
                                    '$anticipatedNewStock units',
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.primary),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Submit Button
                    ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitMovement,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: AppTheme.primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.save_rounded, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  isEdit ? 'Update Movement & Stock' : 'Commit Stock Movement',
                                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                                ),
                              ],
                            ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Cancel', style: TextStyle(color: AppTheme.slate700, fontWeight: FontWeight.w700)),
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildTypeOption(String value, String label, Color color, IconData icon) {
    final isSelected = _type == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _type = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            color: isSelected ? color.withAlpha(25) : Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? color : AppTheme.slate200,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: isSelected ? color : AppTheme.slate500, size: 16),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected ? color : AppTheme.slate700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.slate200),
        boxShadow: const [
          BoxShadow(
            color: Color(0x04000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: AppTheme.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.slate800,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }
}
