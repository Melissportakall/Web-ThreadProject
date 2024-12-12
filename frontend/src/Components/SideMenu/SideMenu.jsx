import React from 'react';
import styles from './SideMenu.module.css'; // CSS modülünü içe aktarın
import { Link } from 'react-router-dom';

const SideMenu = () => {
  return (
    <div className={styles.sideMenu}>
      <ul>
        <li><button className={styles.button}>Log Out</button></li>
        <li><Link to="/user-info" className={styles.link}>Kullanıcı Bilgileri</Link></li>
        <li><Link to="/cart" className={styles.link}>Sepetim</Link></li>
      </ul>
    </div>
  );
};

export default SideMenu;
