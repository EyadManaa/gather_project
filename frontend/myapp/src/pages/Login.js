import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import FallingLeaves from '../components/FallingLeaves';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res.success) {
            // Retrieve the user from the response or storage to check the role
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData && userData.role === 'super_admin') {
                await logout();
                setError('Access Denied: Super Administrators must use the secure terminal.');
            } else {
                navigate('/');
            }
        } else {
            setError(res.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '20px'
        }}>
            <FallingLeaves />
            <Link to="/" className="auth-back-btn">
                ← Back
            </Link>
            <div className="card auth-card" style={{ borderRadius: '25px', width: '100%', maxWidth: '400px', zIndex: 1 }}>
                <h2 style={{ textAlign: 'center', color: 'var(--primary-dark)' }}>Welcome Back</h2>
                {error && <div style={{ backgroundColor: '#ffebee', color: 'var(--error)', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Email</label>
                        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" required />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Password</label>
                        <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
