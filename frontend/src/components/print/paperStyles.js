/**
 * Ánh xạ cấu hình giấy (khổ / hướng / lề) sang class Tailwind cho tờ giấy
 * trên màn hình và CSS @page cho bản in.
 *
 * Quy tắc: class màn hình KHÔNG dùng inline style để các class `print:*`
 * (được tạo sau trong stylesheet) có thể ghi đè khi in.
 *
 * K80 là khổ giấy nhiệt 80mm — có layout compact riêng, KHÔNG phải bản A4
 * thu nhỏ (xem PrintTemplateDocument).
 */
const MM_TO_PX = 96 / 25.4;

export const SHEET_SIZE_CLASSES = {
    "A4-portrait": "w-[210mm] min-h-[297mm]",
    "A4-landscape": "w-[297mm] min-h-[210mm]",
    "A5-portrait": "w-[148mm] min-h-[210mm]",
    "A5-landscape": "w-[210mm] min-h-[148mm]",
    // K80: chiều cao tự do (giấy cuộn nhiệt), không ép chiều cao A4
    "K80-portrait": "w-[80mm] min-h-0",
    "K80-landscape": "w-[80mm] min-h-0",
};

// Padding hiển thị trên màn hình (khi in, @page margin đảm nhiệm)
export const SHEET_PADDING_CLASSES = {
    narrow: "p-[30px]",
    default: "p-[45px]",
    wide: "p-[76px]",
    // K80: padding màn hình nhỏ hơn để khớp tỉ lệ khổ nhiệt
    thermal: "p-[12px]",
};

// Margin @page cho từng mức lề
export const PAPER_MARGIN_CSS = {
    narrow: "8mm",
    default: "12mm 10mm 15mm 10mm",
    wide: "20mm 16mm 24mm 16mm",
};

// Chiều rộng (mm) của từng khổ giấy — dùng cho zoom "Vừa chiều rộng"
const PAPER_WIDTH_MM = {
    A4: { portrait: 210, landscape: 297 },
    A5: { portrait: 148, landscape: 210 },
    K80: { portrait: 80, landscape: 80 },
};

/** Class cho tờ giấy trên màn hình (kích thước + padding) theo cấu hình. */
export function getPaperSheetClasses(paper) {
    const sizeKey = `${paper.size}-${paper.size === "K80" ? "portrait" : paper.orientation}`;
    const sizeClass = SHEET_SIZE_CLASSES[sizeKey] ?? SHEET_SIZE_CLASSES["A4-portrait"];
    const paddingClass =
        paper.size === "K80"
            ? SHEET_PADDING_CLASSES.thermal
            : SHEET_PADDING_CLASSES[paper.margin] ?? SHEET_PADDING_CLASSES.default;
    return `${sizeClass} ${paddingClass}`;
}

/** Chiều rộng tờ giấy tính bằng px (96 dpi) — dùng cho zoom. */
export function getPaperSheetWidthPx(paper) {
    const dims = PAPER_WIDTH_MM[paper.size] ?? PAPER_WIDTH_MM.A4;
    const widthMm = paper.size === "K80" ? 80 : dims[paper.orientation] ?? dims.portrait;
    return Math.round(widthMm * MM_TO_PX);
}

/**
 * CSS @page động cho bản in theo cấu hình. Được chèn qua thẻ <style> nằm
 * sau print.css trong document order nên ghi đè @page mặc định.
 * K80: chiều cao `auto` (giấy nhiệt liên tục), lề mỏng riêng.
 */
export function getPaperPageCss(paper) {
    if (paper.size === "K80") {
        return "@media print { @page { size: 80mm auto; margin: 4mm 2mm; } }";
    }
    const margin = PAPER_MARGIN_CSS[paper.margin] ?? PAPER_MARGIN_CSS.default;
    return `@media print { @page { size: ${paper.size} ${paper.orientation}; margin: ${margin}; } }`;
}
