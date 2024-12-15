import React, { useState } from 'react';
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu';
import styles from './AdminUrunEkle.module.css';

export const AdminUrunEkle = () => {
  const [productName, setProductName] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller

    try {
      const response = await fetch('/urunekle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productName,
          stock: parseInt(productStock),
          price: parseInt(productPrice),
        }),
      });

      if (response.ok) {
        alert('Ürün başarıyla eklendi!');
        setProductName('');
        setProductStock('');
        setProductPrice('');
      } else {
        alert('Ürün eklenirken bir hata oluştu!');
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
        <h1 className={styles.title}>Ürün Ekle</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="productName">Ürün İsmi</label>
            <input
              type="text"
              id="productName"
              name="productName"
              placeholder="Ürün ismini girin"
              className={styles.input}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="productPrice">Ücret</label>
            <input
              type="number"
              id="productPrice"
              name="productPrice"
              placeholder="Ürünün ücretini girin"
              className={styles.input}
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="productStock">Stok</label>
            <input
              type="number"
              id="productStock"
              name="productStock"
              placeholder="Ürün stok miktarını girin"
              className={styles.input}
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
            />
          </div>
        
          <div className={styles.formGroup}>
            <label htmlFor="productImage">Resim Yükle</label>
            <input
              type="file"
              id="productImage"
              name="productImage"
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Ekle
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminUrunEkle;
