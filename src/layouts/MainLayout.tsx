import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "../components/navigation/sidebar/AppSidebar";
import Header from "../components/header/Header";

const MainLayout = () => {
  return (
    <TooltipProvider delayDuration={0}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="h-svh overflow-hidden">
            <Header />
            <main className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4 p-4">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
    </TooltipProvider>
  );
};

export default MainLayout;