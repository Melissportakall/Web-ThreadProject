import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../NavBar/Navbar';
import styles from './Cart.module.css';
import { apiRequest } from '../../api';

const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem('blue_cart') || '[]');
  } catch {
    return [];
  }
};

const Cart = () => {
  const [items, setItems] = useState(getCart());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Cart';
  }, []);

  const saveCart = (nextItems) => {
    setItems(nextItems);
    localStorage.setItem('blue_cart', JSON.stringify(nextItems));
  };

  const updateQuantity = (id, delta) => {
    const nextItems = items
      .map((item) => (String(item.id) === String(id) ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))
      .filter((item) => item.quantity > 0);
    saveCart(nextItems);
  };

  const removeItem = (id) => saveCart(items.filter((item) => String(item.id) !== String(id)));

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items],
  );

  const checkout = async () => {
    if (!items.length) return;
    setBusy(true);
    try {
      await Promise.all(
        items.map((item) =>
          apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify({
              product_id: Number(item.id),
              quantity: Number(item.quantity || 1),
            }),
          }),
        ),
      );
      saveCart([]);
      alert('Order placed successfully.');
    } catch (error) {
      alert(error.message || 'Unable to place order.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Cart</h1>
            <span className={styles.summaryBadge}>{items.length} item(s)</span>
          </div>

          {items.length === 0 ? (
            <div className={styles.emptyState}>Your cart is empty. Add a product to continue.</div>
          ) : (
            <div className={styles.grid}>
              <div className={styles.items}>
                {items.map((item) => (
                  <div key={item.id} className={styles.itemCard}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                    <div>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemMeta}>{item.category || 'Tech accessory'}</div>
                      <div className={styles.qtyWrap}>
                        <button type="button" className={styles.qtyButton} onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" className={styles.qtyButton} onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                    </div>
                    <div className={styles.priceCol}>
                      <span className={styles.itemTotal}>${Number(item.price || 0) * Number(item.quantity || 1)}.00</span>
                      <button type="button" className={styles.removeButton} onClick={() => removeItem(item.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <aside className={styles.summary}>
                <h2>Summary</h2>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>${subtotal}.00</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total</span>
                  <span>${subtotal}.00</span>
                </div>
                <button type="button" className={styles.checkoutButton} onClick={checkout} disabled={busy}>
                  {busy ? 'Placing order...' : 'Checkout'}
                </button>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
