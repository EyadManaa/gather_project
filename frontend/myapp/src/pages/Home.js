import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CustomerHome from '../components/CustomerHome';
import AdminHome from '../components/AdminHome';

const Home = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user && user.role === 'super_admin') {
            navigate('/super-admin/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #e2e8f0',
                    borderTop: '4px solid var(--primary-color)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Role-based Routing (Dual Homepage)
    if (user && user.role === 'admin') {
        return <AdminHome />;
    }

    if (user && user.role === 'super_admin') {
        return null; // Redirection handled by useEffect
    }

    return <CustomerHome />;
};

export default Home;
