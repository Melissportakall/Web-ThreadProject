import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import styles from './AdminDynamicLog.module.css';

const AdminDynamicLog = () => {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    const socket = io('http://127.0.0.1:3000');

    socket.on('connect', () => {
      console.log('WebSocket bağlantısı kuruldu.');
    });

    socket.on('dynamic_logs', (receivedLogs) => {
      console.log('Gelen loglar:', receivedLogs);

      if (Array.isArray(receivedLogs)) {
        setLogs(receivedLogs);
      } else {
        setLogs((prevLogs) => [receivedLogs, ...prevLogs]);
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket bağlantısı kapatıldı.');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className={styles.logContainer}>
      <h2>Logs</h2>
      <ul className={styles.logList}>
        {logs.map((log, index) => (
          <li key={index} className={styles.logItem}>
            <strong>{log.LogDate}</strong> - <strong>{log.LogType}:</strong> Müşteri {log.CustomerID} {log.LogDetails}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDynamicLog;
