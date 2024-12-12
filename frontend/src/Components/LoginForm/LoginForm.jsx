import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUnlockAlt } from "react-icons/fa";
import styles from "./LoginForm.module.css";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {

      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });


      const data = await response.json();

      if (data.success) {
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

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
      setError("An error occurred. Please try again.");
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

