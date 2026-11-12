import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainMenu.module.css';
import { apiRequest } from '../../api';

const fallbackProducts = [
  {
    id: 1,
    name: 'Audio Pro X9',
    price: 280,
    category: 'Headphones',
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'ChargeDock Mini',
    price: 65,
    category: 'Charger',
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Blue Cursor Pro',
    price: 95,
    category: 'Mouse',
    image:
      'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80',
  },
];

const categories = [
  {
    title: 'Headphones',
    copy: 'Immersive sound, premium comfort, and a clean fit for work and everyday listening.',
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
    icon: '◦',
  },
  {
    title: 'Chargers',
    copy: 'Fast, safe charging for your desk, travel bag, and daily tech routine.',
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80',
    icon: '✦',
  },
  {
    title: 'Mouse',
    copy: 'Precise control and ergonomic comfort designed for focus and long sessions.',
    image:
      'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80',
    icon: '◍',
  },
];

const promiseItems = [
  { title: 'Free Delivery', text: 'Fast and reliable delivery with no extra shipping cost on eligible orders.', icon: '▣' },
  { title: 'Self Pickup', text: 'Collect your order in-store when it is most convenient for you.', icon: '◌' },
  { title: 'Warranty', text: 'Every product is backed by a manufacturer guarantee for peace of mind.', icon: '✓' },
];

const normalizeProducts = (items) => {
  if (!Array.isArray(items) || items.length === 0) return fallbackProducts;

  return items.slice(0, 3).map((product, index) => ({
    id: product.id || index + 1,
    name: product.name || fallbackProducts[index].name,
    price: Number(product.price) || fallbackProducts[index].price,
    category: product.category || fallbackProducts[index].category,
    image: product.image || fallbackProducts[index].image,
  }));
};

const MainMenu = () => {
  const [products, setProducts] = useState(fallbackProducts);
  const navigate = useNavigate();

  const addToCart = (product) => {
    const raw = localStorage.getItem('blue_cart');
    const cart = raw ? JSON.parse(raw) : [];
    const index = cart.findIndex((item) => String(item.id) === String(product.id));

    if (index >= 0) {
      cart[index].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('blue_cart', JSON.stringify(cart));
    navigate('/cart');
  };

  useEffect(() => {
    document.title = 'Blue';
    apiRequest('/products')
      .then((data) => {
        const normalized = normalizeProducts(Array.isArray(data) ? data : data.products || []);
        setProducts(normalized);
      })
      .catch(() => {
        setProducts(fallbackProducts);
      });
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 3), [products]);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>B</span>
            BLUE
          </div>

          <nav className={styles.nav} aria-label="Main navigation">
            <button type="button" className={styles.navLink}>Home</button>
            <button type="button" className={styles.navLink}>Products</button>
            <button type="button" className={styles.navLink}>About</button>
            <button type="button" className={styles.navLink}>Find us</button>
            <button type="button" className={styles.navLink}>Pages</button>
          </nav>

          <button type="button" className={styles.buyButton}>Buy Now</button>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>Tech essentials</div>
            <h1>Upgrade Your Everyday Setup</h1>
            <p className={styles.heroText}>
              Discover clean, powerful accessories built for modern work and everyday life.
              Premium chargers, audio gear, and productivity tools made to keep up with you.
            </p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryButton}>Shop Now</button>
              <button type="button" className={styles.secondaryButton}>Learn More</button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <img
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80"
              alt="Blue premium headphones"
              className={styles.heroImage}
            />
          </div>
        </section>

        <div className={styles.contentSection}>
          <section>
            <div className={styles.sectionHeader}>
              <h2>Featured Products</h2>
              <button type="button" className={styles.sectionButton}>See All Products</button>
            </div>

            <div className={styles.featuredGrid}>
              {featuredProducts.map((product) => (
                <article
                  key={product.id}
                  className={styles.productCard}
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.productImageWrap}>
                    <img src={product.image} alt={product.name} className={styles.productImage} />
                  </div>

                  <div className={styles.productMeta}>
                    <p className={styles.productLabel}>{product.category}</p>
                  </div>

                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productAmount}>${product.price}.00 USD</p>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    style={{ marginTop: '12px', width: '100%' }}
                    onClick={(event) => {
                      event.stopPropagation();
                      addToCart(product);
                    }}
                  >
                    Add to cart
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section style={{ marginTop: '24px' }}>
            <div className={styles.sectionHeader}>
              <h2>Shop By Category</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className={styles.primaryButton} style={{ padding: '10px 14px', fontSize: '0.9rem' }}>↻</button>
                <button type="button" className={styles.primaryButton} style={{ padding: '10px 14px', fontSize: '0.9rem' }}>→</button>
              </div>
            </div>

            <div className={styles.categoryGrid}>
              {categories.map((category) => (
                <article key={category.title} className={styles.categoryCard}>
                  <div className={styles.categoryHead}>
                    <h3>{category.title}</h3>
                    <span className={styles.categoryIcon}>{category.icon}</span>
                  </div>

                  <p className={styles.categoryCopy}>{category.copy}</p>
                  <button type="button" className={styles.categoryLink}>View Accessories</button>

                  <div className={styles.categoryVisual}>
                    <img src={category.image} alt={category.title} className={styles.categoryImage} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.promiseSection}>
            <h2>Experience Streamlined <br /> Shopping With Blue</h2>

            <div className={styles.promiseGrid}>
              {promiseItems.map((item) => (
                <article key={item.title} className={styles.promiseCard}>
                  <div className={styles.promiseIcon}>{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
