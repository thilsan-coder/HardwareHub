import 'package:flutter_test/flutter_test.dart';
import 'package:hardwarehub_mobile/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('HardwareHub app smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});

    // Build our app and trigger a frame.
    await tester.pumpWidget(const HardwareHubApp());

    // Verify that the splash screen shows the title HardwareHub
    expect(find.text('HardwareHub'), findsOneWidget);

    // Let the splash timer finish and transition
    await tester.pump(const Duration(seconds: 1));
    await tester.pumpAndSettle();
  });
}
