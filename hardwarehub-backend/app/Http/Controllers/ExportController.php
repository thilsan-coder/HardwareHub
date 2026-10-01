<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * Export complete product catalog as a beautifully formatted Excel (.xlsx) spreadsheet.
     */
    public function exportProductsCsv(Request $request): StreamedResponse
    {
        $filename = 'HardwareHub_Products_Catalog_' . date('Y-m-d_His') . '.xlsx';

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Products Catalog');
        $sheet->setShowGridLines(true);

        $generatedAt = date('Y-m-d H:i:s');
        $generatedBy = Auth::user()?->name ?? 'System Administrator';

        $totalProducts = Product::count();
        $totalUnits = (int) Product::sum('quantity');
        $totalValuation = (float) Product::selectRaw('SUM(price * quantity) as total_val')->value('total_val');
        $lowStockCount = Product::where('quantity', '>', 0)
            ->whereColumn('quantity', '<=', 'low_stock_threshold')
            ->count();
        $outOfStockCount = Product::where('quantity', '<=', 0)->count();

        // 1. Top Brand Banner (Row 1)
        $sheet->mergeCells('A1:L1');
        $sheet->setCellValue('A1', 'HARDWAREHUB — MASTER PRODUCT CATALOG & INVENTORY VALUATION');
        $sheet->getRowDimension(1)->setRowHeight(36);
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 14, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0F172A']], // Deep Slate Navy
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // 2. Sub-Header Metadata Strip (Row 2)
        $sheet->mergeCells('A2:L2');
        $sheet->setCellValue('A2', "Report Generated: {$generatedAt}   •   Exported By: {$generatedBy}   •   HardwareHub Store System");
        $sheet->getRowDimension(2)->setRowHeight(22);
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['size' => 9.5, 'color' => ['rgb' => '94A3B8'], 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']], // Darker Slate
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // Row 3: Spacer
        $sheet->getRowDimension(3)->setRowHeight(10);

        // 3. KPI Metric Cards (Rows 4-5)
        // Card 1: Total Valuation (A4:C5)
        $sheet->mergeCells('A4:C4');
        $sheet->setCellValue('A4', 'TOTAL INVENTORY VALUATION');
        $sheet->mergeCells('A5:C5');
        $sheet->setCellValue('A5', '$ ' . number_format($totalValuation, 2));

        // Card 2: Physical Stock In Hand (D4:F5)
        $sheet->mergeCells('D4:F4');
        $sheet->setCellValue('D4', 'PHYSICAL STOCK IN HAND');
        $sheet->mergeCells('D5:F5');
        $sheet->setCellValue('D5', number_format($totalUnits) . ' units');

        // Card 3: Total Catalog Products (G4:I4)
        $sheet->mergeCells('G4:I4');
        $sheet->setCellValue('G4', 'ACTIVE CATALOG ITEMS');
        $sheet->mergeCells('G5:I5');
        $sheet->setCellValue('G5', $totalProducts . ' Products');

        // Card 4: Inventory Alerts (J4:L4)
        $sheet->mergeCells('J4:L4');
        $sheet->setCellValue('J4', 'STOCK ALERTS & WARNINGS');
        $sheet->mergeCells('J5:L5');
        $sheet->setCellValue('J5', "{$lowStockCount} Low / {$outOfStockCount} Out of Stock");

        // Styling KPI Cards
        $sheet->getRowDimension(4)->setRowHeight(18);
        $sheet->getRowDimension(5)->setRowHeight(28);

        // Card 1 Style (Indigo)
        $sheet->getStyle('A4:C4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '4338CA'], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EEF2FF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('A5:C5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '312E81'], 'size' => 14, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EEF2FF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('A4:C5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'C7D2FE']]],
        ]);

        // Card 2 Style (Blue)
        $sheet->getStyle('D4:F4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '1E40AF'], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EFF6FF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('D5:F5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '1D4ED8'], 'size' => 14, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EFF6FF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('D4:F5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'BFDBFE']]],
        ]);

        // Card 3 Style (Slate)
        $sheet->getStyle('G4:I4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '334155'], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F8FAFC']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('G5:I5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '0F172A'], 'size' => 14, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F8FAFC']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('G4:I5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
        ]);

        // Card 4 Style (Amber/Red)
        $alertColor = ($lowStockCount > 0 || $outOfStockCount > 0) ? '991B1B' : '15803D';
        $alertBg = ($lowStockCount > 0 || $outOfStockCount > 0) ? 'FEF2F2' : 'F0FDF4';
        $alertBorder = ($lowStockCount > 0 || $outOfStockCount > 0) ? 'FECACA' : 'BBF7D0';

        $sheet->getStyle('J4:L4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => $alertColor], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $alertBg]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('J5:L5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => $alertColor], 'size' => 13, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $alertBg]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('J4:L5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $alertBorder]]],
        ]);

        // Row 6: Spacer
        $sheet->getRowDimension(6)->setRowHeight(12);

        // 4. Table Column Headers (Row 7)
        $headers = [
            'A7' => 'Item #',
            'B7' => 'SKU Code',
            'C7' => 'Product Name',
            'D7' => 'Category',
            'E7' => 'Unit Price ($)',
            'F7' => 'Stock In Hand',
            'G7' => 'Alert Limit',
            'H7' => 'Stock Health Status',
            'I7' => 'Total Valuation ($)',
            'J7' => 'Product Status',
            'K7' => 'Description / Specifications',
            'L7' => 'Registered Date & Time',
        ];

        foreach ($headers as $cell => $text) {
            $sheet->setCellValue($cell, $text);
        }

        $sheet->getRowDimension(7)->setRowHeight(28);
        $sheet->getStyle('A7:L7')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10.5, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4338CA']], // Modern Indigo
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '6366F1']]],
        ]);

        // 5. Populate Data Rows (Row 8 onwards)
        $products = Product::orderBy('category')->orderBy('name')->get();
        $currentRow = 8;
        $rowNumber = 1;
        $runningValuation = 0;
        $runningUnits = 0;

        foreach ($products as $p) {
            $threshold = $p->low_stock_threshold ?? 10;
            $valuation = (float) $p->price * (int) $p->quantity;
            $runningValuation += $valuation;
            $runningUnits += (int) $p->quantity;

            $health = match (true) {
                $p->quantity <= 0 => 'OUT OF STOCK',
                $p->quantity <= $threshold => 'LOW STOCK',
                default => 'HEALTHY',
            };

            $sheet->setCellValue("A{$currentRow}", $rowNumber++);
            $sheet->setCellValue("B{$currentRow}", $p->sku);
            $sheet->setCellValue("C{$currentRow}", $p->name);
            $sheet->setCellValue("D{$currentRow}", $p->category ?? 'General');
            $sheet->setCellValue("E{$currentRow}", (float) $p->price);
            $sheet->setCellValue("F{$currentRow}", (int) $p->quantity);
            $sheet->setCellValue("G{$currentRow}", (int) $threshold);
            $sheet->setCellValue("H{$currentRow}", $health);
            $sheet->setCellValue("I{$currentRow}", (float) $valuation);
            $sheet->setCellValue("J{$currentRow}", strtoupper($p->status));
            $sheet->setCellValue("K{$currentRow}", $p->description ?? '—');
            $sheet->setCellValue("L{$currentRow}", $p->created_at?->format('Y-m-d H:i:s') ?? '—');

            // Format numbers & currencies
            $sheet->getStyle("E{$currentRow}")->getNumberFormat()->setFormatCode('"$"#,##0.00');
            $sheet->getStyle("F{$currentRow}")->getNumberFormat()->setFormatCode('#,##0" units"');
            $sheet->getStyle("G{$currentRow}")->getNumberFormat()->setFormatCode('#,##0" units"');
            $sheet->getStyle("I{$currentRow}")->getNumberFormat()->setFormatCode('"$"#,##0.00');

            // Alignments
            $sheet->getStyle("A{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
            $sheet->getStyle("D{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("F{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("G{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("H{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("I{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("J{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("K{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setWrapText(true);
            $sheet->getStyle("L{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Row zebra striping & vertical centering
            $rowBg = ($currentRow % 2 === 0) ? 'F8FAFC' : 'FFFFFF';
            $sheet->getStyle("A{$currentRow}:L{$currentRow}")->applyFromArray([
                'font' => ['size' => 10, 'name' => 'Segoe UI'],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['rgb' => 'E2E8F0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Highlight Stock Health Badge
            if ($health === 'HEALTHY') {
                $sheet->getStyle("H{$currentRow}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => '166534']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DCFCE7']],
                ]);
            } elseif ($health === 'LOW STOCK') {
                $sheet->getStyle("H{$currentRow}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => '9A3412']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEF3C7']],
                ]);
            } else {
                $sheet->getStyle("H{$currentRow}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => '991B1B']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEE2E2']],
                ]);
            }

            // Highlight SKU
            $sheet->getStyle("B{$currentRow}")->getFont()->setName('Consolas')->setSize(9.5);

            $sheet->getRowDimension($currentRow)->setRowHeight(26);
            $currentRow++;
        }

        // 6. Total Summary Row
        $sheet->mergeCells("A{$currentRow}:D{$currentRow}");
        $sheet->setCellValue("A{$currentRow}", 'TOTAL PORTFOLIO SUMMARY');
        $sheet->setCellValue("F{$currentRow}", $runningUnits);
        $sheet->setCellValue("I{$currentRow}", $runningValuation);

        $sheet->getStyle("F{$currentRow}")->getNumberFormat()->setFormatCode('#,##0" units"');
        $sheet->getStyle("I{$currentRow}")->getNumberFormat()->setFormatCode('"$"#,##0.00');

        $sheet->getRowDimension($currentRow)->setRowHeight(28);
        $sheet->getStyle("A{$currentRow}:L{$currentRow}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '1E293B'], 'size' => 11, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E2E8F0']],
            'borders' => [
                'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '94A3B8']],
                'bottom' => ['borderStyle' => Border::BORDER_DOUBLE, 'color' => ['rgb' => '475569']],
            ],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle("A{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle("F{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("I{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // 7. Explicit Column Widths
        $columnWidths = [
            'A' => 10,  // Item #
            'B' => 18,  // SKU Code
            'C' => 36,  // Product Name
            'D' => 22,  // Category
            'E' => 16,  // Unit Price
            'F' => 18,  // Stock In Hand
            'G' => 16,  // Alert Limit
            'H' => 26,  // Stock Health Status
            'I' => 24,  // Total Valuation
            'J' => 18,  // Product Status
            'K' => 52,  // Description / Specifications
            'L' => 24,  // Registered Date
        ];

        foreach ($columnWidths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->stream(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ]);
    }

    /**
     * Export low-stock replenishment purchase order as formatted Excel (.xlsx).
     */
    public function exportLowStockCsv(Request $request): StreamedResponse
    {
        $filename = 'HardwareHub_Low_Stock_Replenishment_' . date('Y-m-d_His') . '.xlsx';

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Replenishment Sheet');
        $sheet->setShowGridLines(true);

        $generatedAt = date('Y-m-d H:i:s');
        $generatedBy = Auth::user()?->name ?? 'System Administrator';

        $lowStockProducts = Product::where('status', 'active')
            ->where(function ($q) {
                $q->where('quantity', '<=', 0)
                  ->orWhereColumn('quantity', '<=', 'low_stock_threshold');
            })
            ->orderBy('quantity')
            ->get();

        $totalItemsToReorder = $lowStockProducts->count();
        $totalEstRestockCost = 0;
        $totalUnitsToOrder = 0;

        foreach ($lowStockProducts as $p) {
            $threshold = $p->low_stock_threshold ?? 10;
            $suggested = max(10, ($threshold * 2) - $p->quantity);
            $totalUnitsToOrder += $suggested;
            $totalEstRestockCost += ($suggested * (float) $p->price);
        }

        // 1. Top Banner
        $sheet->mergeCells('A1:J1');
        $sheet->setCellValue('A1', 'HARDWAREHUB — LOW STOCK REPLENISHMENT & REORDER PURCHASE SHEET');
        $sheet->getRowDimension(1)->setRowHeight(36);
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 13.5, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '7C2D12']], // Deep Amber / Crimson
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // 2. Sub-Header Metadata Strip
        $sheet->mergeCells('A2:J2');
        $sheet->setCellValue('A2', "Replenishment Plan: {$generatedAt}   •   Prepared By: {$generatedBy}   •   Action: Purchase Reorder");
        $sheet->getRowDimension(2)->setRowHeight(22);
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['size' => 9.5, 'color' => ['rgb' => 'FED7AA'], 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '9A3412']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // Row 3: Spacer
        $sheet->getRowDimension(3)->setRowHeight(10);

        // 3. KPI Metric Cards (Rows 4-5)
        // Card 1: Estimated Restock Budget (A4:C5)
        $sheet->mergeCells('A4:C4');
        $sheet->setCellValue('A4', 'TOTAL ESTIMATED RESTOCK BUDGET');
        $sheet->mergeCells('A5:C5');
        $sheet->setCellValue('A5', '$ ' . number_format($totalEstRestockCost, 2));

        // Card 2: Units to Reorder (D4:E5)
        $sheet->mergeCells('D4:E4');
        $sheet->setCellValue('D4', 'TOTAL UNITS TO ORDER');
        $sheet->mergeCells('D5:E5');
        $sheet->setCellValue('D5', number_format($totalUnitsToOrder) . ' units');

        // Card 3: Critical Products (F4:H5)
        $sheet->mergeCells('F4:H4');
        $sheet->setCellValue('F4', 'CRITICAL PRODUCTS NEEDING RESTOCK');
        $sheet->mergeCells('F5:H5');
        $sheet->setCellValue('F5', $totalItemsToReorder . ' Items Requiring Purchase');

        // Card 4: Action Status (I4:J5)
        $sheet->mergeCells('I4:J4');
        $sheet->setCellValue('I4', 'ACTION PRIORITY');
        $sheet->mergeCells('I5:J5');
        $sheet->setCellValue('I5', 'URGENT REORDER');

        $sheet->getRowDimension(4)->setRowHeight(18);
        $sheet->getRowDimension(5)->setRowHeight(28);

        // Card 1 Style (Orange)
        $sheet->getStyle('A4:C4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '9A3412'], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFF7ED']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('A5:C5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '7C2D12'], 'size' => 14, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFF7ED']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('A4:C5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FED7AA']]],
        ]);

        // Card 2 Style (Amber)
        $sheet->getStyle('D4:E4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'B45309'], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEF3C7']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('D5:E5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '78350F'], 'size' => 14, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEF3C7']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('D4:E5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FDE68A']]],
        ]);

        // Card 3 Style (Red/Rose)
        $sheet->getStyle('F4:H4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '991B1B'], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEF2F2']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('F5:H5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '7F1D1D'], 'size' => 13, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEF2F2']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('F4:H5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FECACA']]],
        ]);

        // Card 4 Style (Red Highlight)
        $sheet->getStyle('I4:J4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '991B1B'], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEE2E2']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('I5:J5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '991B1B'], 'size' => 13, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEE2E2']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('I4:J5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FCA5A5']]],
        ]);

        // Row 6: Spacer
        $sheet->getRowDimension(6)->setRowHeight(12);

        // 4. Headers (Row 7)
        $headers = [
            'A7' => 'Priority #',
            'B7' => 'SKU Code',
            'C7' => 'Product Name',
            'D7' => 'Category',
            'E7' => 'Current Stock',
            'F7' => 'Alert Limit',
            'G7' => 'Suggested Reorder Qty',
            'H7' => 'Unit Price ($)',
            'I7' => 'Est. Reorder Cost ($)',
            'J7' => 'Reorder Urgency',
        ];

        foreach ($headers as $cell => $text) {
            $sheet->setCellValue($cell, $text);
        }

        $sheet->getRowDimension(7)->setRowHeight(28);
        $sheet->getStyle('A7:J7')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10.5, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'C2410C']], // Orange / Amber
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'EA580C']]],
        ]);

        $currentRow = 8;
        $priority = 1;

        foreach ($lowStockProducts as $p) {
            $threshold = $p->low_stock_threshold ?? 10;
            $suggestedReorder = max(10, ($threshold * 2) - $p->quantity);
            $estCost = $suggestedReorder * (float) $p->price;
            $isOutOfStock = $p->quantity <= 0;
            $urgency = $isOutOfStock ? 'CRITICAL (OUT OF STOCK)' : 'HIGH (BELOW THRESHOLD)';

            $sheet->setCellValue("A{$currentRow}", $priority++);
            $sheet->setCellValue("B{$currentRow}", $p->sku);
            $sheet->setCellValue("C{$currentRow}", $p->name);
            $sheet->setCellValue("D{$currentRow}", $p->category ?? 'General');
            $sheet->setCellValue("E{$currentRow}", (int) $p->quantity);
            $sheet->setCellValue("F{$currentRow}", (int) $threshold);
            $sheet->setCellValue("G{$currentRow}", (int) $suggestedReorder);
            $sheet->setCellValue("H{$currentRow}", (float) $p->price);
            $sheet->setCellValue("I{$currentRow}", (float) $estCost);
            $sheet->setCellValue("J{$currentRow}", $urgency);

            $sheet->getStyle("E{$currentRow}")->getNumberFormat()->setFormatCode('#,##0" units"');
            $sheet->getStyle("F{$currentRow}")->getNumberFormat()->setFormatCode('#,##0" units"');
            $sheet->getStyle("G{$currentRow}")->getNumberFormat()->setFormatCode('#,##0" units"');
            $sheet->getStyle("H{$currentRow}")->getNumberFormat()->setFormatCode('"$"#,##0.00');
            $sheet->getStyle("I{$currentRow}")->getNumberFormat()->setFormatCode('"$"#,##0.00');

            $sheet->getStyle("A{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
            $sheet->getStyle("D{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("F{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("G{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("H{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("I{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("J{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $rowBg = ($currentRow % 2 === 0) ? 'FFFBEB' : 'FFFFFF';
            $sheet->getStyle("A{$currentRow}:J{$currentRow}")->applyFromArray([
                'font' => ['size' => 10, 'name' => 'Segoe UI'],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['rgb' => 'FED7AA']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            if ($isOutOfStock) {
                $sheet->getStyle("J{$currentRow}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => '991B1B']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEE2E2']],
                ]);
            } else {
                $sheet->getStyle("J{$currentRow}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => '9A3412']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEF3C7']],
                ]);
            }

            $sheet->getStyle("B{$currentRow}")->getFont()->setName('Consolas')->setSize(9.5);
            $sheet->getRowDimension($currentRow)->setRowHeight(26);
            $currentRow++;
        }

        // 5. Summary Row
        $sheet->mergeCells("A{$currentRow}:D{$currentRow}");
        $sheet->setCellValue("A{$currentRow}", 'TOTAL ESTIMATED PURCHASE BUDGET');
        $sheet->setCellValue("G{$currentRow}", $totalUnitsToOrder);
        $sheet->setCellValue("I{$currentRow}", $totalEstRestockCost);

        $sheet->getStyle("G{$currentRow}")->getNumberFormat()->setFormatCode('#,##0" units"');
        $sheet->getStyle("I{$currentRow}")->getNumberFormat()->setFormatCode('"$"#,##0.00');

        $sheet->getRowDimension($currentRow)->setRowHeight(28);
        $sheet->getStyle("A{$currentRow}:J{$currentRow}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '7C2D12'], 'size' => 11, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFEDD5']],
            'borders' => [
                'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FDBA74']],
                'bottom' => ['borderStyle' => Border::BORDER_DOUBLE, 'color' => ['rgb' => 'C2410C']],
            ],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle("A{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle("G{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("I{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        $columnWidths = [
            'A' => 12,  // Priority #
            'B' => 18,  // SKU Code
            'C' => 36,  // Product Name
            'D' => 22,  // Category
            'E' => 18,  // Current Stock
            'F' => 16,  // Alert Limit
            'G' => 24,  // Suggested Reorder
            'H' => 16,  // Unit Price
            'I' => 24,  // Est. Cost
            'J' => 28,  // Urgency
        ];

        foreach ($columnWidths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->stream(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ]);
    }

    /**
     * Export stock movement history audit log as formatted Excel (.xlsx).
     */
    public function exportStockMovementsCsv(Request $request): StreamedResponse
    {
        $filename = 'HardwareHub_Stock_Movements_Ledger_' . date('Y-m-d_His') . '.xlsx';

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Movements Ledger');
        $sheet->setShowGridLines(true);

        $generatedAt = date('Y-m-d H:i:s');
        $generatedBy = Auth::user()?->name ?? 'System Administrator';
        $totalMovements = StockMovement::count();
        $totalIn = StockMovement::where('type', 'in')->count();
        $totalOut = StockMovement::where('type', 'out')->count();
        $totalAdj = StockMovement::whereIn('type', ['adjustment', 'damage'])->count();

        // 1. Top Banner
        $sheet->mergeCells('A1:J1');
        $sheet->setCellValue('A1', 'HARDWAREHUB — INVENTORY STOCK MOVEMENTS & AUDIT LEDGER');
        $sheet->getRowDimension(1)->setRowHeight(36);
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 13.5, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0F172A']], // Deep Slate
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // 2. Sub-Header Metadata Strip
        $sheet->mergeCells('A2:J2');
        $sheet->setCellValue('A2', "Audit Trail Generated: {$generatedAt}   •   Exported By: {$generatedBy}   •   Log Type: Real-time Stock Movements");
        $sheet->getRowDimension(2)->setRowHeight(22);
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['size' => 9.5, 'color' => ['rgb' => '94A3B8'], 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // Row 3: Spacer
        $sheet->getRowDimension(3)->setRowHeight(10);

        // 3. KPI Metric Cards (Rows 4-5)
        // Card 1: Total Movements (A4:C5)
        $sheet->mergeCells('A4:C4');
        $sheet->setCellValue('A4', 'TOTAL AUDIT RECORDS');
        $sheet->mergeCells('A5:C5');
        $sheet->setCellValue('A5', number_format($totalMovements) . ' Entries');

        // Card 2: Stock In (D4:E5)
        $sheet->mergeCells('D4:E4');
        $sheet->setCellValue('D4', 'STOCK IN (ARRIVALS)');
        $sheet->mergeCells('D5:E5');
        $sheet->setCellValue('D5', number_format($totalIn) . ' Events');

        // Card 3: Stock Out (F4:H5)
        $sheet->mergeCells('F4:H4');
        $sheet->setCellValue('F4', 'STOCK OUT (DISPATCHES)');
        $sheet->mergeCells('F5:H5');
        $sheet->setCellValue('F5', number_format($totalOut) . ' Events');

        // Card 4: Adjustments & Damage (I4:J5)
        $sheet->mergeCells('I4:J4');
        $sheet->setCellValue('I4', 'AUDIT ADJUSTMENTS / DAMAGE');
        $sheet->mergeCells('I5:J5');
        $sheet->setCellValue('I5', number_format($totalAdj) . ' Events');

        $sheet->getRowDimension(4)->setRowHeight(18);
        $sheet->getRowDimension(5)->setRowHeight(28);

        // Card 1 Style (Slate)
        $sheet->getStyle('A4:C4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '334155'], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F8FAFC']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('A5:C5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '0F172A'], 'size' => 14, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F8FAFC']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('A4:C5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CBD5E1']]],
        ]);

        // Card 2 Style (Emerald Green)
        $sheet->getStyle('D4:E4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '166534'], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F0FDF4']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('D5:E5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '15803D'], 'size' => 14, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F0FDF4']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('D4:E5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'BBF7D0']]],
        ]);

        // Card 3 Style (Blue)
        $sheet->getStyle('F4:H4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '1E40AF'], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EFF6FF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('F5:H5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '1D4ED8'], 'size' => 14, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EFF6FF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('F4:H5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'BFDBFE']]],
        ]);

        // Card 4 Style (Amber)
        $sheet->getStyle('I4:J4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '9A3412'], 'size' => 9, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEF3C7']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_BOTTOM],
        ]);
        $sheet->getStyle('I5:J5')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '78350F'], 'size' => 14, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEF3C7']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('I4:J5')->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FDE68A']]],
        ]);

        // Row 6: Spacer
        $sheet->getRowDimension(6)->setRowHeight(12);

        // 4. Headers (Row 7)
        $headers = [
            'A7' => 'Audit Log ID',
            'B7' => 'Event Timestamp',
            'C7' => 'SKU Code',
            'D7' => 'Product Name',
            'E7' => 'Movement Type',
            'F7' => 'Quantity Change',
            'G7' => 'Previous Stock',
            'H7' => 'New Stock Balance',
            'I7' => 'Operator / User',
            'J7' => 'Reason & Notes',
        ];

        foreach ($headers as $cell => $text) {
            $sheet->setCellValue($cell, $text);
        }

        $sheet->getRowDimension(7)->setRowHeight(28);
        $sheet->getStyle('A7:J7')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10.5, 'name' => 'Segoe UI'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '334155']], // Slate Navy
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '475569']]],
        ]);

        $movements = StockMovement::with(['product' => fn ($q) => $q->withTrashed(), 'user'])
            ->latest()
            ->get();

        $currentRow = 8;
        foreach ($movements as $m) {
            $typeLabel = match ($m->type) {
                'in' => 'STOCK IN (Restock)',
                'out' => 'STOCK OUT (Sale/Dispatch)',
                'damage' => 'DAMAGE (Write-off)',
                default => 'ADJUSTMENT (Audit)',
            };

            $qtyFormatted = ($m->quantity_changed > 0 ? '+' : '') . $m->quantity_changed;

            $sheet->setCellValue("A{$currentRow}", 'LOG-' . str_pad($m->id, 5, '0', STR_PAD_LEFT));
            $sheet->setCellValue("B{$currentRow}", $m->created_at?->format('Y-m-d H:i:s') ?? '—');
            $sheet->setCellValue("C{$currentRow}", $m->product?->sku ?? 'ARCHIVED');
            $sheet->setCellValue("D{$currentRow}", $m->product?->name ?? 'Deleted Item');
            $sheet->setCellValue("E{$currentRow}", $typeLabel);
            $sheet->setCellValue("F{$currentRow}", $qtyFormatted . ' units');
            $sheet->setCellValue("G{$currentRow}", (int) $m->previous_stock);
            $sheet->setCellValue("H{$currentRow}", (int) $m->new_stock);
            $sheet->setCellValue("I{$currentRow}", $m->user?->name ?? 'System Administrator');
            $sheet->setCellValue("J{$currentRow}", $m->reason ?? 'Routine inventory operation');

            $sheet->getStyle("G{$currentRow}")->getNumberFormat()->setFormatCode('#,##0" units"');
            $sheet->getStyle("H{$currentRow}")->getNumberFormat()->setFormatCode('#,##0" units"');

            $sheet->getStyle("A{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("D{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
            $sheet->getStyle("E{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("F{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("G{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("H{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("I{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("J{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setWrapText(true);

            $rowBg = ($currentRow % 2 === 0) ? 'F8FAFC' : 'FFFFFF';
            $sheet->getStyle("A{$currentRow}:J{$currentRow}")->applyFromArray([
                'font' => ['size' => 10, 'name' => 'Segoe UI'],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['rgb' => 'CBD5E1']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Highlight Movement Type
            if ($m->type === 'in') {
                $sheet->getStyle("E{$currentRow}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => '166534']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DCFCE7']],
                ]);
            } elseif ($m->type === 'out') {
                $sheet->getStyle("E{$currentRow}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => '1E40AF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DBEAFE']],
                ]);
            } else {
                $sheet->getStyle("E{$currentRow}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => '9A3412']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEF3C7']],
                ]);
            }

            $sheet->getStyle("A{$currentRow}")->getFont()->setName('Consolas')->setSize(9.5);
            $sheet->getStyle("C{$currentRow}")->getFont()->setName('Consolas')->setSize(9.5);
            $sheet->getRowDimension($currentRow)->setRowHeight(26);
            $currentRow++;
        }

        $columnWidths = [
            'A' => 16,  // Log ID
            'B' => 24,  // Timestamp
            'C' => 18,  // SKU Code
            'D' => 36,  // Product Name
            'E' => 28,  // Movement Type
            'F' => 18,  // Quantity Change
            'G' => 18,  // Previous Stock
            'H' => 20,  // New Stock Balance
            'I' => 24,  // Operator
            'J' => 48,  // Reason / Notes
        ];

        foreach ($columnWidths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->stream(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ]);
    }
}
