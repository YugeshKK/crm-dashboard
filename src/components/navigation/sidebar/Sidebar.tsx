import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./side.module.scss";
import { Menu, X } from "lucide-react";

type Props = {};

const Sidebar = (props: Props) => {
  const [collapse, setCollapsed]= useState(false);

  const handleCollapse=()=>{
    setCollapsed((prev)=> !prev);
  }

  const navClasses = `${styles.navCont} cursor-pointer ${collapse ? styles.collapsed : ""}`.trim();

  return (
    <div className={navClasses}> 
      <div className={collapse ? styles.collapse : styles.unCollapsed} onClick={handleCollapse}>
       { collapse ?  <Menu /> : <X/>}
      </div>

    <nav className={styles.navComp}>      
      <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
        Dashboard
      </NavLink>
      <NavLink
        to="/leads"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Leads
      </NavLink>
      <NavLink
        to="/customers"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Customers
      </NavLink>
      <NavLink
        to="/products"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Products
      </NavLink>
      <NavLink
        to="/practice"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Practice
      </NavLink>    

    </nav>
    </div>
  
  );
};

export default Sidebar;
