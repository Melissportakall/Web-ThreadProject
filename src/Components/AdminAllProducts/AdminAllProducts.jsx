import React, { useState, useEffect } from 'react';
import styles from './AdminAllProducts.module.css';
import AdminSideMenu from '../AdminSideMenu/AdminSideMenu';

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

export const Urunler = () => {
  const [urunler, setUrunler] = useState([]);
  const [modalData, setModalData] = useState({ id: '', name: '', stock: '', price: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  const fetchUrunler = async () => {
    try {
      const response = await fetch('/tumurunler');
      if (response.ok) {
        const data = await response.json();
        setUrunler(data.products);
      } else {
        console.error('Veriler alınamadı:', response.statusText);
      }
    } catch (error) {
      console.error('Veriler alınamadı:', error);
    }
  };

  useEffect(() => {
    fetchUrunler();
  }, []);

  const openModal = (product) => {
    setModalData(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch('/urunsil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: productToDelete.name }),
      });
      if (response.ok) {
        alert('Ürün başarıyla silindi!');
        fetchUrunler();
        closeDeleteModal();
      } else {
        const data = await response.json();
        alert(data.error || 'Bir hata oluştu');
      }
    } catch (error) {
      alert('Bir hata oluştu');
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const response = await fetch('/urunguncelle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modalData),
      });
      if (response.ok) {
        alert('Ürün başarıyla güncellendi!');
        fetchUrunler();
        closeModal();
      } else {
        const data = await response.json();
        alert(data.error || 'Bir hata oluştu');
      }
    } catch (error) {
      alert('Bir hata oluştu');
    }
  };

  return (
    <div className="admin-all-products">
      <h1>THREADYOL</h1>
      <div className="sidebar">
        <AdminSideMenu />
      </div>
      <div className="products">
        <div className={styles.container}>
          {Array.isArray(urunler) && urunler.length > 0 ? (
            urunler.map((product) => (
              <div key={product.id} className={styles.card}>
                <h3 className={styles.name}>{product.name}</h3>
                <p className={styles.price}>{product.price} TL</p>
                <p className={styles.price}>{product.stock} Adet</p>

                <div className={styles.deleteIcon} onClick={() => openDeleteModal(product)}>🗑️</div>
                <div className={styles.editIcon} onClick={() => openModal(product)}>✏️</div>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modal} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Ürün Güncelle</h3>
            <input
              type="text"
              value={modalData.name}
              onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
              placeholder="Ürün Adı"
            />
            <input
              type="number"
              value={modalData.stock}
              onChange={(e) => setModalData({ ...modalData, stock: e.target.value })}
              placeholder="Stok"
            />
            <input
              type="number"
              value={modalData.price}
              onChange={(e) => setModalData({ ...modalData, price: e.target.value })}
              placeholder="Fiyat"
            />
            <button onClick={handleUpdateProduct}>Kaydet</button>
            <button className={styles.closeButton} onClick={closeModal}>Kapat</button>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      {isDeleteModalOpen && (
        <div className={styles.modal} onClick={closeDeleteModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Ürünü Silmek İstediğinizden Emin Misiniz?</h3>
            <button onClick={handleDeleteProduct}>Evet</button>
            <button className={styles.closeButton} onClick={closeDeleteModal}>Hayır</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Urunler;
