import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { io } from 'socket.io-client';
import orderStyles from '../AdminLogs/AdminLogs.module.css';
import SideMenu from '../SideMenu/SideMenu';

const socket = io('http://localhost:3000'); // Backend'in adresini yazın

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [progress, setProgress] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const customerId = getUserDataFromCookies();

  const openModal = (order) => {
    setSelectedOrder(order);
    setProgress(0); // Yeni sipariş için progress sıfırlanır
    setModalIsOpen(true);
    console.log('Requesting order status for gönderdik orderidyi:', order.OrderID); // Debug log
    socket.emit('order_status', { order_id: order.OrderID }); // WebSocket ile sipariş durumu talebi
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedOrder(null);
    setProgress(0);
  };
  socket.on('connect', () => {
    console.log('Connected to WebSocket server!');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server!');
  });

  socket.on('order_updated', (data) => {
    console.log('Order updated:', data);
    if (selectedOrder && data.order_id === selectedOrder.OrderID) {
      setProgress((prev) => Math.min(prev + 20, 100)); // Progress bar'ı güncelle
      if (data.status === 'Completed') {
        setProgress(100); // İşlem tamamlandı
      }
    }
  });
  
  useEffect(() => {
    if (customerId) {
      fetch(`/orders/${customerId}`)
        .then((response) => response.json())
        .then((data) => setOrders(data.orders))
        .catch((error) => console.error('Error fetching orders:', error));
    }
  
    const handleOrderUpdate = (data) => {
      console.log('Order update received:', data);
      if (selectedOrder && data.order_id === selectedOrder.OrderID) {
        setProgress((prev) => {
          const newProgress = Math.min(prev + 20, 100);
          console.log(`Updated progress: ${newProgress}%`); // Yeni progress değerini konsola yazdır
          return newProgress;
        });
        if (data.status === 'Completed') {
          setProgress(100); // İşlem tamamlandı
        }
      }
    };
  
    socket.on('order_updated', handleOrderUpdate);
    socket.on('order_error', (error) => {
      console.error('Error from WebSocket:', error);
      alert(`WebSocket Error: ${error}`);
    });
  
    return () => {
      socket.off('order_updated', handleOrderUpdate); // Temizleme
      socket.off('order_error');
    };
  }, [customerId, selectedOrder]);
  
  return (
    <div className='my-orders'>
      <h1>THREADYOL</h1>
      <div className="sidebar">
        <SideMenu />
      </div>
      <div className={orderStyles.container}>
        <h1>My Orders</h1>
        {orders.length > 0 ? (
          <table className={orderStyles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product ID</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Order Date</th>
                <th>Order Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.OrderID} onClick={() => openModal(order)}>
                  <td>{order.OrderID}</td>
                  <td>{order.ProductID}</td>
                  <td>{order.Quantity}</td>
                  <td>{order.TotalPrice} TL</td>
                  <td>{order.OrderDate}</td>
                  <td>{order.OrderStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders found.</p>
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Order Progress"
        ariaHideApp={false}
        className={orderStyles.modal}
      >
        <h2>Order Progress</h2>
        {selectedOrder && <p>Order ID: {selectedOrder.OrderID}</p>}
        <div className={orderStyles.progressBar}>
          <div
            style={{
              width: `${progress}%`,
              backgroundColor: progress === 100 ? 'green' : 'blue',
            }}
          >
            {progress}%
          </div>
        </div>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

const getUserDataFromCookies = () => {
  const cookies = document.cookie.split('; ');
  for (let cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === 'user_data') {
      return JSON.parse(decodeURIComponent(value));
    }
  }
  return null;
};

export default MyOrders;
