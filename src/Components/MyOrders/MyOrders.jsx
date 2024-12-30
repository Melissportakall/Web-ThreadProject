import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { io } from 'socket.io-client';
import orderStyles from '../AdminLogs/AdminLogs.module.css';
import SideMenu from '../SideMenu/SideMenu';

const socket = io('http://127.0.0.1:3000');

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [progress, setProgress] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const customerId = getUserDataFromCookies();

  const openModal = (order) => {
    setSelectedOrder(order);
    setProgress(0);
    setModalIsOpen(true);
    console.log('Requesting order status for:', order.OrderID);
    socket.emit('order_status', { order_id: order.OrderID });
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedOrder(null);
    setProgress(0);
  };

  useEffect(() => {
    const handleOrderUpdate = (data) => {
      console.log('Order update received:', data);
      if (selectedOrder && data.order_id === selectedOrder.OrderID) {
        setProgress(data.progress);
        if (data.status === 'Completed') {
          setProgress(100);
        }
      }
    };

    socket.on('order_updated', handleOrderUpdate);

    return () => {
      socket.off('order_updated', handleOrderUpdate);
    };
  }, [selectedOrder]);

  useEffect(() => {
    if (customerId) {
      fetch(`/orders/${customerId}`)
        .then((response) => response.json())
        .then((data) => setOrders(data.orders))
        .catch((error) => console.error('Error fetching orders:', error));
    }
  }, [customerId]);

  return (
    <div className="my-orders">
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
              height: '20px',
              transition: 'width 0.5s ease-in-out',
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
