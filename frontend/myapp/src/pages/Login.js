import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Added FaEye, FaEyeSlash

import FallingLeaves from '../components/FallingLeaves';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const { login, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(formData.email, formData.password);
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
                        <input type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} name="email" className="form-control" required />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"} // Dynamic type
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '35%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#666',
                                    fontSize: '1.2rem',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
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
