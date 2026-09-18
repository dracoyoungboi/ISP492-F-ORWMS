/**
 * Gộp mẫu in theo MẪU TRỰC QUAN (visual template) — CHỈ dùng cho hiển thị
 * danh sách (non-destructive).
 *
 * Một "mẫu trực quan" = nội dung + kiểu dáng của phiếu: section/field/cột
 * đang bật, màu nhấn, thương hiệu. Đây là những gì người dùng thấy khác
 * nhau giữa các mẫu.
 *
 * CẤU HÌNH GIẤY KHÔNG PHẢI LÀ YẾU TỐ ĐỊNH DANH MẪU TRỰC QUAN: paperSize,
 * orientation, margin (và hậu tố khổ giấy trong tên) chỉ là biến thể khổ
 * giấy của CÙNG một mẫu trực quan. Vì vậy A4, A5 và K80 gộp vào MỘT thẻ
 * (vd hóa đơn bán hàng), badge khổ giấy hiển thị read-only trên thẻ.
 *
 * Non-destructive: không xoá/sửa dữ liệu gốc. Mọi biến thể (id, cấu hình
 * đã lưu, isDefault) nằm nguyên trong `variants`; `primary` chỉ là biến thể
 * được dùng để mở thẻ — ưu tiên mẫu đang hoạt động (isDefault).
 */

const PAPER_SIZES = ["A3", "A4", "A5", "A6", "K57", "K80", "LEGAL", "LETTER"];
const PAPER_SUFFIX_RE = new RegExp(
    `\\s*\\((?:${PAPER_SIZES.join("|")})\\)\\s*$`,
    "i"
);

/** Bỏ hậu tố khổ giấy ở tên hiển thị: "Mẫu FCentric mặc định (A5)" → "Mẫu FCentric mặc định". */
export function stripPaperSizeSuffix(name) {
    return String(name ?? "").replace(PAPER_SUFFIX_RE, "").trim();
}

/**
 * Dấu vân tay MẪU TRỰC QUAN — chỉ gồm nội dung/kiểu dáng hiển thị.
 * KHÔNG gồm paperSize / orientation / margin / tên / isDefault / id /
 * version: chúng không biến các biến thể khổ giấy (A4 / A5 / K80) thành
 * những mẫu trực quan khác nhau.
 */
export function visualTemplateKey(template) {
    return JSON.stringify({
        documentType: template.documentType,
        accentColor: template.accentColor,
        branding: template.branding,
        sections: template.sections,
        columns: template.columns,
    });
}

/**
 * Loại chứng từ luôn gộp MỌI biến thể vào MỘT thẻ duy nhất, bất kể cấu hình
 * đã lưu của từng biến thể có khác nhau hay không (vd người dùng đã tắt bớt
 * cột cho K80 trong editor). Hóa đơn bán hàng có A4/A5/K80 — yêu cầu danh
 * sách luôn hiển thị đúng 1 thẻ "Mẫu FCentric mặc định" với badge A4/A5/K80,
 * không có thẻ K80 riêng. Chỉ ảnh hưởng hiển thị danh sách, không đổi dữ liệu.
 */
const SINGLE_CARD_DOCUMENT_TYPES = new Set(["sales_invoice"]);

/**
 * Gộp danh sách mẫu thành các nhóm mẫu trực quan, thứ tự theo biến thể
 * đầu tiên xuất hiện (thứ tự registry). Mỗi nhóm:
 *   - key      : vân tay mẫu trực quan (dùng làm React key của thẻ)
 *   - name     : tên hiển thị của biến thể đang hoạt động, bỏ hậu tố khổ giấy
 *   - primary  : biến thể mở khi bấm thẻ — mẫu đang hoạt động (isDefault)
 *                nếu có, ngược lại biến thể đầu tiên
 *   - variants : MỌI biến thể gốc (id + cấu hình giữ nguyên, không sửa đổi)
 */
export function groupPrintTemplates(templates) {
    const list = templates || [];
    if (
        list.length > 0 &&
        SINGLE_CARD_DOCUMENT_TYPES.has(list[0].documentType)
    ) {
        // Một thẻ duy nhất cho toàn bộ biến thể (A4, A5, K80)
        const variants = [...list];
        const primary =
            variants.find((template) => template.isDefault) ?? variants[0];
        return [
            {
                key: list[0].documentType,
                name: stripPaperSizeSuffix(primary.name),
                primary,
                variants,
            },
        ];
    }

    const groups = new Map();
    for (const template of list) {
        const key = visualTemplateKey(template);
        let group = groups.get(key);
        if (!group) {
            group = { key, name: "", primary: template, variants: [] };
            groups.set(key, group);
        }
        group.variants.push(template);
        if (template.isDefault && !group.primary.isDefault) {
            group.primary = template;
        }
    }
    for (const group of groups.values()) {
        group.name = stripPaperSizeSuffix(group.primary.name);
    }
    return Array.from(groups.values());
}
