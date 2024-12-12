import React, { useEffect, useState } from 'react';
import './Card.css';
import ReactDOM from "react-dom";
import { Link, useNavigate } from 'react-router-dom';
import SideMenu from '../SideMenu/SideMenu';

const MainMenu = () => {
    return (
      <div className="main-menu">
        <h1>Welcome to the Main Menu</h1>
        <nav>
          
        </nav>
        <SideMenu /> {/* Yan menüyü çağırın */}
      </div>
    );
  };
  
  export default MainMenu;
