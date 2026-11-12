import React, { useEffect, useState } from 'react';
import { FaUser, FaUnlockAlt, FaDollarSign, FaIdCard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import styles from './RegisterForm.module.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
  username: '',
  name: '',
  surname: '',
  password: '',
  budget: '',
  customer_type: 'standard',
  });
  const [error, setError] = useState('');

  useEffect(() => {
  document.title = 'Register';
  }, []);

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        budget: Number(formData.budget) || 0,
      }),
    });

    navigate('/login');
  } catch (err) {
    setError(err.message || 'Registration failed.');
  }
  };

  return (
  <div className={styles.page}>
    <div className={styles.wrapper}>
      <div className={styles.formBox}>
        <div className={styles.header}>
          <span className={styles.brandMark}>B</span>
          <h1>Register</h1>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <div className={styles.inputBox}>
              <input type="text" name="username" placeholder="Username" required onChange={handleChange} />
              <FaUser className={styles.icon} />
            </div>

            <div className={styles.inputBox}>
              <input type="text" name="name" placeholder="Name" required onChange={handleChange} />
              <FaUser className={styles.icon} />
            </div>

            <div className={styles.inputBox}>
              <input type="text" name="surname" placeholder="Surname" required onChange={handleChange} />
              <FaIdCard className={styles.icon} />
            </div>

            <div className={styles.inputBox}>
              <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
              <FaUnlockAlt className={styles.icon} />
            </div>

            <div className={styles.inputBoxFull}>
              <input type="number" name="budget" placeholder="Budget" min="0" required onChange={handleChange} />
              <FaDollarSign className={styles.icon} />
            </div>
          </div>

          <div className={styles.rememberForgot}>
            <label><input type="checkbox" required /> I agree to the terms & conditions</label>
          </div>

          <button type="submit" className={styles.submitButton}>Create Account</button>

          <div className={styles.registerLink}>
            <p>
              Already have an account?
              <span onClick={() => navigate('/login')}> Login</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
};

export default RegisterForm;
