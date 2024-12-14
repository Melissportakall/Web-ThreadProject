// Components/AuthGuard/AuthGuard.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const cookies = document.cookie;
  const hasUserData = cookies.includes("user_data");
  const hasRememberMe = cookies.includes("remember_me=true");

  if (!hasUserData && !hasRememberMe) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;