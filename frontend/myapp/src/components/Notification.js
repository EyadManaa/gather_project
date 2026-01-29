import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const Notification = () => {
    const { notification } = useContext(CartContext);

    if (!notification) return null;

    const bgColor = notification.type === 'error' ? 'var(--error)' : 'var(--primary-light)';

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: bgColor,
            color: 'white',
            padding: '15px 25px',
            borderRadius: '5px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 2000,
            animation: 'slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
            {notification.message}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Notification;
