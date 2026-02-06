import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Added icons

import FallingLeaves from '../components/FallingLeaves';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const res = await register(formData.username, formData.email, formData.password, formData.role);
        if (res.success) {
            if (res.message) {
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
                        <input name="username" placeholder="Choose a username" value={formData.username} onChange={handleChange} className="form-control" required />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Email</label>
                        <input name="email" type="email" placeholder="Enter your email" onChange={handleChange} className="form-control" required />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create a password"
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
                    <div style={{ marginBottom: '15px' }}>
                        <label>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
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
