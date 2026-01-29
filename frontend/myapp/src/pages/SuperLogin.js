import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaUserShield, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SuperLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await login(email, password);
            if (res.success) {
                // Fetch the user data from storage to check role
                const userData = JSON.parse(localStorage.getItem('user'));
                if (userData.role !== 'super_admin') {
                    logout();
                    setError('Access Denied: Terminal restricted to Super Administrators only.');
                } else {
                    navigate('/super-admin/dashboard');
                }
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError('Connection failed. Security protocols active.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    maxWidth: '450px',
                    width: '100%',
                    background: '#111',
                    padding: '50px',
                    borderRadius: '30px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.1)',
                    border: '1px solid #222',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* DECORATIVE BACKGROUND ELEMENT */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                    zIndex: 0
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#666',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        marginBottom: '40px',
                        transition: 'color 0.3s'
                    }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#666'}>
                        <FaArrowLeft size={12} /> Return to Public Portal
                    </Link>

                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#064e3b',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            color: '#10b981',
                            boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
                        }}>
                            <FaShieldAlt size={40} />
                        </div>
                        <h1 style={{ color: 'white', fontSize: '1.8rem', margin: 0, fontWeight: '800', letterSpacing: '-0.5px' }}>Terminal Access</h1>
                        <p style={{ color: '#666', marginTop: '8px', fontSize: '0.95rem' }}>Secure Administrative Protocol</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                padding: '15px',
                                borderRadius: '15px',
                                marginBottom: '25px',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <FaLock /> {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ color: '#999', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>Admin Credentials</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    placeholder="Super Admin Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '15px 15px 15px 45px',
                                        background: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '15px',
                                        color: 'white',
                                        outline: 'none',
                                        transition: 'all 0.3s'
                                    }}
                                    className="super-input"
                                    required
                                />
                                <FaUserShield style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '35px' }}>
                            <label style={{ color: '#999', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>Security Key</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '15px 15px 15px 45px',
                                        background: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '15px',
                                        color: 'white',
                                        outline: 'none',
                                        transition: 'all 0.3s'
                                    }}
                                    className="super-input"
                                    required
                                />
                                <FaLock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '17px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '15px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                            onMouseEnter={(e) => { e.target.style.background = '#059669'; e.target.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.target.style.background = '#10b981'; e.target.style.transform = 'translateY(0)'; }}
                        >
                            {loading ? 'Authenticating...' : (
                                <>
                                    Establish Session <FaShieldAlt />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <style>{`
                    .super-input:focus {
                        border-color: #10b981 !important;
                        background: #1f1f1f !important;
                        box-shadow: 0 0 15px rgba(16, 185, 129, 0.1);
                    }
                `}</style>
            </motion.div>
        </div>
    );
};

export default SuperLogin;
