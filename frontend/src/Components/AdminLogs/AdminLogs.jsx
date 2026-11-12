import React, { useEffect, useState } from 'react';
import styles from './AdminLogs.module.css';
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu';
import { apiRequest } from '../../api';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const data = await apiRequest('/logs');
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Hata oluştu:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f6fc' }}>
      <AdminSideMenu />
      <main style={{ flex: 1, minWidth: 0, padding: '32px', overflowX: 'auto' }}>
        <h1>System Logs</h1>
        <div className={styles.container} style={{ maxWidth: 'none', margin: 0, textAlign: 'left' }}>
          {loading ? (
            <p>Loading...</p>
          ) : logs.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Customer ID</th>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.customer_id ?? '-'}</td>
                    <td>{log.order_id ?? '-'}</td>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.log_type}</td>
                    <td>{log.log_details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No logs found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Logs;
