import React from 'react';
import cartStyles from './Cart.modulo.css';
import SideMenu from '../SideMenu/SideMenu';

const Cart = () => {
  return (
    <div className={cartStyles.cart}>
      <div className="sidebar">
        <SideMenu />
      </div>
    </div>
  );
};

export default Cart;
