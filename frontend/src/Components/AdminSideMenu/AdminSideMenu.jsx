import React from 'react';
import styles from './AdminSideMenu.module.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiActivity, FiBox, FiGrid, FiLogOut, FiUsers } from 'react-icons/fi';

const SideMenu = () => {
  const navigate = useNavigate();
  const links = [
    { to: '/admin-mainmenu', label: 'Dashboard', icon: FiGrid },
    { to: '/admin-all-customers', label: 'Customers', icon: FiUsers },
    { to: '/admin-all-products', label: 'Products', icon: FiBox },
    { to: '/admin-logs', label: 'System logs', icon: FiActivity },
  ];

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <aside className={styles.sideMenu}>
      <div className={styles.brandBox}>
        <span className={styles.brandMark}>B</span>
        <span><strong>BLUE</strong><small>CONTROL CENTER</small></span>
      </div>

      <ul className={styles.menuList}>
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ''}`}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className={styles.sidebarFooter}>
        <div className={styles.adminProfile}>
          <span className={styles.avatar}>A</span>
          <span><strong>Administrator</strong><small>Store management</small></span>
        </div>
        <button onClick={handleLogout} className={styles.button}>
          <FiLogOut aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default SideMenu;
