# FS WMS backoffice design system

## Visual direction

Build a restrained operational interface: dark navy navigation, white header, light neutral workspace, flat white surfaces, blue primary actions, sans-serif typography, and compact information density.

Do not copy Sapo branding, logos, advertisements, wording, or exact proprietary screens. Do not use the previous gold/ivory luxury system, decorative grids, serif headings, mono labels, blobs, unnecessary gradients, oversized radii, or heavy shadows.

## Semantic tokens

Use the bo-* tokens already declared in frontend/src/index.css. Their baseline values are:

| Token purpose | Value |
| --- | --- |
| Canvas | #F4F6F8 |
| Surface | #FFFFFF |
| Foreground | #182537 |
| Muted foreground | #64748B |
| Border | #E1E6EC |
| Primary | #1677FF |
| Primary hover | #095FCC |
| Sidebar | #182537 |
| Sidebar hover | #243654 |
| Success | #15803D |
| Warning | #B45309 |
| Danger | #DC2626 |

The namespace intentionally prevents foundation work from restyling auth, supplier, storefront, and print screens. Do not repeat raw color values inside migrated page JSX.

## Layout measurements

- Desktop sidebar: 240px expanded and 72px collapsed.
- Mobile sidebar: existing Radix/shadcn sheet behavior.
- Header: 56px.
- Page padding: 16px mobile, 20px tablet, 24px desktop.
- Controls: 36–40px high.
- Default radius: 6–8px.
- Surfaces: subtle shadow-sm with borders as the main separator.
- Main content may use a 1600px maximum width for operational tables.

Header text and action groups must truncate or wrap. Wide tables scroll inside their card, never at page level.

## Component ownership

| Layer | Responsibility |
| --- | --- |
| components/ui | Existing Button, Input, Select, Badge, Card, Table, Dialog, Sheet, Tabs, Tooltip, Skeleton |
| components/backoffice | Layout, Sidebar, Header, PageContainer, PageHeader |
| components/shared | FilterBar, SearchInput, TableShell, StatusBadge, EmptyState, LoadingState, ErrorState, SurfaceCard, FormSection, FormActions |
| components/dashboard | Small dashboard-only presentation pieces |
| Feature folders | API calls, form state, calculations, status mapping, and role-specific actions |

Shared StatusBadge accepts presentation values such as label and tone. Keep each entity's status-code mapping inside its feature because domain meanings differ.

Do not change default variants used by many pages during the first phase. Add scoped backoffice variants, migrate consumers, then remove old behavior only after reference searches reach zero.

## Required states

Every migrated page must deliberately support:

- initial loading and background refresh;
- populated data;
- empty data;
- search or filter with no result;
- recoverable API error;
- validation error;
- disabled and submitting actions;
- unauthorized or role-hidden actions;
- long text and large numeric values.

Loading, empty, error, and populated states are mutually exclusive. Never place a permanent skeleton behind an empty state.
