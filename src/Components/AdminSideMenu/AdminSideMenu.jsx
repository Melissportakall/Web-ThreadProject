import React from 'react';
import styles from './AdminSideMenu.module.css'; 
import { Link } from 'react-router-dom';
import {useNavigate } from 'react-router-dom';

const SideMenu = () => {
    
    const navigate = useNavigate(); 

    const handleLogout = () => {
        navigate('/logout'); 
    };
    
    return (
        <div className={styles.sideMenu}>
            <ul>

                 <li><Link to="/admin-mainmenu" className={styles.link}>Ana Sayfa</Link></li>
                <li><Link to="/user-info" className={styles.link}>Kullanıcı Bilgileri</Link></li>
                <li><Link to="/admin-all-products" className={styles.link}>Tüm Ürünler</Link></li>
                <li><Link to="/admin-urunekle" className={styles.link}>Ürün Ekleme</Link></li>
                <li><Link to="/admin-logs" className={styles.link}>Kayıtlı Loglar</Link></li>
                <li>
                    <button onClick={handleLogout} className={styles.button}>Log Out</button>
                </li>
            
            </ul>
        </div>
    );
};

export default SideMenu;
