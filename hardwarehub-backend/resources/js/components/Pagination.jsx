import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
    currentPage = 1,
    totalItems = 0,
    pageSize = 5,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 25, 50]
}) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const from = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
    const to = Math.min(safeCurrentPage * pageSize, totalItems);

    // Compute visible page numbers
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let start = Math.max(1, safeCurrentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);
            
            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="bg-white border-t border-slate-100 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
            {/* Left: Summary & Page Size Selector */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>
                    Showing <strong className="font-semibold text-slate-800">{from}</strong> to{' '}
                    <strong className="font-semibold text-slate-800">{to}</strong> of{' '}
                    <strong className="font-semibold text-slate-800">{totalItems}</strong> items
                </span>

                {onPageSizeChange && (
                    <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400">Rows:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                            {pageSizeOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Right: Page Navigation Buttons */}
            <div className="flex items-center space-x-1">
                {/* First Page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={safeCurrentPage === 1}
                    className="p-1 rounded-md border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="First Page"
                >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                {/* Previous Page */}
                <button
                    onClick={() => onPageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    className="flex items-center space-x-1 px-2 py-1 rounded-md border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Prev</span>
                </button>

                {/* Numeric Pages */}
                {pages.map((p) => {
                    const isActive = p === safeCurrentPage;
                    return (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`min-w-[28px] h-7 px-1.5 rounded-md text-xs font-semibold transition-all ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                            {p}
                        </button>
                    );
                })}

                {/* Next Page */}
                <button
                    onClick={() => onPageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    className="flex items-center space-x-1 px-2 py-1 rounded-md border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="hidden sm:inline text-[11px]">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Last Page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    className="p-1 rounded-md border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Last Page"
                >
                    <ChevronsRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
