import React, { useEffect, useState } from 'react';
import Navbar from '../NavBar/Navbar';
import { apiRequest } from '../../api';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Logs';
    apiRequest('/logs')
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #dfe8ff 0%, #edf4ff 100%)', padding: '28px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'rgba(255,255,255,0.8)', borderRadius: '24px', padding: '28px', boxShadow: '0 20px 42px rgba(32, 50, 94, 0.12)' }}>
          <h1 style={{ margin: '0 0 20px', color: '#101827' }}>Logs</h1>

          {loading ? (
            <p>Loading logs...</p>
          ) : logs.length === 0 ? (
            <p>No log entries found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#edf3ff' }}>
                    <th style={cellStyle}>Log ID</th>
                    <th style={cellStyle}>Order ID</th>
                    <th style={cellStyle}>Type</th>
                    <th style={cellStyle}>Created</th>
                    <th style={cellStyle}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={cellStyle}>{log.id}</td>
                      <td style={cellStyle}>{log.order_id ?? '-'}</td>
                      <td style={cellStyle}>{log.log_type}</td>
                      <td style={cellStyle}>{new Date(log.created_at).toLocaleString()}</td>
                      <td style={cellStyle}>{log.log_details}</td>
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
  verticalAlign: 'top',
};

export default Logs;
