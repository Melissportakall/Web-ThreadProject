import React, { useState, useEffect } from "react";
import './Card.css';
import SideMenu from '../SideMenu/SideMenu';
import Urunler from '../Urunler/Urunler';

const MainMenu = () => {
  useEffect(() => {
      document.title = "Main Menu";
    }, []);

  return (
    <div className="main-menu">
      <div className="sidebar">
        <SideMenu />
      </div>
      <div className="products">
        <Urunler />
      </div>
    </div>
  );
};

export default MainMenu;
