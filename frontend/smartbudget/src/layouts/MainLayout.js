// src/layouts/MainLayout.jsx
import React from 'react';
import Sidebar from '../components/SideBarComponent';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
