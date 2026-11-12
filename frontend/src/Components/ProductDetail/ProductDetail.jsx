import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../api';
import styles from './ProductDetail.module.css';

const fallbackProduct = {
  id: 1,
  name: 'Audio Pro X9',
  price: 280,
  stock: 12,
  category: 'Headphones',
  image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
  description: 'Wireless over-ear sound with a clean design and all-day comfort for focused listening and easy travel.',
};

const getCart = () => {
  const raw = localStorage.getItem('blue_cart');
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => localStorage.setItem('blue_cart', JSON.stringify(items));

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(fallbackProduct);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const products = await apiRequest('/products');
        const list = Array.isArray(products) ? products : products.products || [];
        const found = list.find((item) => String(item.id) === String(id)) || fallbackProduct;
        setProduct({ ...fallbackProduct, ...found, id: Number(found.id || id) });
      } catch {
        setProduct({ ...fallbackProduct, id: Number(id || fallbackProduct.id) });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const priceLabel = useMemo(() => `$${Number(product.price).toFixed(2)} USD`, [product.price]);

  const addToCart = () => {
    const cart = getCart();
    const index = cart.findIndex((item) => String(item.id) === String(product.id));

    if (index >= 0) {
      cart[index].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    navigate('/cart');
  };

  if (loading) {
    return <div className={styles.page}><div className={styles.loading}>Loading product...</div></div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.imageCard}>
          <img src={product.image} alt={product.name} className={styles.image} />
        </div>

        <div className={styles.infoCard}>
          <div className={styles.badge}>{product.category}</div>
          <h1>{product.name}</h1>
          <div className={styles.priceRow}>
            <span className={styles.price}>{priceLabel}</span>
            <span className={styles.stock}>In stock: {product.stock}</span>
          </div>

          <p className={styles.description}>{product.description}</p>

          <div className={styles.actions}>
            <button type="button" className={styles.primaryButton} onClick={addToCart}>
              Add to cart
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => navigate('/mainmenu')}>
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
