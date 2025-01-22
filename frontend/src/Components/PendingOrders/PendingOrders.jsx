import React, { useState, useEffect } from 'react';
import styles from './PendingOrders.module.css';

const PendingOrders = ({ refresh, setNoPendingOrders }) => {
  const [orders, setOrders] = useState([]);

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('/get_pending_orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        console.log('Ürünler alındı:', data);
        
        setNoPendingOrders(data.orders.length === 0);
      } else {
        console.error('Veriler alınamadı:', response.statusText);
      }
    } catch (error) {
      console.error('Hata oluştu:', error);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, [refresh]);

  return (
    <div className={styles.container}>
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order.OrderID} className={styles.card}>
            <h3>Sipariş ID: {order.OrderID}</h3>
            <p>Müşteri: {order.CustomerName}</p>
            <p>Müşteri Türü: {order.CustomerType}</p>
            <p>Ürün: {order.ProductName}</p>
            <p>Adet: {order.Quantity}</p>
            <p>Toplam Fiyat: {order.TotalPrice} TL</p>
            <p>Tarih: {order.OrderDate}</p>
            <p>Durum: {order.OrderStatus}</p>

            <button className={styles.approveButton}>
              ✔
            </button>
            <button className={styles.rejectButton}>
              X
            </button>
          </div>
        ))
      ) : (
        <p>Beklemede sipariş bulunamadı.</p>
      )}
    </div>
  );
};

export default PendingOrders;
