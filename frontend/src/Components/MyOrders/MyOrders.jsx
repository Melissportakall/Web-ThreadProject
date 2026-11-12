import React, { useEffect, useState } from 'react';
import Navbar from '../NavBar/Navbar';
import { apiRequest } from '../../api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Orders';
    apiRequest('/orders/me')
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #dfe8ff 0%, #edf4ff 100%)', padding: '28px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'rgba(255,255,255,0.8)', borderRadius: '24px', padding: '28px', boxShadow: '0 20px 42px rgba(32, 50, 94, 0.12)' }}>
          <h1 style={{ margin: '0 0 20px', color: '#101827' }}>My Orders</h1>

          {loading ? (
            <p>Loading your orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#edf3ff' }}>
                    <th style={cellStyle}>Order ID</th>
                    <th style={cellStyle}>Product ID</th>
                    <th style={cellStyle}>Qty</th>
                    <th style={cellStyle}>Total</th>
                    <th style={cellStyle}>Status</th>
                    <th style={cellStyle}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td style={cellStyle}>{order.id}</td>
                      <td style={cellStyle}>{order.product_id}</td>
                      <td style={cellStyle}>{order.quantity}</td>
                      <td style={cellStyle}>${order.total_price}.00</td>
                      <td style={cellStyle}>{order.status}</td>
                      <td style={cellStyle}>{new Date(order.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const cellStyle = {
  border: '1px solid #e2e8f0',
  padding: '12px 14px',
  textAlign: 'left',
  color: '#1f2937',
};

export default MyOrders;
