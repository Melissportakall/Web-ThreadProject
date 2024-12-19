// App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './Components/LoginForm/LoginForm.jsx';
import RegisterForm from './Components/LoginRegister/RegisterForm';
import MainMenu from './Components/MainMenu/MainMenu';
import AuthGuard from './Components/AuthGuard/AuthGuard';
import { AdminMainMenu } from './Components/AdminMainMenu/AdminMainMenu.jsx';
import AdminUrunEkle from './Components/AdminUrunEkle/AdminUrunEkle'
import AdminUrunSil  from './Components/AdminUrunSil/AdminUrunSil';
import AdminStokGuncelle from './Components/AdminStokGuncelle/AdminStokGuncelle';
import AdminLogs from './Components/AdminLogs/AdminLogs'
import Logs from './Components/Logs/Logs.jsx';
import ViewProfile from './Components/ViewProfile/ViewProfile';
import Cart from './Components/Cart/Cart';
import MyOrders from './Components/MyOrders/MyOrders';
import LogOut from './Components/LogOut/LogOut';

function App() {
  useEffect(() => {
    document.cookie = "user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "remember_me=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    const handleTabClose = () => {
      const rememberMe = document.cookie
        .split('; ')
        .find((row) => row.startsWith('remember_me='))
        ?.split('=')[1];

      if (rememberMe !== 'true') {
        document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    };

    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        {/* AuthGuard ile korunan alanlar */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Routes>
                <Route path="/mainmenu" element={<MainMenu />} />
                <Route path="/view-profile" element={<ViewProfile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/admin-mainmenu" element={<AdminMainMenu />} />
                <Route path="/admin-urunekle" element={<AdminUrunEkle />} />
                <Route path="/admin-urunsil" element={<AdminUrunSil />} />
                <Route path="/admin-stokguncelle" element={<AdminStokGuncelle />} />
                <Route path="/admin-logs" element={<AdminLogs />} />
                <Route path="/logout" element={<LogOut />} />
              </Routes>
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;


//npx react-scripts start -> kodu bu şekilde çalıştırıcam yoksa hata alıyorum !!!!!!!
