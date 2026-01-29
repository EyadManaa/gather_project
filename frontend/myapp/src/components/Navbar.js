import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import whiteLogo from '../assets/WGatherLogo1.png';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { toggleCart, cartItems } = useContext(CartContext);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (location.pathname.startsWith('/store/') ||
        location.pathname.startsWith('/admin/dashboard') ||
        location.pathname.startsWith('/super-admin/dashboard') ||
        location.pathname === '/superlogin' ||
        location.pathname === '/login' ||
        location.pathname === '/register') {
        return null;
    }

    return (
        <nav style={{
            background: 'var(--primary-color)',
            padding: '0 40px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '90px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            backdropFilter: 'blur(10px)',
            background: 'rgba(16, 185, 129, 0.95)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                margin: '0 auto',
                position: 'relative'
            }}>
                {/* BRAND - LEFT */}
                <div className="nav-brand-container" style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                    <Link to={user && user.role === 'super_admin' ? "/super-admin/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center' }} onClick={() => setIsMenuOpen(false)}>
                        <img src={whiteLogo} alt="Gather" style={{ height: '140px', objectFit: 'contain', marginTop: '10px' }} />
                    </Link>
                </div>

                {/* MOBILE MENU TOGGLE */}
                <button
                    onClick={toggleMenu}
                    className="mobile-menu-toggle"
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        zIndex: 1001
                    }}
                >
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* NAV LINKS - CENTER/MOBILE */}
                <div
                    className={`nav-links ${isMenuOpen ? 'open' : ''}`}
                    style={{
                        display: 'flex',
                        gap: '25px',
                        alignItems: 'center',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {(!user || user.role !== 'super_admin') && (
                        <Link to="/" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Home</Link>
                    )}
                    <Link to="/stores" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Stores</Link>
                    {user && (
                        <>
                            {user.role !== 'super_admin' && (
                                <>
                                    <Link to="/favorites" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Favorites</Link>
                                    <Link to="/orders" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Orders</Link>
                                    <Link to="/contact" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Contact</Link>
                                </>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin/dashboard" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                            )}
                            {user.role === 'super_admin' && (
                                <Link to="/super-admin/dashboard" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                            )}
                        </>
                    )}

                    {/* MOBILE ONLY AUTH */}
                    <div className="mobile-auth-links" style={{ display: 'none', flexDirection: 'column', gap: '15px', width: '100%', marginTop: '20px' }}>
                        {user ? (
                            <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} style={mobileBtnStyle}>Logout</button>
                        ) : (
                            <>
                                <Link to="/login" style={linkStyle} onClick={() => setIsMenuOpen(false)}>Login</Link>
                                <Link to="/register" style={{ ...mobileBtnStyle, background: 'white', color: 'var(--primary-color)' }} onClick={() => setIsMenuOpen(false)}>Register</Link>
                            </>
                        )}
                    </div>
                </div>

                {/* AUTH/CART - RIGHT (DESKTOP) */}
                <div
                    className="desktop-auth-cart"
                    style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}
                >
                    {user ? (
                        <>
                            {user.role === 'user' && (
                                <button onClick={toggleCart} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', transition: 'transform 0.2s' }}>
                                    <FaShoppingCart size={22} />
                                    <span style={{ marginLeft: '5px', background: 'var(--secondary-color)', color: 'var(--primary-dark)', borderRadius: '50%', padding: '2px 8px', fontSize: '0.8rem', fontWeight: 'bold' }}>{cartItems.length}</span>
                                </button>
                            )}
                            <button onClick={handleLogout} style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid white',
                                color: 'white',
                                borderRadius: '30px',
                                padding: '8px 20px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease'
                            }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={linkStyle}>Login</Link>
                            <Link to="/register" style={{
                                background: 'white',
                                color: 'var(--primary-color)',
                                padding: '8px 24px',
                                borderRadius: '30px',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease'
                            }}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 992px) {
                    .nav-brand-container {
                        flex: 1 !important;
                    }
                    .nav-brand-container img {
                        height: 100px !important;
                    }
                    .mobile-menu-toggle {
                        display: block !important;
                    }
                    .nav-links {
                        position: fixed;
                        top: 0;
                        right: -100%;
                        width: 80%;
                        max-width: 300px;
                        height: 100vh;
                        background: var(--primary-dark);
                        flex-direction: column;
                        justify-content: center;
                        padding: 40px;
                        box-shadow: -5px 0 15px rgba(0,0,0,0.1);
                        z-index: 1000;
                    }
                    .nav-links.open {
                        right: 0;
                    }
                    .desktop-auth-cart {
                        display: none !important;
                    }
                    .mobile-auth-links {
                        display: flex !important;
                    }
                }
            `}</style>
        </nav>
    );
};

const mobileBtnStyle = {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid white',
    color: 'white',
    borderRadius: '30px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'none'
};

const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'inline-block'
};

export default Navbar;
