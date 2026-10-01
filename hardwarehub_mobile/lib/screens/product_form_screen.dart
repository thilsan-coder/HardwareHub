import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../config/theme.dart';
import '../models/product_model.dart';
import '../services/product_service.dart';

class ProductFormScreen extends StatefulWidget {
  final ProductModel? product; // If null, mode is Create. If not null, mode is Edit.

  const ProductFormScreen({super.key, this.product});

  @override
  State<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends State<ProductFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final ProductService _productService = ProductService();

  late TextEditingController _nameController;
  late TextEditingController _skuController;
  late TextEditingController _descriptionController;
  late TextEditingController _priceController;
  late TextEditingController _quantityController;
  late TextEditingController _thresholdController;

  late String _category;
  late String _status;
  bool _isLoading = false;

  bool get isEdit => widget.product != null;

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _nameController = TextEditingController(text: p?.name ?? '');
    _skuController = TextEditingController(text: p?.sku ?? '');
    _descriptionController = TextEditingController(text: p?.description ?? '');
    _priceController = TextEditingController(text: p != null ? p.price.toStringAsFixed(2) : '');
    _quantityController = TextEditingController(text: p != null ? p.quantity.toString() : '0');
    _thresholdController = TextEditingController(text: p != null ? p.lowStockThreshold.toString() : '10');

    _category = p?.category ?? AppConstants.categories.first;
    _status = p?.status.toLowerCase() == 'inactive' ? 'inactive' : 'active';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _skuController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _quantityController.dispose();
    _thresholdController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final payload = {
      'name': _nameController.text.trim(),
      'sku': _skuController.text.trim().toUpperCase(),
      'description': _descriptionController.text.trim().isEmpty ? null : _descriptionController.text.trim(),
      'price': double.tryParse(_priceController.text.trim()) ?? 0.0,
      'quantity': int.tryParse(_quantityController.text.trim()) ?? 0,
      'low_stock_threshold': int.tryParse(_thresholdController.text.trim()) ?? 10,
      'category': _category,
      'status': _status,
    };

    try {
      final res = isEdit
          ? await _productService.updateProduct(widget.product!.id, payload)
          : await _productService.createProduct(payload);

      if (mounted) {
        setState(() => _isLoading = false);

        if (res.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.message ?? (isEdit ? 'Product updated successfully' : 'Product created successfully')),
              backgroundColor: AppTheme.success,
            ),
          );
          Navigator.pop(context, true);
        } else {
          // Display validation error or failure message
          String errorMessage = res.message ?? 'Failed to save product';
          if (res.data != null && res.data['errors'] is Map) {
            final errors = res.data['errors'] as Map<String, dynamic>;
            if (errors.isNotEmpty) {
              final firstErrorList = errors.values.first;
              if (firstErrorList is List && firstErrorList.isNotEmpty) {
                errorMessage = firstErrorList.first.toString();
              }
            }
          }
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(errorMessage),
              backgroundColor: AppTheme.danger,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving product: $e'),
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
        title: Text(isEdit ? 'Edit Product' : 'Add New Product'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // General Information Card
              _buildCard(
                title: 'General Information',
                icon: Icons.info_outline_rounded,
                children: [
                  // Product Name
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Product Name *',
                      hintText: 'e.g. DeWalt 20V Cordless Drill',
                      prefixIcon: Icon(Icons.inventory_2_outlined),
                    ),
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) return 'Product name is required';
                      if (val.trim().length > 255) return 'Name cannot exceed 255 characters';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // SKU (Stock Keeping Unit)
                  TextFormField(
                    controller: _skuController,
                    textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(
                      labelText: 'SKU (Stock Keeping Unit) *',
                      hintText: 'e.g. TOOL-DW-20V',
                      prefixIcon: Icon(Icons.qr_code_rounded),
                    ),
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) return 'SKU code is required';
                      if (val.trim().length > 50) return 'SKU cannot exceed 50 characters';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Category Dropdown
                  DropdownButtonFormField<String>(
                    initialValue: _category,
                    decoration: const InputDecoration(
                      labelText: 'Category *',
                      prefixIcon: Icon(Icons.category_outlined),
                    ),
                    items: AppConstants.categories.map((cat) {
                      return DropdownMenuItem(
                        value: cat,
                        child: Text(cat),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _category = val);
                    },
                  ),
                  const SizedBox(height: 16),

                  // Description
                  TextFormField(
                    controller: _descriptionController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Description (Optional)',
                      hintText: 'Provide technical specifications or details...',
                      alignLabelWithHint: true,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Pricing & Stock Card
              _buildCard(
                title: 'Pricing & Inventory',
                icon: Icons.attach_money_rounded,
                children: [
                  // Price
                  TextFormField(
                    controller: _priceController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      labelText: 'Unit Price (\$) *',
                      hintText: '0.00',
                      prefixIcon: Icon(Icons.attach_money_rounded),
                    ),
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) return 'Price is required';
                      final num = double.tryParse(val.trim());
                      if (num == null || num < 0) return 'Enter a valid positive price';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Quantity in Stock
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _quantityController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Current Quantity *',
                            hintText: '0',
                            prefixIcon: Icon(Icons.storage_rounded),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) return 'Quantity is required';
                            final num = int.tryParse(val.trim());
                            if (num == null || num < 0) return 'Valid integer required';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _thresholdController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Low Stock Alert *',
                            hintText: '10',
                            prefixIcon: Icon(Icons.warning_amber_rounded),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) return 'Alert limit required';
                            final num = int.tryParse(val.trim());
                            if (num == null || num < 0) return 'Valid integer required';
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Status Switch Card
              _buildCard(
                title: 'Catalog Status',
                icon: Icons.toggle_on_outlined,
                children: [
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      _status == 'active' ? 'Active Product' : 'Inactive Product',
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    ),
                    subtitle: Text(
                      _status == 'active'
                          ? 'This product is visible in standard catalogs.'
                          : 'This product is marked inactive/disabled.',
                      style: const TextStyle(fontSize: 12, color: AppTheme.slate500),
                    ),
                    value: _status == 'active',
                    activeTrackColor: AppTheme.success,
                    onChanged: (bool val) {
                      setState(() => _status = val ? 'active' : 'inactive');
                    },
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Action Buttons
              ElevatedButton(
                onPressed: _isLoading ? null : _submitForm,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: AppTheme.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(isEdit ? Icons.save_rounded : Icons.add_circle_outline_rounded, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            isEdit ? 'Save Changes' : 'Create Product',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => Navigator.pop(context),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppTheme.slate300),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Cancel', style: TextStyle(color: AppTheme.slate700, fontWeight: FontWeight.w600)),
              ),
              const SizedBox(height: 30),
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
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
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
              Icon(icon, size: 18, color: AppTheme.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.slate800,
                  letterSpacing: -0.2,
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
