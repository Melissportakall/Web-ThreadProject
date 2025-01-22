import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css'; 

const Modal = ({ isOpen, onClose, orderStatus }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Order Tracking</h2>
        <p>Order ID: {orderStatus.order_id}</p>
        <p>Status: {orderStatus.status}</p>
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${orderStatus.progress}%` }}
          ></div>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default Modal;
