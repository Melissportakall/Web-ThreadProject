import React, { useEffect, useState } from 'react';
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu';
import { apiRequest } from '../../api';
import styles from './AdminAllCustomers.module.css';

const AdminAllCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/customers')
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(requestError.message || 'Could not load customers.'));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f6fc' }}>
      <AdminSideMenu />
      <main style={{ flex: 1, minWidth: 0, padding: '32px' }}>
        <h1>Customers</h1>
        {error ? (
          <p role="alert">{error}</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div className={styles.container} style={{ margin: 0 }}>
            {customers.map((customer) => (
              <article key={customer.id} className={styles.card}>
                <h3>{customer.name || customer.username} {customer.surname || ''}</h3>
                <p>@{customer.username}</p>
                <p>Role: {customer.role}</p>
                <p>Type: {customer.customer_type || 'standard'}</p>
                <p>Budget: ${customer.budget}.00</p>
                <p>Total spent: ${customer.total_spent}.00</p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAllCustomers;
