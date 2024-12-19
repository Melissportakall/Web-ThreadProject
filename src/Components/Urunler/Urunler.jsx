import React, { useState, useEffect } from 'react';
import styles from './Urunler.module.css';

const getUserDataFromCookies = () => {
  const cookies = document.cookie.split('; ');
  for (let cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === 'user_data') {
      return value;
    }
  }
  return null;
};

export const Urunler = () => {
  const [urunler, setUrunler] = useState([]);
  const [quantities, setQuantities] = useState({});

  const fetchUrunler = async () => {
    try {
      const response = await fetch('/tumurunler');
      if (response.ok) {
        const data = await response.json();
        setUrunler(data.products);
        const initialQuantities = data.products.reduce((acc, product) => {
          acc[product.id] = 1;
          return acc;
        }, {});
        setQuantities(initialQuantities);
      } else {
        console.error('Veriler alınamadı:', response.statusText);
      }
    } catch (error) {
      console.error('Veriler alınamadı:', error);
    }
  };

  const handleAddToCart = async (urun) => {
    const quantity = quantities[urun.id] || 1;
  
    try {
      const response = await fetch('/add_to_cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: urun.id,
          quantity: quantity,

        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      alert('Bir hata oluştu.');
    }
  };  

  const handleQuantityChange = (id, value) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: value > 0 ? value : 1, // Negatif veya sıfır değerleri önle
    }));
  };

  useEffect(() => {
    fetchUrunler();
  }, []);

  const handleClick = (urun) => {
    
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
            {/* Adet Giriş Alanı Artı/Eksi Butonları ile */}
            <div className={styles.quantityInputContainer}>
              <button
                className={styles.decrementButton}
                onClick={() =>
                  handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)
                }
              >
                -
              </button>
              <input
                type="number"
                className={styles.quantityInput}
                min="1"
                value={quantities[product.id] || 1}
                onChange={(e) =>
                  handleQuantityChange(product.id, parseInt(e.target.value))
                }
                placeholder="Adet"
              />
              <button
                className={styles.incrementButton}
                onClick={() =>
                  handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)
                }
              >
                +
              </button>
            </div>
            {/* Sepete Ekle Butonu */}
            <button
              className={styles.addToCartButton}
              onClick={(e) => {
                e.stopPropagation(); // Kartın tıklanma olayını engelle
                handleAddToCart(product);
              }}
            >
              Sipariş Ver
            </button>
          </div>
        ))
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
};

export default Urunler;
