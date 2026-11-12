import React, { useEffect, useState } from 'react';
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu';
import { apiRequest } from '../../api';
import styles from './AdminAllProducts.module.css';

const AdminAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/products')
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(requestError.message || 'Could not load products.'));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f6fc' }}>
      <AdminSideMenu />
      <main style={{ flex: 1, minWidth: 0, padding: '32px' }}>
        <h1>Products</h1>
        {error ? (
          <p role="alert">{error}</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className={styles.container} style={{ margin: 0 }}>
            {products.map((product) => (
              <article key={product.id} className={styles.card}>
                <h3 className={styles.name}>{product.name}</h3>
                <p className={styles.price}>${product.price}.00</p>
                <p className={styles.stock}>Stock: {product.stock}</p>
                <p>Product ID: {product.id}</p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAllProducts;
