import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  Home, 
  FileText, 
  BarChart2, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut, 
  User, 
  Cog 
} from "lucide-react";

type SidebarItemProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
};

const SidebarItem = ({ href, icon, children, onClick }: SidebarItemProps) => {
  const [location] = useLocation();
  const active = location === href;

  return (
    <Link href={href}>
      <div
        onClick={onClick}
        className={cn(
          "block px-4 py-2 rounded-lg mb-1 flex items-center cursor-pointer",
          active
            ? "bg-primary bg-opacity-10 text-primary font-medium"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span className="mr-2 w-5 text-center">{icon}</span> {children}
      </div>
    </Link>
  );
};

type SidebarSectionProps = {
  title: string;
  children: React.ReactNode;
};

const SidebarSection = ({ title, children }: SidebarSectionProps) => (
  <>
    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-6 mb-2 px-2">
      {title}
    </div>
    {children}
  </>
);

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, logoutMutation } = useAuth();
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 z-20 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="px-6 py-4 border-b">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <span className="mr-2 flex-shrink-0">🎓</span>
          Meritorious
        </h1>
      </div>
      
      <nav className="mt-6 px-4">
        <SidebarSection title="Main">
          <SidebarItem href="/" icon={<Home size={18} />} onClick={onClose}>
            Dashboard
          </SidebarItem>
          <SidebarItem href="/tests" icon={<FileText size={18} />} onClick={onClose}>
            Tests
          </SidebarItem>
          <SidebarItem href="/results" icon={<BarChart2 size={18} />} onClick={onClose}>
            Results
          </SidebarItem>
        </SidebarSection>
        
        {(isAdmin || isTeacher) && (
          <SidebarSection title="Admin">
            {isAdmin && (
              <SidebarItem href="/admin/users" icon={<Users size={18} />} onClick={onClose}>
                Users
              </SidebarItem>
            )}
            <SidebarItem href="/admin/test-management" icon={<Settings size={18} />} onClick={onClose}>
              Test Management
            </SidebarItem>
            <SidebarItem href="/admin/question-bank" icon={<HelpCircle size={18} />} onClick={onClose}>
              Question Bank
            </SidebarItem>
          </SidebarSection>
        )}
        
        <SidebarSection title="Account">
          <SidebarItem href="/profile" icon={<User size={18} />} onClick={onClose}>
            Profile
          </SidebarItem>
          <SidebarItem href="/settings" icon={<Cog size={18} />} onClick={onClose}>
            Settings
          </SidebarItem>
          <a
            href="#"
            className="block px-4 py-2 rounded-lg mb-1 text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => {
              handleLogout();
              onClose();
            }}
          >
            <span className="mr-2 w-5 text-center">
              <LogOut size={18} />
            </span>{" "}
            Logout
          </a>
        </SidebarSection>
      </nav>
    </div>
  );
}
