import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { FiActivity, FiBox, FiDollarSign, FiUsers } from 'react-icons/fi';
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu';
import { apiRequest } from '../../api';
import styles from './AdminMainMenu.module.css';

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

const palette = ['#4169e1', '#22b8a7', '#f4a340', '#9165e8', '#ed6a82', '#42a5f5'];

const AdminMainMenu = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    try {
      const [productData, customerData, queueData, logData] = await Promise.all([
        apiRequest('/products'),
        apiRequest('/customers'),
        apiRequest('/orders/queue'),
        apiRequest('/logs'),
      ]);
      setProducts(Array.isArray(productData) ? productData : []);
      setCustomers(Array.isArray(customerData) ? customerData : []);
      setQueue(Array.isArray(queueData?.items) ? queueData.items : []);
      setLogs(Array.isArray(logData) ? logData : []);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not load dashboard data.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Blue Admin Dashboard';
    loadDashboard();
  }, [loadDashboard]);

  const processNextOrder = async () => {
    setProcessing(true);
    try {
      await apiRequest('/orders/process-next', { method: 'POST' });
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || 'Could not process the next order.');
    } finally {
      setProcessing(false);
    }
  };

  const productStockData = useMemo(() => ({
    labels: products.map((product) => product.name),
    datasets: [{
      data: products.map((product) => Number(product.stock) || 0),
      backgroundColor: products.map((_, index) => palette[index % palette.length]),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }), [products]);

  const logTypeData = useMemo(() => {
    const counts = logs.reduce((result, log) => {
      const type = log.log_type || 'OTHER';
      result[type] = (result[type] || 0) + 1;
      return result;
    }, {});

    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: Object.keys(counts).map((_, index) => palette[index % palette.length]),
        borderWidth: 0,
      }],
    };
  }, [logs]);

  const logTimelineData = useMemo(() => {
    const counts = logs.reduce((result, log) => {
      const date = new Date(log.created_at).toISOString().slice(0, 10);
      result[date] = (result[date] || 0) + 1;
      return result;
    }, {});
    const timeline = Object.entries(counts).sort(([first], [second]) => first.localeCompare(second));

    return {
      labels: timeline.map(([date]) => new Date(`${date}T00:00:00`).toLocaleDateString()),
      datasets: [{
        label: 'Log events',
        data: timeline.map(([, count]) => count),
        borderColor: '#4169e1',
        backgroundColor: 'rgba(65, 105, 225, 0.12)',
        fill: true,
        tension: 0.38,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    };
  }, [logs]);

  const totalSales = customers.reduce((sum, customer) => sum + (Number(customer.total_spent) || 0), 0);
  const failedLogs = logs.filter((log) => ['ERROR', 'FAILED'].includes((log.log_type || '').toUpperCase())).length;

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 }, border: { display: false } },
    },
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 18 } } },
  };

  return (
    <div className={styles.adminLayout}>
      <AdminSideMenu />
      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>OVERVIEW</p>
            <h1>Dashboard</h1>
            <p className={styles.subtitle}>Monitor store activity, inventory, and system events.</p>
          </div>
          <button type="button" className={styles.refreshButton} onClick={loadDashboard} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh data'}
          </button>
        </header>

        {error && <div className={styles.error} role="alert">{error}</div>}

        <section className={styles.metricGrid} aria-label="Store metrics">
          <article className={styles.metricCard}>
            <span className={`${styles.metricIcon} ${styles.blueIcon}`}><FiBox /></span>
            <div><p>Products</p><strong>{products.length}</strong></div>
            <span className={styles.metricNote}>In catalog</span>
          </article>
          <article className={styles.metricCard}>
            <span className={`${styles.metricIcon} ${styles.tealIcon}`}><FiUsers /></span>
            <div><p>Customers</p><strong>{customers.filter((customer) => customer.role !== 'admin').length}</strong></div>
            <span className={styles.metricNote}>Registered accounts</span>
          </article>
          <article className={styles.metricCard}>
            <span className={`${styles.metricIcon} ${styles.amberIcon}`}><FiActivity /></span>
            <div><p>Queued orders</p><strong>{queue.length}</strong></div>
            <span className={styles.metricNote}>{queue.length ? 'Awaiting processing' : 'All caught up'}</span>
          </article>
          <article className={styles.metricCard}>
            <span className={`${styles.metricIcon} ${styles.purpleIcon}`}><FiDollarSign /></span>
            <div><p>Total sales</p><strong>${totalSales.toLocaleString()}</strong></div>
            <span className={styles.metricNote}>Completed customer spend</span>
          </article>
        </section>

        <section className={styles.chartGrid} aria-label="Store analytics">
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><h2>Inventory by product</h2><p>Current available stock</p></div>
            </div>
            {products.length ? (
              <div className={styles.donutChart}><Doughnut data={productStockData} options={donutOptions} /></div>
            ) : <p className={styles.emptyState}>No product inventory to display.</p>}
          </article>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><h2>Log type distribution</h2><p>Events recorded by the system</p></div>
              {failedLogs > 0 && <span className={styles.warningBadge}>{failedLogs} errors</span>}
            </div>
            {logs.length ? (
              <div className={styles.donutChart}><Doughnut data={logTypeData} options={donutOptions} /></div>
            ) : <p className={styles.emptyState}>No system events have been recorded yet.</p>}
          </article>
          <article className={`${styles.panel} ${styles.timelinePanel}`}>
            <div className={styles.panelHeader}>
              <div><h2>Activity over time</h2><p>Log events grouped by day</p></div>
            </div>
            {logs.length ? (
              <div className={styles.lineChart}><Line data={logTimelineData} options={lineOptions} /></div>
            ) : <p className={styles.emptyState}>Activity will appear here as the system records events.</p>}
          </article>
        </section>

        <section className={styles.bottomGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><h2>Priority queue</h2><p>Orders waiting for processing</p></div>
              <button
                type="button"
                className={styles.processButton}
                onClick={processNextOrder}
                disabled={processing || queue.length === 0}
              >
                {processing ? 'Processing...' : 'Process next'}
              </button>
            </div>
            {queue.length === 0 ? (
              <p className={styles.emptyState}>No orders are waiting in the queue.</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Priority</th></tr></thead>
                  <tbody>
                    {queue.map((order) => (
                      <tr key={order.order_id}>
                        <td>#{order.order_id}</td>
                        <td>{order.customer_id}</td>
                        <td>{order.product_id}</td>
                        <td>{order.quantity}</td>
                        <td><span className={styles.priority}>{Number(order.priority_score).toFixed(1)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><h2>Recent activity</h2><p>Latest system events</p></div>
            </div>
            {logs.length === 0 ? (
              <p className={styles.emptyState}>No recent activity.</p>
            ) : (
              <ul className={styles.activityList}>
                {logs.slice(0, 5).map((log) => (
                  <li key={log.id}>
                    <span className={`${styles.activityDot} ${log.log_type?.toUpperCase() === 'ERROR' ? styles.errorDot : ''}`} />
                    <div>
                      <strong>{log.log_type || 'EVENT'} <span>· Order #{log.order_id ?? '-'}</span></strong>
                      <p>{log.log_details}</p>
                      <time>{new Date(log.created_at).toLocaleString()}</time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </main>
    </div>
  );
};

export default AdminMainMenu;
