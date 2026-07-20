import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./side.module.scss";

type Props = {};

const Sidebar = (props: Props) => {
  return (
    <nav className={styles.navCont}>
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
  );
};

export default Sidebar;
