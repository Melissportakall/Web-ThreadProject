import React, { useState, useEffect } from "react";
import styles from "./LoginForm.module.css";
import { FaUser, FaUnlockAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const clearSessionCookies = () => {
    document.cookie = "user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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

    if (cookies.remember_me === "true") {
      if (userData.is_admin) {
        navigate('/admin-mainmenu');
      } else {
        navigate('/mainmenu');
      }
    } else {
      clearSessionCookies();
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        username: username,
        password: password,
      };

      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        if (rememberMe) {
          document.cookie = `remember_me=true; path=/; max-age=${60 * 60 * 24 * 30}`;
        }

        setUserData(data);

        if (data.is_admin) {
          navigate('/admin-mainmenu');
        } else {
          navigate('/mainmenu');
        }

      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch (error) {
      console.error("Error:", error);
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
          <a href="#" id="loginForgotPassword">
            Forgot password?
          </a>
        </div>
        <button className={styles.button} type="submit">Login</button>
        <div className={styles.register_link}>
          <p>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              style={{ cursor: "pointer" }}
            >
              Register Here
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;