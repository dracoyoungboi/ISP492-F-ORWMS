# FS WMS project contract

These contracts come from the ISP492-F-ORWMS source at baseline commit 7af418f91de052767e1001205ff7f81d13dbe219. Verify the current checkout before implementation. If the source has evolved, preserve its current equivalent unless the user explicitly authorizes a behavior change.

## Frozen behavior

- Preserve route-to-component mappings in frontend/src/App.jsx. Avoid editing App.jsx during visual foundation work.
- Do not modify frontend/src/services, backend code, API URLs, HTTP methods, request payloads, query parameters, response mapping, or request timing.
- Preserve the Axios request behavior that sends Authorization with access_token and warehouse context from selected_kho_id.
- Preserve the local storage keys access_token, role, and selected_kho_id.
- Preserve redirects, browser back/forward behavior, row navigation, event propagation, form submission, pagination, filtering, sorting, toasts, and loading gates.
- Preserve the exact visibility and enabled/disabled rules for actions and menu items.
- Do not introduce ProtectedRoute as part of a visual redesign.

## Roles

Verify every changed workflow with:

- quan_tri_vien
- quan_ly_kho
- nhan_vien_kho
- nhan_vien_mua_hang
- nhan_vien_ban_hang

Keep the role arrays in sidebar.config.js and feature pages unchanged unless the user asks for a permission change. A cleaner interface must never expose an action to a role that could not previously use it.

## Scope boundaries

- Authentication screens and auth assets are frozen unless the user explicitly requests another auth change.
- Public supplier flows, storefront routes, and print layouts are separate visual tracks. Do not migrate them accidentally through broad global selectors.
- Print pages may keep dedicated @media print and @page CSS. Verify print preview separately.
- Do not delete apparently dead dashboards, duplicate components, or legacy styles until import and reference searches prove they are unused.
- Identify the active /dashboard dispatcher and its role-specific components from actual imports. Similar filenames are not proof of active use.

## API preservation check

For each migrated workflow, compare before and after:

| Contract | Must match |
| --- | --- |
| Request count and trigger | The same user action causes the same calls |
| Method and URL | Exact match |
| Query and body | Same keys, values, and omission rules |
| Headers | Authorization and selected warehouse context retained |
| Success path | Same state update, toast, and navigation |
| Failure path | Same recoverability; no blank screen or swallowed error |

If the backend is unavailable, stub only at the browser or test boundary and state that real-backend verification was not performed. Never replace production service code with mock logic.
