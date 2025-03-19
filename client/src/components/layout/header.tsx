import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

// Helper function to get page title from path
const getPageTitle = (path: string): string => {
  if (path === "/") return "Dashboard";
  if (path === "/tests") return "Tests";
  if (path.startsWith("/tests/take/")) return "Take Test";
  if (path.startsWith("/tests/results/")) return "Test Results";
  if (path === "/profile") return "Profile";
  if (path === "/settings") return "Settings";
  if (path === "/admin/users") return "User Management";
  if (path === "/admin/test-management") return "Test Management";
  if (path === "/admin/question-bank") return "Question Bank";
  return "Meritorious";
};

// Get initials from username
const getInitials = (name: string): string => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default function Header({ 
  onOpenSidebar 
}: { 
  onOpenSidebar: () => void;
}) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const pageTitle = getPageTitle(location);
  const notificationCount = 3; // This would be dynamic in a real app

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-gray-600 font-medium">{pageTitle}</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="py-2 px-3 border-b border-gray-100 hover:bg-gray-50">
                  <h4 className="text-sm font-medium">Test Completed</h4>
                  <p className="text-xs text-gray-500">You scored 85% on Advanced SQL Test</p>
                  <span className="text-xs text-gray-400">10 minutes ago</span>
                </div>
                <div className="py-2 px-3 border-b border-gray-100 hover:bg-gray-50">
                  <h4 className="text-sm font-medium">New Test Available</h4>
                  <p className="text-xs text-gray-500">Database Security Principles is now available</p>
                  <span className="text-xs text-gray-400">1 hour ago</span>
                </div>
                <div className="py-2 px-3 hover:bg-gray-50">
                  <h4 className="text-sm font-medium">System Update</h4>
                  <p className="text-xs text-gray-500">Platform will be updated on Sunday, 2 AM</p>
                  <span className="text-xs text-gray-400">Yesterday</span>
                </div>
              </div>
              <div className="p-2 border-t border-gray-200 text-center">
                <button className="text-xs text-primary hover:text-indigo-800 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={user?.username || "User"} />
            <AvatarFallback>{getInitials(user?.username || "")}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-700 hidden md:inline-block">
            {user?.username || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
