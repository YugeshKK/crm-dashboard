import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/sidebar/Sidebar";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";

type Props = {};

const MainLayout = (props: Props) => {
  return (
    <div className="grid h-screen overflow-hidden grid-cols-[auto_1fr] gap" style={{ backgroundColor: "var(--background)" }}>
      <Sidebar />
      <div className="flex h-screen min-h-0 flex-col min-w-0">
        <Header />
        <main className="app-scroll flex min-h-0 flex-1 flex-col min-w-0 gap-3 overflow-y-auto pl-3 pr-3">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default MainLayout;
