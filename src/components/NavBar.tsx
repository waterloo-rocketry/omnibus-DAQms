"use client";

import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function NavBar() {
  const navItems = [
    { title: "Live Data", href: "/live-data" },
    { title: "Historical", href: "/historical" },
    { title: "Alerts", href: "/alerts" },
    { title: "Settings", href: "/settings" },
  ];

  return (
    <NavigationMenu className="mt-4 pl-2">
      <NavigationMenuList className="flex items-center gap-8 px-4">
        {/* Static title */}
        <div className="text-xl font-bold text-gray-800">
          Sensor Monitoring Dashboard
        </div>

        {/* Links */}
        {navItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            <NavigationMenuLink asChild>
              <Link
                to={item.href}
                className={navigationMenuTriggerStyle()}
              >
                {item.title}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}