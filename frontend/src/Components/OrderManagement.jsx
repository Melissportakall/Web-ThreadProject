import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderManagement = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [userType, setUserType] = useState('normal');
  const navigate = useNavigate();

  useEffect(() => {
    
    fetchProducts();
    fetchUserType();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchUserType = async () => {
    try {
      const response = await fetch('/user-type', {
        credentials: 'include',
      });
      const data = await response.json();
      setUserType(data.userType);
    } catch (error) {
      console.error('Error fetching user type:', error);
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const submitOrder = async () => {
    try {
      const response = await fetch('/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, userType }),
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        alert('Order submitted successfully!');
        setCart([]);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('An error occurred while submitting the order.');
    }
  };

  return (
    <div>
      <h1>Order Management</h1>
      <div>
        <h2>Products</h2>
        {products.map((product) => (
          <div key={product.id}>
            <span>{product.name}</span>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
      <div>
        <h2>Cart</h2>
        {cart.map((item, index) => (
          <div key={index}>{item.name}</div>
        ))}
        <button onClick={submitOrder}>Submit Order</button>
      </div>
    </div>
  );
};

export default OrderManagement;

