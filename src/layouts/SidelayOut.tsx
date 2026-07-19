import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/sidebar/Sidebar";
import Footer from "../components/navigation/sidebar/footer/Footer";

type Props = {};

const SideLayOut = (props: Props) => {
  return (
    <div>
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default SideLayOut;
