import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const cookies = document.cookie;
    const hasRememberMe = cookies.includes("remember_me=true");

    if (!cookies.includes("user_data") && !hasRememberMe) {
      navigate("/login");
    }
  }, [navigate]);

  return children;
};

export default AuthGuard;