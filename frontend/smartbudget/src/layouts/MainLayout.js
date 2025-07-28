// src/layouts/MainLayout.jsx
import React from 'react';
import Sidebar from '../components/SideBarComponent';

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
    </div>
  );
};

export default MainLayout;
