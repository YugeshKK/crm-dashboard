import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/sidebar/Sidebar";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";

type Props = {};

const MainLayout = (props: Props) => {
  return (
    <div className="grid min-h-screen grid-cols-[auto_1fr] gap" style={{ backgroundColor: "var(--background)" }}>
      <Sidebar />
      <div className="flex min-h-screen flex-col min-w-0">
        <Header />
        <main className="flex flex-col min-w-0 flex-1 gap-3 p-3">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
