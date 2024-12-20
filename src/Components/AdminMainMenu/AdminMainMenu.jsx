import React from 'react';
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu';
import PendingOrders from '../PendingOrders/PendingOrders';

export const AdminMainMenu = () => {
  return (
    <div className="admin-main-menu">
      <h1>THREADYOL</h1>
      <div className="sidebar">
        <AdminSideMenu />
      </div>
      <div className="orders">
        <PendingOrders />
      </div>
    </div>
  );
};

export default AdminMainMenu;
