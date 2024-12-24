import React, { useState } from 'react';
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu';
import PendingOrders from '../PendingOrders/PendingOrders';
import styles from './AdminMainMenu.module.css';

export const AdminMainMenu = () => {
  const [refreshOrders, setRefreshOrders] = useState(false);

  const handleApproveAll = async () => {
    try {
      const response = await fetch('/update_all_orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Onaylandı' }),
      });

      if (response.ok) {
        console.log('Tüm siparişler onaylandı.');
        setRefreshOrders((prev) => !prev);
      } else {
        console.error('Tüm siparişler onaylanamadı:', response.statusText);
      }
    } catch (error) {
      console.error('Tüm siparişler onaylanamadı:', error);
    }
  };

  const handleRejectAll = async () => {
    try {
      const response = await fetch('/update_all_orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Reddedildi' }),
      });

      if (response.ok) {
        console.log('Tüm siparişler reddedildi.');
        setRefreshOrders((prev) => !prev);
      } else {
        console.error('Tüm siparişler reddedilemedi:', response.statusText);
      }
    } catch (error) {
      console.error('Tüm siparişler reddedilemedi:', error);
    }
  };

  return (
    <div className="admin-main-menu">
      <h1>THREADYOL</h1>
      <div className="sidebar">
        <AdminSideMenu />
      </div>
      <div className={styles.buttonGroup}>
        <button className={styles.approveAllButton} onClick={handleApproveAll}>
          Tümünü Onayla
        </button>
        <button className={styles.rejectAllButton} onClick={handleRejectAll}>
          Tümünü Reddet
        </button>
      </div>
      <div className="orders" style={{ marginTop: '20px' }}>
        <PendingOrders refresh={refreshOrders} />
      </div>
    </div>
  );
};

export default AdminMainMenu;
