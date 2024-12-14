// Auth.jsx
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

 const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        console.log("Toggle form çalıştı");
        setIsLogin(!isLogin);
    };

    return (
        <div className="auth-container">
            {isLogin ? (
                <LoginForm toggleForm={toggleForm} />
            ) : (
                <RegisterForm toggleForm={toggleForm} />
            )}
        </div>
    );
};

export default Auth;
