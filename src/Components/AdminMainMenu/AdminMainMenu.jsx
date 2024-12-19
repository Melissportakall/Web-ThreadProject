import React from 'react'
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu'
import Urunler from '../Urunler/Urunler'
export const AdminMainMenu = () => {
 
    
    return (
      <div className="adminmain-menu">
        <h1>THREADYOL</h1>
        <div className="sidebar">
          <AdminSideMenu />
        </div>
        <div className="products">
          <Urunler />
        </div>
      </div>
    );
  
}
