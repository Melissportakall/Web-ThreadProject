import React, { useEffect, useState } from 'react';
import styles from '../AdminLogs/AdminLogs.module.css';
import SideMenu from '../SideMenu/SideMenu';

const getUserDataFromCookies = () => {
  const cookies = document.cookie.split('; ');
  for (let cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === 'user_data') {
      return value;
    }
  }
  return null;
};

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const customerId = getUserDataFromCookies();

  const fetchLogs = async (customerId) => {
    console.log("müşteri id:", customerId);
    try {
      const response = await fetch(`/logs/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      } else {
        console.error("Loglar alınamadı:", response.statusText);
      }
    } catch (error) {
      console.error("Hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(customerId);
  }, []);

  return (
    <div className='admin-logs'>
        <h1>THREADYOL</h1>
        <div className="sidebar">
            <SideMenu />
        </div>
        <div className={styles.container}>
          <h1>Log Listesi</h1>
          {loading ? (
              <p>Yükleniyor...</p>
          ) : logs.length > 0 ? (
              <table className={styles.table}>
                <thead>
                    <tr>
                    <th>Log ID</th>
                    <th>Sipariş ID</th>
                    <th>Tarih ve Saat</th>
                    <th>Tür</th>
                    <th>Detay</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                    <tr key={log.LogID}>
                        <td>{log.LogID}</td>
                        <td>{log.OrderID}</td>
                        <td>{log.LogDate}</td>
                        <td>{log.LogType}</td>
                        <td>{log.LogDetails}</td>
                    </tr>
                    ))}
                </tbody>
              </table>
          ) : (
              <p>Log bulunamadı.</p>
          )}
        </div>
    </div>
  );
};

export default Logs;
