import { useMemo, useState } from "react";
import { ChevronDown, PackageCheck } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SIDEBAR_MENU } from "./sidebar.config";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BackofficeSidebar() {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const { open, isMobile, setOpenMobile } = useSidebar();

  const filteredMenu = useMemo(
    () =>
      SIDEBAR_MENU.filter(
        (item) => !item.roles || item.roles.includes(role),
      ),
    [role],
  );

  // Mobile uses a full drawer even when desktop sidebar state is collapsed.
  const isExpanded = open || isMobile;

  // Group whose children contain the current route, if any.
  const activeGroup = filteredMenu.find((item) =>
    item.children?.some((child) => location.pathname.startsWith(child.to)),
  );

  // Single-open accordion: one state tracks the currently opened group plus
  // the pathname it was last synced for. The accordion re-syncs during render
  // (React's "adjust state when a prop changes" pattern) so navigating to a
  // child route opens its parent group, and a route outside every group
  // closes them all.
  const [menuState, setMenuState] = useState(() => ({
    pathname: location.pathname,
    openMenu: activeGroup?.label ?? null,
  }));

  if (menuState.pathname !== location.pathname) {
    setMenuState({
      pathname: location.pathname,
      openMenu: activeGroup?.label ?? null,
    });
  }

  const openMenu = menuState.openMenu;

  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar
      id="backoffice-navigation"
      collapsible="icon"
      className="z-50 border-r border-bo-sidebar-border bg-bo-sidebar text-white"
    >
      <SidebarHeader
        className={`h-[72px] justify-center border-b border-bo-sidebar-border bg-bo-sidebar ${
          isExpanded ? "px-4" : "px-0"
        }`}
      >
        {isExpanded ? (
          <NavLink
            to="/dashboard"
            onClick={handleNavigate}
            aria-label="FCentric — Trang tổng quan"
            className="flex min-w-0 items-center rounded-md px-1"
          >
            <img
              src="/branding/f-centric-logo.svg"
              alt="FCentric – Fashion Warehouse Management"
              className="h-10 w-auto max-w-full shrink-0 object-contain object-left"
              draggable={false}
            />
          </NavLink>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to="/dashboard"
                onClick={handleNavigate}
                aria-label="FCentric — Trang tổng quan"
                className="flex items-center justify-center rounded-md px-1"
              >
                <img
                  src="/branding/f-centric-icon.svg"
                  alt="FCentric – Fashion Warehouse Management"
                  className="size-8 max-w-full shrink-0 object-contain"
                  draggable={false}
                />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">FCentric</TooltipContent>
          </Tooltip>
        )}
      </SidebarHeader>

      <SidebarContent className="bo-sidebar-scroll bg-bo-sidebar px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarMenu className="gap-1">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const isParentActive = item.children?.some((child) =>
                location.pathname.startsWith(child.to),
              );

              if (item.children) {
                const isOpen = isExpanded && openMenu === item.label;

                return (
                  <Collapsible
                    key={`${item.label}-${isExpanded}`}
                    open={Boolean(isOpen)}
                    onOpenChange={(value) =>
                      setMenuState({
                        pathname: location.pathname,
                        openMenu: value ? item.label : null,
                      })
                    }
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={!isExpanded ? item.label : undefined}
                          className={
                            isParentActive
                              ? "h-10 bg-bo-sidebar-hover font-semibold text-white hover:bg-bo-sidebar-hover hover:text-white"
                              : "h-10 text-bo-sidebar-muted hover:bg-bo-sidebar-hover hover:text-white"
                          }
                        >
                          <Icon className="size-[18px]" />
                          <span className="truncate">{item.label}</span>

                          {isExpanded ? (
                            <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          ) : null}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>

                    {isExpanded ? (
                      <CollapsibleContent>
                        <div className="ml-5 mt-1 space-y-1 border-l border-bo-sidebar-border pl-3">
                          {item.children
                            .filter(
                              (child) =>
                                !child.roles || child.roles.includes(role),
                            )
                            .map((child) => (
                              <NavLink
                                key={child.to}
                                to={child.to}
                                onClick={handleNavigate}
                                className={({ isActive }) =>
                                  `block rounded-md px-3 py-2 text-[13px] leading-5 transition-colors ${
                                    isActive
                                      ? "bg-bo-primary/15 font-semibold text-blue-300"
                                      : "text-bo-sidebar-muted hover:bg-bo-sidebar-hover hover:text-white"
                                  }`
                                }
                              >
                                {child.label}
                              </NavLink>
                            ))}
                        </div>
                      </CollapsibleContent>
                    ) : null}
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    tooltip={
                      !isExpanded
                        ? item.badge
                          ? {
                              children: `${item.label} · ${item.badge.label}: ${item.badge.description}`,
                            }
                          : item.label
                        : undefined
                    }
                    className="h-10"
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === "/dashboard"}
                      onClick={handleNavigate}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-bo-primary font-semibold text-white hover:bg-bo-primary-hover hover:text-white"
                          : "text-bo-sidebar-muted hover:bg-bo-sidebar-hover hover:text-white"
                      }
                    >
                      <Icon className="size-[18px]" />
                      <span className="truncate">{item.label}</span>
                      {item.badge && isExpanded ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              tabIndex={0}
                              aria-label={`${item.badge.label} — ${item.badge.description}`}
                              className="ml-auto shrink-0 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-300"
                            >
                              {item.badge.label}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.badge.description}
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {isExpanded ? (
        <SidebarFooter className="border-t border-bo-sidebar-border bg-bo-sidebar p-2">
          <div className="flex items-center gap-3 rounded-md px-2 py-2 text-bo-sidebar-muted">
            <PackageCheck className="size-[18px] shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                Fashion Warehouse
              </p>
              <p className="truncate text-[10px]">Internal management system</p>
            </div>
          </div>
        </SidebarFooter>
      ) : null}
    </Sidebar>
  );
}
