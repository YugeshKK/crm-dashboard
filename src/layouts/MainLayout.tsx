import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/sidebar/Sidebar";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";

type Props = {};

const MainLayout = (props: Props) => {
  return (
    <div className="grid min-h-screen grid-cols-[280px_1fr] gap">
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
