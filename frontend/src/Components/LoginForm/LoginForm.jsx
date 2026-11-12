import React, { useState, useEffect } from "react";
import styles from "./LoginForm.module.css";
import { FaUser, FaUnlockAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { apiRequest } from '../../api';

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const clearSessionCookies = () => {
    document.cookie = "user_data=; expires=Thu, 01 Jan 1970 00:00: 00 UTC; path=/;";
    localStorage.removeItem("threadyol_token");
    localStorage.removeItem("threadyol_user_role");
  };

  useEffect(() => {
    document.title = "Login";
  }, []);

  useEffect(() => {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [name, value] = cookie.split("=");
      acc[name] = value;
      return acc;
    }, {});

    const token = localStorage.getItem("threadyol_token");

    if ((cookies.remember_me === "true" || token) && token) {
      navigate('/mainmenu');
    } else {
      clearSessionCookies();
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem('threadyol_token', data.access_token);
      localStorage.setItem('threadyol_user_role', data.user.role);
      document.cookie = `remember_me=${rememberMe ? 'true' : 'false'}; path=/; max-age=${60 * 60 * 24 * 30}`;

      if (data.user.role === 'admin') {
        navigate('/admin-mainmenu');
      } else {
        navigate('/mainmenu');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.input_box}>
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FaUser className={styles.icon} />
        </div>
        <div className={styles.input_box}>
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaUnlockAlt className={styles.icon} />
        </div>
        <div className={styles.remember_forgot}>
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <button type="button" className={styles.forgotLink} id="loginForgotPassword">Forgot password?</button>
        </div>
        <button className={styles.button} type="submit">Login</button>
        <div className={styles.register_link}>
          <p>
            Don't have an account?
            <span onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}> Register Here</span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
