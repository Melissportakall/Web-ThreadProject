import React from 'react';
import styles from './AdminSideMenu.module.css'; 
import { Link } from 'react-router-dom';
import {useNavigate } from 'react-router-dom';
import { AdminUrunEkle } from '../AdminUrunEkle/AdminUrunEkle';
import { AdminMainMenu } from '../AdminMainMenu/AdminMainMenu';
import { AdminUrunSil } from '../AdminUrunSil/AdminUrunSil';
import { AdminStokGuncelle } from '../AdminStokGuncelle/AdminStokGuncelle';
import { AdminLogs } from '../AdminLogs/AdminLogs';

const SideMenu = () => {
    
    const navigate = useNavigate(); 

    const handleLogout = () => {
        
        navigate('/login'); 
    };
    
    return (
        <div className={styles.sideMenu}>
            <ul>

                 <li><Link to="/admin-mainmenu" className={styles.link}>Ana Sayfa</Link></li>
                <li><Link to="/user-info" className={styles.link}>Kullanıcı Bilgileri</Link></li>
                <li><Link to="/admin-urunekle" className={styles.link}>Ürün Ekleme</Link></li>
                <li><Link to="/admin-urunsil" className={styles.link}>Ürün Silme</Link></li>
                <li><Link to="/admin-stokguncelle" className={styles.link}>Stok Güncelleme</Link></li>
                <li><Link to="/admin-kayıtlıloglar" className={styles.link}>Kayıtlı Loglar</Link></li>
                <li>
                    <button onClick={handleLogout} className={styles.button}>Log Out</button>
                </li>
            
            </ul>
        </div>
    );
};

export default SideMenu;
