import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/sidebar/Sidebar";
import Footer from "../components/navigation/sidebar/footer/Footer";

type Props = {};

const MainLayout = (props: Props) => {
  return (
    <div>
      <Sidebar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default MainLayout;
