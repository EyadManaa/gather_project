import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CustomerHome from '../components/CustomerHome';
import AdminHome from '../components/AdminHome';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user && user.role === 'super_admin') {
            navigate('/super-admin/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) return (
        <div style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc'
        }}>
            <LoadingSpinner message="Identifying session..." />
        </div>
    );

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
