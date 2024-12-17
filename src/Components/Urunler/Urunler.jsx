import React, { useState, useEffect } from 'react';
import styles from './Urunler.module.css';

export const Urunler = () => {
  
  const [urunler, setUrunler] = useState([]);

  const fetchUrunler = async () => {
    try {
      const response = await fetch('/tumurunler'); 
      if (response.ok) {  // Durum kodunu kontrol edin
        const data = await response.json();
        setUrunler(data.products);
        console.log(data.products);
      } else {
        console.error('Veriler alınamadı:', response.statusText);
      }
    } catch (error) {
      console.error('Veriler alınamadı:', error);
    }
  };

  useEffect(() => {
    fetchUrunler();
  }, []);

  const handleClick = (urun) => {
    alert(`${urun.name} tıklandı!`);
  };

  return (
    <div className={styles.container}>
      {Array.isArray(urunler) && urunler.length > 0 ? (
        urunler.map((product) => (
          <div
            key={product.id}
            className={styles.card}
            onClick={() => handleClick(product)}
          >
            <h3 className={styles.name}>{product.name}</h3>
            <p className={styles.price}>{product.price} TL</p>
          </div>
        ))
      ) : (
        <p>No products found.</p>  // Ürün bulunamadığında gösterilecek metin
      )}
    </div>
  );
};

export default Urunler;
