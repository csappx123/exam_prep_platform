import { useState, ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

type LayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
      
      <div className="md:ml-64 min-h-screen flex flex-col">
        <Header onOpenSidebar={handleToggleSidebar} />
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
