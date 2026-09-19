/**
 * Đầu phiếu in: khối thương hiệu (logo / tên công ty / email / điện thoại /
 * địa chỉ) bên trái, tiêu đề phiếu ở giữa.
 *
 * Dữ liệu công ty đến từ hồ sơ công ty dùng chung (companyProfileService);
 * `branding` chỉ quyết định HIỂN THỊ từng trường hay không.
 * Dùng <div> thay vì <header> để không vướng quy tắc ẩn của print.css.
 * `compact` = layout khổ nhiệt K80 (xếp dọc, căn giữa).
 */
export default function PrintHeader({ title, branding, company, accentColor = "#0F2A43", compact = false }) {
    const b = branding ?? {};
    const c = company ?? {};

    const logoNode = b.showLogo ? (
        <img
            src={c.logoAsset ?? "/branding/f-centric-icon.svg"}
            alt=""
            className={compact ? "mx-auto h-10 w-auto object-contain" : "h-10 w-auto object-contain object-left"}
            draggable={false}
        />
    ) : null;

    const companyLines = [
        b.showCompanyName && c.name ? (
            <p key="name" className="text-base font-bold leading-snug text-bo-foreground">{c.name}</p>
        ) : null,
        b.showEmail && c.email ? (
            <p key="email" className="mt-0.5 break-words text-xs leading-5 text-bo-muted">{c.email}</p>
        ) : null,
        b.showPhone && c.phone ? (
            <p key="phone" className="mt-0.5 break-words text-xs leading-5 text-bo-muted">{c.phone}</p>
        ) : null,
        b.showAddress && c.address ? (
            <p key="address" className="mt-0.5 break-words text-xs leading-5 text-bo-muted">{c.address}</p>
        ) : null,
    ].filter(Boolean);

    if (compact) {
        return (
            <div className="border-b-2 border-dashed pb-2" style={{ borderColor: accentColor }}>
                <div className="text-center">
                    {logoNode}
                    <div className="mt-1">{companyLines}</div>
                    <h1 className="mt-2 text-[13px] font-bold uppercase leading-snug tracking-wide text-bo-foreground">
                        {title}
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div className="border-b-2 pb-4" style={{ borderColor: accentColor }}>
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-6">
                <div className="min-w-0">
                    {logoNode}
                    {companyLines.length > 0 ? <div className={b.showLogo ? "mt-1" : ""}>{companyLines}</div> : null}
                </div>
                <h1 className="min-w-0 max-w-md self-center text-center text-lg font-bold uppercase leading-snug tracking-wide text-bo-foreground">
                    {title}
                </h1>
                <div />
            </div>
        </div>
    );
}
