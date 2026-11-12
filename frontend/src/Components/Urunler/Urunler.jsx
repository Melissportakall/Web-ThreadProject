import React, { useState, useEffect } from 'react';
import styles from './Urunler.module.css';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { apiRequest } from '../../api';

Chart.register(...registerables);

export const Urunler = () => {
  const [urunler, setUrunler] = useState([]);
  const [quantities, setQuantities] = useState({});

  const fetchUrunler = async () => {
    try {
      const data = await apiRequest('/products');
      const products = Array.isArray(data) ? data : data.products || [];
      setUrunler(products);
      const initialQuantities = products.reduce((acc, product) => {
        acc[product.id] = 1;
        return acc;
      }, {});
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Veriler alınamadı:', error);
    }
  };

  const handleAddToCart = async (urun) => {
    const quantity = quantities[urun.id] || 1;
    try {
      const data = await apiRequest('/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('threadyol_token')}`,
        },
        body: JSON.stringify({ product_id: urun.id, quantity }),
      });
      alert(data.message || 'Sipariş verildi.');
    } catch (error) {
      alert(error.message || 'Bir hata oluştu.');
    }
  };

  const handleQuantityChange = (id, value) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: value > 0 ? value : 1,
    }));
  };

  useEffect(() => {
    fetchUrunler();
  }, []);

  const chartData = {
    labels: urunler.map((product) => product.name),
    datasets: [
      {
        label: 'Stok Miktarı',
        data: urunler.map((product) => product.stock),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  return (
    <div>
      <div className={styles.container}>
        {Array.isArray(urunler) && urunler.length > 0 ? (
          urunler.map((product) => (
            <div key={product.id} className={styles.card} onClick={() => console.log(product)}>
              <h3 className={styles.name}>{product.name}</h3>
              <p className={styles.price}>{product.price} TL</p>

              <div className={styles.quantityInputContainer}>
                <button
                  className={styles.decrementButton}
                  onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                >
                  -
                </button>
                <input
                  type="number"
                  className={styles.quantityInput}
                  min="1"
                  value={quantities[product.id] || 1}
                  onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                  placeholder="Adet"
                />
                <button
                  className={styles.incrementButton}
                  onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                >
                  +
                </button>
              </div>

              <button
                className={styles.addToCartButton}
                onClick={(e) => {
                  e.stopPropagation();
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

      {urunler.length > 0 && (
        <div className={styles.chartContainer}>
          <h2>Stok Durumu</h2>
          <Bar data={chartData} />
        </div>
      )}
    </div>
  );
};

export default Urunler;
