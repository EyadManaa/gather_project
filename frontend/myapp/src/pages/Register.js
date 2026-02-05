import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import FallingLeaves from '../components/FallingLeaves';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear old errors
        const res = await register(formData.username, formData.email, formData.password, formData.role);
        if (res.success) {
            if (res.message) {
                // This means signup was successful but email needs confirmation
                alert(res.message);
                navigate('/login');
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
                <h2 style={{ textAlign: 'center', color: 'var(--primary-dark)' }}>Create Account</h2>
                {error && <div style={{ backgroundColor: '#ffebee', color: 'var(--error)', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Username</label>
                        <input name="username" placeholder="Choose a username" onChange={handleChange} className="form-control" required />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Email</label>
                        <input name="email" type="email" placeholder="Enter your email" onChange={handleChange} className="form-control" required />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Password</label>
                        <input name="password" type="password" placeholder="Create a password" onChange={handleChange} className="form-control" required />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>I want to be a:</label>
                        <select name="role" onChange={handleChange} className="form-control">
                            <option value="user">Shopper (Browse & Buy)</option>
                            <option value="admin">Store Owner (Sell Products)</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
