import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('threadyol_user_role') === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('threadyol_token');
    localStorage.removeItem('threadyol_user_role');
    document.cookie = 'remember_me=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/login');
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>B</span>
        BLUE
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        <Link to="/mainmenu" className={styles.link}>Home</Link>
        {!isAdmin && <Link to="/my-orders" className={styles.link}>Orders</Link>}
        <Link to="/logs" className={styles.link}>Logs</Link>
        <Link to="/view-profile" className={styles.link}>Profile</Link>
        {!isAdmin && <Link to="/cart" className={styles.link}>Cart</Link>}
        {isAdmin && <Link to="/admin-mainmenu" className={styles.link}>Dashboard</Link>}
      </nav>

      <button type="button" className={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

export default Navbar;
