import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useOmnibusContext } from "@/hooks/useOmnibusContext";

export function NavBar() {
  const navItems = [
    { title: "Live Data", href: "/live-data" },
    { title: "Historical", href: "/historical" },
    { title: "Alerts", href: "/alerts" },
    { title: "Settings", href: "/settings" },
  ];

  // Get connection status from Omnibus context
  const { connectionStatus } = useOmnibusContext();

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
    <div className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 py-3 md:py-4">
          {/* Title and Status - Always visible */}
          <div className="flex items-center justify-between min-w-0">
            {/* Title - responsive text size */}
            <div className="text-base md:text-xl font-bold text-gray-800 truncate">
              <span className="hidden sm:inline">Sensor Monitoring Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </div>

            {/* Connection Status Indicator - Visible on mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <span className="text-xs text-gray-600">{status.text}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <NavigationMenu className="flex-1">
            <NavigationMenuList className="flex flex-wrap items-center gap-1 md:gap-2">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={item.href}
                      className={navigationMenuTriggerStyle() + " text-sm md:text-base"}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Connection Status Indicator - Desktop only */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <div className={`w-2 h-2 rounded-full ${status.color}`} />
            <span className="text-sm text-gray-600">{status.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}