"use client";

import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useDAQContext } from "@/context/DAQContext";

export function NavBar() {
  const navItems = [
    { title: "Live Data", href: "/live-data" },
    { title: "Historical", href: "/historical" },
    { title: "Alerts", href: "/alerts" },
    { title: "Settings", href: "/settings" },
  ];

  // Get connection status from DAQ context
  const { connectionStatus } = useDAQContext();

  // Determine status color and text
  const getStatusStyle = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'bg-green-500', text: 'Connected' };
      case 'connecting':
        return { color: 'bg-yellow-500', text: 'Connecting...' };
      case 'disconnected':
        return { color: 'bg-orange-500', text: 'Disconnected' };
      case 'error':
        return { color: 'bg-red-500', text: 'Error' };
      default:
        return { color: 'bg-gray-500', text: 'Unknown' };
    }
  };

  const status = getStatusStyle();

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

        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2 ml-auto">
          <div className={`w-2 h-2 rounded-full ${status.color}`} />
          <span className="text-sm text-gray-600">{status.text}</span>
        </div>
      </NavigationMenuList>
    </NavigationMenu>
  );
}