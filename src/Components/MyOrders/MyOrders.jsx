import React from 'react';
import orderStyles from './MyOrders.modulo.css';
import SideMenu from '../SideMenu/SideMenu';

const MyOrders = () => {
  return (
    <div className={orderStyles.orders}>
      <div className="sidebar">
        <SideMenu />
      </div>
    </div>
  );
};

export default MyOrders;
