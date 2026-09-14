import { useState } from "react";
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

  const filteredMenu = SIDEBAR_MENU.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  // Mobile uses a full drawer even when desktop sidebar state is collapsed.
  const isExpanded = open || isMobile;
  const autoOpenMenus = SIDEBAR_MENU.reduce((menus, item) => {
    if (
      item.children?.some((child) =>
        location.pathname.startsWith(child.to),
      )
    ) {
      menus[item.label] = true;
    }
    return menus;
  }, {});
  const [menuState, setMenuState] = useState(() => ({
    pathname: location.pathname,
    values: autoOpenMenus,
  }));
  const openMenus =
    menuState.pathname === location.pathname
      ? menuState.values
      : { ...menuState.values, ...autoOpenMenus };

  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar
      id="backoffice-navigation"
      collapsible="icon"
      className="z-50 border-r border-bo-sidebar-border bg-bo-sidebar text-white"
    >
      <SidebarHeader className="h-[72px] justify-center border-b border-bo-sidebar-border bg-bo-sidebar px-4">
        {isExpanded ? (
          <NavLink
            to="/dashboard"
            onClick={handleNavigate}
            aria-label="F Centric — Trang tổng quan"
            className="flex min-w-0 items-center rounded-md px-1"
          >
            <img
              src="/branding/f-centric-logo.svg"
              alt="F Centric – Fashion Warehouse Management"
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
                aria-label="F Centric — Trang tổng quan"
                className="flex items-center justify-center rounded-md px-1"
              >
                <img
                  src="/branding/f-centric-icon.svg"
                  alt="F Centric – Fashion Warehouse Management"
                  className="size-10 shrink-0 object-contain"
                  draggable={false}
                />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">F Centric</TooltipContent>
          </Tooltip>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-bo-sidebar px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarMenu className="gap-1">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const isParentActive = item.children?.some((child) =>
                location.pathname.startsWith(child.to),
              );

              if (item.children) {
                const isOpen = isExpanded && openMenus[item.label];

                return (
                  <Collapsible
                    key={`${item.label}-${isExpanded}`}
                    open={Boolean(isOpen)}
                    onOpenChange={(value) =>
                      setMenuState({
                        pathname: location.pathname,
                        values: {
                          ...openMenus,
                          [item.label]: value,
                        },
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
                    tooltip={!isExpanded ? item.label : undefined}
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
