import React from 'react';
import viewProfileStyles from './ViewProfile.modulo.css';
import SideMenu from '../SideMenu/SideMenu';

const ViewProfile = () => {
  return (
    <div className={viewProfileStyles.viewprofile}>
      <div className="sidebar">
        <SideMenu />
      </div>
    </div>
  );
};

export default ViewProfile;
