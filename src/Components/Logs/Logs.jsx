import React from 'react'
import SideMenu from '../SideMenu/SideMenu';
import logStyles from './Logs.module.css'

const Logs = () => {
  return (
    <div className={logStyles.logs}>
      <div className="sidebar">
        <SideMenu />
      </div>
    </div>
  );
};

export default Logs;