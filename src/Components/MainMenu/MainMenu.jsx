import React, { useEffect, useState } from 'react';
import './Card.css';
import ReactDOM from "react-dom";
import { Link, useNavigate } from 'react-router-dom';
import SideMenu from '../SideMenu/SideMenu';
import Urunler from '../Urunler/Urunler';

const MainMenu = () => {
  return (
    <div className="main-menu">
      <SideMenu /> {/* Yan menüyü çağırın */}
      <Urunler />  {/* Ürünler ekranını çağırın */}
    </div>
  );
  };
  
  export default MainMenu;
