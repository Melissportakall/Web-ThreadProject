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
  const [isNewProductModalOpen, setNewProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUrunler = async () => {
    setLoading(true);
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
    setLoading(false);
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

  const closeNewProductModal = () => {
    setNewProductModalOpen(false);
  }

  const handleAddProduct = () => {
    setNewProductModalOpen(true)
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/urunekle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProductName,
          stock: parseInt(newProductStock),
          price: parseInt(newProductPrice),
        }),
      });

      if (response.ok) {
        alert('Ürün başarıyla eklendi!');
        setNewProductName('');
        setNewProductStock('');
        setNewProductPrice('');
        fetchUrunler();
        setNewProductModalOpen(false);
      } else {
        alert('Ürün eklenirken bir hata oluştu!');
      }
    } catch (error) {
      console.error('Hata:', error);
      alert('Sunucuya bağlanırken bir hata oluştu!');
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
                <p className={styles.stock}>{product.stock} Adet</p>

                <div className={styles.deleteIcon} onClick={() => openDeleteModal(product)}>🗑️</div>
                <div className={styles.editIcon} onClick={() => openModal(product)}>✏️</div>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
          <div className={styles.card} onClick={handleAddProduct} style={{ cursor: 'pointer' }}>
            <div className={styles['image-container']}>
              <img
                src="https://img.icons8.com/m_rounded/512/plus.png"
                alt="Add Product"
                className={styles.addProductIcon}
              />
            </div>
          </div>
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

      {/* Modal for adding new product */}
      {isNewProductModalOpen && (
        <div className={styles.modal} onClick={closeNewProductModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Yeni Ürün Ekle</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Ürün Adı"
              />
              <input
                type="number"
                value={newProductStock}
                onChange={(e) => setNewProductStock(e.target.value)}
                placeholder="Stok"
              />
              <input
                type="number"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                placeholder="Fiyat"
              />
              <button type="submit">Ürün Ekle</button>
            </form>
            <button className={styles.closeButton} onClick={closeNewProductModal}>İptal</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Urunler;
