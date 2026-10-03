import 'package:flutter/foundation.dart';

/// Global Event Bus that synchronizes state updates across all screens
/// (Dashboard, Products List, Stock Ledger, and Recycle Bin) in real-time.
class AppEventBus {
  static final AppEventBus _instance = AppEventBus._internal();
  factory AppEventBus() => _instance;
  AppEventBus._internal();

  /// Triggered whenever any Product or Stock Movement is Created, Updated, Deleted, or Restored.
  final ValueNotifier<int> onDataMutated = ValueNotifier<int>(0);

  void notifyDataMutated() {
    onDataMutated.value++;
  }
}
