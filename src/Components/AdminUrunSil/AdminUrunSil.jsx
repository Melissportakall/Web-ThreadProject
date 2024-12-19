import React, { useState } from 'react';
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu';
import styles from './AdminUrunSil.module.css';

export const AdminUrunSil = () => {
  const [productName, setProductName] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller

    try {
      const response = await fetch(`/urunsil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: productName }),
      });

      if (response.ok) {
        alert('Ürün başarıyla silindi!');
        setProductName('');
      } else {
        alert('Ürün silinirken bir hata oluştu!');
      }
    } catch (error) {
      console.error('Hata:', error);
      alert('Sunucuya bağlanırken bir hata oluştu!');
    }
  };

  return (
    <div className={styles.wrapper}>
      <AdminSideMenu />
      <div className={styles.container}>
        <h1 className={styles.title}>Ürün Sil</h1>
        <form className={styles.form} onSubmit={handleDelete}>
          <div className={styles.formGroup}>
            <label htmlFor="productName">Ürün Adı</label>
            <input
              type="text"
              id="productName"
              name="productName"
              placeholder="Silmek istediğiniz ürünün adını girin"
              className={styles.input}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Sil
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminUrunSil;
