import React, { useState, useEffect } from 'react';
import styles from './PendingOrders.module.css';

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('/get_pending_orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        console.log('Ürünler alındı:', data);
      } else {
        console.error('Veriler alınamadı:', response.statusText);
      }
    } catch (error) {
      console.error('Hata oluştu:', error);
    }
  };

  const handleApprove = async (orderId) => {
    try {
      const response = await fetch(`/update_order_status/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Onaylandı' }),
      });
      if (response.ok) {
        fetchPendingOrders();
      } else {
        console.error('Sipariş onaylanamadı:', response.statusText);
      }
    } catch (error) {
      console.error('Onaylama hatası:', error);
    }
  };

  const handleReject = async (orderId) => {
    try {
      const response = await fetch(`/update_order_status/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Reddedildi' }),
      });
      if (response.ok) {
        fetchPendingOrders();
      } else {
        console.error('Sipariş reddedilemedi:', response.statusText);
      }
    } catch (error) {
      console.error('Reddetme hatası:', error);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

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

            <button className={styles.approveButton} onClick={() => handleApprove(order.OrderID)}>
                ✔
            </button>
            <button className={styles.rejectButton} onClick={() => handleReject(order.OrderID)}>
                ❌
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
