import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import Leads from '../pages/leads/Leads';
import Customers from '../pages/customers/Customers';
import Products from '../pages/products/Products';
import SideLayOut from '../layouts/SidelayOut';
import Practice from '../pages/practice/Practice';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path='leads' element={<Leads/>}/>
        <Route path='customers' element={<Customers/>}/>
        <Route path='practice' element={<Practice/>}/>
      </Route>
      <Route element= {<SideLayOut/>}>
        <Route path='products' element={<Products/>}/>
      </Route>
    </Routes>
  );
};

export default AppRoutes;