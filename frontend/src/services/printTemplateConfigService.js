/**
 * Cấu hình mẫu in — MỖI LOẠI CHỨNG TỪ MỘT BỘ CẤU HÌNH RIÊNG.
 *
 * Cấu trúc lưu trữ:
 *   printTemplateConfigs[documentType][templateId] = { ...config }
 *
 * Khổ giấy nằm trong định danh mẫu (vd: purchase_request_default_A4,
 * sales_invoice_default_K80) và được seed từ registry schema — mỗi loại
 * chứng từ có section/field/cột riêng nên KHÔNG có cấu hình global.
 *
 * MVP frontend-only: lưu localStorage có version. Service là lớp trừu tượng
 * duy nhất mà editor / trang xem trước / trang in thật sử dụng, nên sau này
 * có thể thay phần lưu trữ bằng API backend mà không phải sửa editor/renderer.
 */
import { getPrintSchema } from "@/components/print/schemas/printSchemas";

export const CONFIG_VERSION = 2;
const STORAGE_KEY = "fcentric.printTemplateConfigs.v2";

const DEFAULT_ACCENT_COLOR = "#0F2A43";

/**
 * Sinh cấu hình mặc định đầy đủ cho một mẫu từ schema:
 * bật toàn bộ section / field / cột theo khai báo của loại chứng từ đó.
 */
export function buildDefaultTemplateConfig(schema, templateDef) {
    const sections = {};
    for (const section of schema.sections) {
        if (section.type === "info") {
            sections[section.key] = Object.fromEntries(
                section.fields.map((field) => [field.key, true])
            );
        } else if (section.type === "items") {
            sections[section.key] = { show: true, showTotal: Boolean(section.total) };
        } else if (section.type === "notes") {
            sections[section.key] = { show: true };
        } else if (section.type === "signatures") {
            sections[section.key] = Object.fromEntries(
                section.blocks.map((block) => [block.key, true])
            );
        }
    }

    const columns = {};
    for (const section of schema.sections) {
        if (section.type !== "items") continue;
        for (const column of section.columns) {
            columns[column.key] = true;
        }
    }

    return {
        version: CONFIG_VERSION,
        documentType: schema.key,
        id: templateDef.id,
        name: templateDef.name,
        isDefault: templateDef.isDefault,
        paperSize: templateDef.paperSize,
        orientation: templateDef.orientation,
        margin: templateDef.margin,
        accentColor: DEFAULT_ACCENT_COLOR,
        branding: {
            showLogo: true,
            showCompanyName: true,
            showEmail: true,
            showPhone: true,
            showAddress: true,
        },
        sections,
        columns,
    };
}

// Merge đệ quy: giá trị đã lưu đè lên default, bù các trường mới được thêm
// sau này để cấu hình cũ không bị vỡ
const deepMerge = (base, over) => {
    const result = { ...base };
    if (!over || typeof over !== "object") return result;
    for (const [key, value] of Object.entries(over)) {
        if (value === undefined) continue;
        const baseValue = base[key];
        result[key] =
            baseValue && typeof baseValue === "object" && !Array.isArray(baseValue) &&
            value && typeof value === "object" && !Array.isArray(value)
                ? deepMerge(baseValue, value)
                : value;
    }
    return result;
};

const readStorage = () => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const writeStorage = (map) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

/** Cấu hình mặc định của một mẫu từ registry (chưa merge bản đã lưu). */
const registryDefault = (documentType, templateId) => {
    const schema = getPrintSchema(documentType);
    if (!schema) return null;
    const def =
        schema.templates.find((template) => template.id === templateId) ??
        schema.templates[0];
    return def ? buildDefaultTemplateConfig(schema, def) : null;
};

export const printTemplateConfigService = {
    /**
     * Cấu hình một mẫu cụ thể: bản đã lưu (merge đè lên default của registry)
     * hoặc default nếu chưa từng lưu / sai version.
     */
    getTemplate(documentType, templateId) {
        const fallback = registryDefault(documentType, templateId);
        const saved = readStorage()[documentType]?.[templateId];
        if (!saved || saved.version !== CONFIG_VERSION || saved.id !== templateId) {
            return fallback;
        }
        return deepMerge(fallback, saved);
    },

    /** Toàn bộ mẫu của một loại chứng từ (thứ tự theo registry). */
    getTemplates(documentType) {
        const schema = getPrintSchema(documentType);
        if (!schema) return [];
        return schema.templates.map((def) =>
            this.getTemplate(documentType, def.id)
        );
    },

    /** Mẫu đang được đặt làm mặc định (hoặc mẫu đầu tiên). */
    getActiveTemplate(documentType) {
        const templates = this.getTemplates(documentType);
        if (templates.length === 0) return null;
        return (
            templates.find((template) => template.isDefault) ?? templates[0]
        );
    },

    saveTemplate(config) {
        const map = readStorage();
        if (!map[config.documentType]) map[config.documentType] = {};
        map[config.documentType][config.id] = config;
        writeStorage(map);
    },

    resetTemplate(documentType, templateId) {
        const map = readStorage();
        if (map[documentType]) {
            delete map[documentType][templateId];
            if (Object.keys(map[documentType]).length === 0) {
                delete map[documentType];
            }
            writeStorage(map);
        }
    },
};
