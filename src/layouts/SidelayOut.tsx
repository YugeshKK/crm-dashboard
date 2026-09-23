import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/sidebar/AppSidebar";

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
