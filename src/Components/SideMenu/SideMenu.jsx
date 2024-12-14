import React from 'react';
import styles from './SideMenu.module.css'; // CSS modülünü içe aktarın
import { Link } from 'react-router-dom';
import {useNavigate } from 'react-router-dom';
import MainMenu from '../MainMenu/MainMenu';

const SideMenu = () => {

  const navigate = useNavigate(); 

    const handleLogout = () => {
        
        navigate('/login'); 
    };
  return (
    <div className={styles.sideMenu}>
      <ul>
      <li><Link to="/mainmenu" className={styles.link}>Ana Sayfa</Link></li>
        <li><Link to="/user-info" className={styles.link}>Kullanıcı Bilgileri</Link></li>
        <li><Link to="/sepetim" className={styles.link}>Sepetim</Link></li>
        <li><Link to="/siparislerim" className={styles.link}>Siparişlerim</Link></li>
        <li><Link to="/kayıtlıloglarım" className={styles.link}>Kayıtlı Loglarım</Link></li>
         <li>
           <button onClick={handleLogout} className={styles.button}>Log Out</button>
         </li>
      </ul>
    </div>
  );
};

export default SideMenu;
