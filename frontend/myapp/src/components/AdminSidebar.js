import { FaChartLine, FaStore, FaBox, FaClipboardList, FaUsers, FaGem, FaBars, FaTimes } from 'react-icons/fa';
import React, { useState } from 'react';

const AdminSidebar = ({ activeSection, setActiveSection }) => {
    const menuItems = [
        { id: 'stats', label: 'Dashboard', icon: <FaChartLine /> },
        { id: 'settings', label: 'Store Settings', icon: <FaStore /> },
        { id: 'navigation', label: 'Store Navigation', icon: <FaStore /> },
        { id: 'products', label: 'Products', icon: <FaBox /> },
        { id: 'orders', label: 'Orders', icon: <FaClipboardList /> },
        { id: 'users', label: 'Users', icon: <FaUsers /> },
        { id: 'subscriptions', label: 'Subscriptions', icon: <FaGem /> }
    ];

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 2000,
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--primary-dark)',
                    color: 'white',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                className="admin-mobile-toggle"
            >
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div className={`admin-sidebar ${isOpen ? 'open' : ''}`} style={{
                width: '250px',
                backgroundColor: 'var(--primary-dark)',
                height: '100vh',
                padding: '20px 0',
                position: 'fixed',
                top: '0',
                left: '0',
                overflowY: 'auto',
                zIndex: 100,
                transition: 'left 0.3s ease'
            }}>
                {menuItems.map(item => (
                    <div
                        key={item.id}
                        onClick={() => { setActiveSection(item.id); setIsOpen(false); }}
                        style={{
                            padding: '15px 25px',
                            cursor: 'pointer',
                            backgroundColor: activeSection === item.id ? 'var(--primary-color)' : 'transparent',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            transition: 'background-color 0.3s',
                            borderLeft: activeSection === item.id ? '4px solid var(--secondary-color)' : '4px solid transparent'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                        <span style={{ fontSize: '1rem', fontWeight: activeSection === item.id ? 'bold' : 'normal' }}>{item.label}</span>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 992px) {
                    .admin-sidebar {
                        left: -100% !important;
                    }
                    .admin-sidebar.open {
                        left: 0 !important;
                    }
                    .admin-mobile-toggle {
                        display: flex !important;
                    }
                }
            `}</style>
        </>
    );
};

export default AdminSidebar;
