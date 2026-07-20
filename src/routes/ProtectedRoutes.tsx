import React from 'react'
import { Navigate, Outlet } from 'react-router';

type Props = {}

const ProtectedRoutes = (props: Props) => {
    const isAuthenticated = false; 
  return isAuthenticated ? <Outlet/> : <Navigate to ="/login" replace/>
}

export default ProtectedRoutes