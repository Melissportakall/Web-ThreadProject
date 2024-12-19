import React, { useState } from 'react';
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu';
import styles from './AdminStokGuncelle.module.css';

export const AdminStokGuncelle = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault(); 

    try {
      const response = await fetch(`/stokguncelle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productName,
          price: productPrice,
          stock: productStock,
        }),
      });

      if (response.ok) {
        alert('Ürün stoğu başarıyla güncellendi!');
        setProductName('');
        setProductPrice('');
        setProductStock('');
      } else {
        alert('Stoğu güncellerken bir hata oluştu!');
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
        <h1 className={styles.title}>Stok Güncelle</h1>
        <form className={styles.form} onSubmit={handleUpdate}>
          <div className={styles.formGroup}>
            <label htmlFor="productName">Ürün Adı</label>
            <input
              type="text"
              id="productName"
              name="productName"
              placeholder="Ürün adını girin"
              className={styles.input}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="productPrice">Ürün Ücreti</label>
            <input
              type="number"
              id="productPrice"
              name="productPrice"
              placeholder="Ürün ücretini girin"
              className={styles.input}
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="productStock">Stok Miktarı</label>
            <input
              type="number"
              id="productStock"
              name="productStock"
              placeholder="Stok miktarını girin"
              className={styles.input}
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Güncelle
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminStokGuncelle;
