import React, { useEffect, useState } from 'react';
import orderStyles from '../AdminLogs/AdminLogs.module.css';
import SideMenu from '../SideMenu/SideMenu';

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

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const customerId = getUserDataFromCookies();
  
  useEffect(() => {
    if (customerId) {
      fetch(`/orders/${customerId}`)
        .then((response) => response.json())
        .then((data) => setOrders(data.orders))
        .catch((error) => console.error('Error fetching orders:', error));
    }
  }, [customerId]);

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
                <tr key={order.OrderID}>
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
    </div>
  );
};

export default MyOrders;
