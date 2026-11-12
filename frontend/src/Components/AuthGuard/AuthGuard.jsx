import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('threadyol_token');
    const rememberMe = document.cookie.includes('remember_me=true');

    if (!token && !rememberMe) {
      navigate('/login');
    }
  }, [navigate]);

  return children;
};

export default AuthGuard;
