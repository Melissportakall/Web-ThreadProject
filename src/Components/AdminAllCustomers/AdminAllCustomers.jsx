import React, { useEffect, useState } from 'react';
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu';
import styles from './AdminAllCustomers.module.css';

const AdminAllCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/all-customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
      } else {
        console.error('Müşteriler alınamadı:', response.statusText);
      }
    } catch (error) {
      console.error('Hata oluştu:', error);
    }
  };

  
  const fetchLogs = async (customerId) => {
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
    }
  };

  
  const openModal = (customer) => {
    setSelectedCustomer(customer);
    fetchLogs(customer.CustomerID); 
    setIsModalOpen(true); 
  };

  
  const closeModal = () => {
    setIsModalOpen(false);
    setLogs([]); 
  };

  
  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="admin-all-users">
      <h1>THREADYOL - Müşteri Listesi</h1>
      <div className="sidebar">
        <AdminSideMenu />
      </div>
      <div className="all-customers">
        <div className={styles.container}>
          {Array.isArray(customers) && customers.length > 0 ? (
            customers.map((customer) => (
              <div 
                key={customer.CustomerID} 
                className={styles.card} 
                onClick={() => openModal(customer)} 
              >
                <h3>
                  {customer.Name} {customer.Surname}
                </h3>
                <p>Telefon: {customer.PhoneNumber}</p>
                <p>Bütçe: {customer.Budget} TL</p>
                <p>Tür: {customer.CustomerType}</p>
                <p>Toplam Harcama: {customer.TotalSpent} TL</p>
              </div>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </div>
        
        {/* Modal */}
        {isModalOpen && (
          <div className={styles.modal} onClick={closeModal}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()} 
            >
              <h3>
                {selectedCustomer.Name} {selectedCustomer.Surname} - Loglar
              </h3>
              {logs.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>Müşteri ID</th>
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
                        <td>{log.CustomerID}</td>
                        <td>{log.OrderID}</td>
                        <td>{log.LogDate}</td>
                        <td>{log.LogType}</td>
                        <td>{log.LogDetails}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Bu müşteri için log bulunamadı.</p>
              )}
              <button className={styles.closeButton} onClick={closeModal}>
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAllCustomers;
