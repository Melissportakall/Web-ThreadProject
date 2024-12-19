import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LogOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.cookie = `user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `remember_me=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    const timeout = setTimeout(() => {
      navigate('/login');
    }, 500);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div>
      <h1>Çıkış Yapılıyor...</h1>
    </div>
  );
};

export default LogOut;
