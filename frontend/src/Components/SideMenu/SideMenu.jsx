import React from 'react';
import styles from './SideMenu.module.css';
import { Link, useNavigate } from 'react-router-dom';

const SideMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <aside className={styles.sideMenu}>
      <div className={styles.brandBox}>
        <span className={styles.brandMark}>B</span>
        <span>Blue</span>
      </div>

      <ul className={styles.menuList}>
        <li><Link to="/mainmenu" className={styles.link}>Home</Link></li>
        <li><Link to="/view-profile" className={styles.link}>Profile</Link></li>
        <li><Link to="/my-orders" className={styles.link}>Orders</Link></li>
        <li><Link to="/logs" className={styles.link}>Logs</Link></li>
        <li><Link to="/cart" className={styles.link}>Cart</Link></li>
        <li>
          <button onClick={handleLogout} className={styles.button}>Logout</button>
        </li>
      </ul>
    </aside>
  );
};

export default SideMenu;
