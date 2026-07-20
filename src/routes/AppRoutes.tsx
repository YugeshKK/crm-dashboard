import React from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Leads from "../pages/leads/Leads";
import Customers from "../pages/customers/Customers";
import Products from "../pages/products/Products";
import Practice from "../pages/practice/Practice";
import ProtectedRoutes from "./ProtectedRoutes";
import Login from "../pages/login/Login";
import AuthLayout from "../layouts/AuthLayout";

const AppRoutes = () => {
  return (
    <Routes>
      // Website Layout
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="customers" element={<Customers />} />
      </Route>

      //Auth Layout
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoutes />}>
        <Route path="products" element={<Products />} />
        <Route path="practice" element={<Practice />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
