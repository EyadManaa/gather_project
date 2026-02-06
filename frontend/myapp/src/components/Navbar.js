import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { HiOutlineHome, HiOutlineBuildingStorefront, HiOutlineHeart, HiOutlineClipboardDocumentList, HiOutlineEnvelope, HiOutlineShieldCheck, HiOutlineShoppingBag, HiOutlineArrowRightOnRectangle, HiOutlineArrowLeftOnRectangle, HiOutlineUserPlus, HiOutlineUser } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import whiteLogo from '../assets/WGatherLogo1.png';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const NavItem = React.memo(({ to, icon: Icon, label, currentPath }) => {
    const isActive = currentPath === to;
    return (
        <Link to={to} className={`bottom-nav-item ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                        }}
                        className="active-pill-bg"
                    />
                )}
            </AnimatePresence>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Icon size={22} />
                <AnimatePresence>
                    {isActive && (
                        <motion.span
                            initial={{ width: 0, opacity: 0, scale: 0.8 }}
                            animate={{ width: 'auto', opacity: 1, scale: 1 }}
                            exit={{ width: 0, opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="nav-label"
                        >
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </Link>
    );
});

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { toggleCart, cartItems } = useContext(CartContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    // SCROLL TRACKING FOR MOBILE HIDE/SHOW
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const scrollThreshold = 10; // Minimum scroll distance to trigger change

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // On desktop, always show
            if (window.innerWidth > 992) {
                setIsVisible(true);
                return;
            }

            if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
                return;
            }

            if (currentScrollY > lastScrollY.current && currentScrollY > 90) {
                // Scrolling down
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (location.pathname.startsWith('/admin/dashboard') ||
        location.pathname.startsWith('/super-admin/dashboard') ||
        location.pathname === '/superlogin' ||
        location.pathname.startsWith('/store/') ||
        isAuthPage) {
        return null;
    }


    return (
        <>
            <motion.nav
                className="main-navbar"
                animate={{
                    y: isVisible ? 0 : -100,
                    opacity: isVisible ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
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
                    alignItems: 'center'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    margin: '0 auto',
                    position: 'relative'
                }}>
                    {/* BRAND - LEFT */}
                    <div className="nav-brand-container" style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                        <Link to={user && user.role === 'super_admin' ? "/super-admin/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center' }}>
                            <img src={whiteLogo} alt="Gather" style={{ height: '140px', objectFit: 'contain', marginTop: '10px' }} />
                        </Link>
                    </div>

                    {/* NAV LINKS - CENTER (DESKTOP) */}
                    <div
                        className="desktop-nav-links"
                        style={{
                            display: 'flex',
                            gap: '25px',
                            alignItems: 'center',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {(!user || user.role !== 'super_admin') && (
                            <Link to="/" style={linkStyle}>Home</Link>
                        )}
                        <Link to="/stores" style={linkStyle}>Stores</Link>
                        {user && (
                            <>
                                {user.role !== 'super_admin' && (
                                    <>
                                        <Link to="/favorites" style={linkStyle}>Favorites</Link>
                                        <Link to="/orders" style={linkStyle}>Orders</Link>
                                        <Link to="/contact" style={linkStyle}>Contact</Link>
                                    </>
                                )}
                                {user.role === 'admin' && (
                                    <Link to="/admin/dashboard" style={linkStyle}>Dashboard</Link>
                                )}
                                {user.role === 'super_admin' && (
                                    <Link to="/super-admin/dashboard" style={linkStyle}>Admin Panel</Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* AUTH/CART - RIGHT */}
                    <div
                        className="auth-cart-container"
                        style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}
                    >
                        {user ? (
                            <>
                                {user.role === 'user' && (
                                    <button onClick={toggleCart} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', transition: 'transform 0.2s', marginRight: '5px' }}>
                                        <HiOutlineShoppingBag size={26} />
                                        <span style={{ marginLeft: '5px', background: 'var(--secondary-color)', color: 'var(--primary-dark)', borderRadius: '50%', padding: '2px 8px', fontSize: '0.8rem', fontWeight: 'bold' }}>{cartItems.length}</span>
                                    </button>
                                )}
                                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', transition: 'all 0.3s ease', marginRight: '10px' }}>
                                    <div style={{
                                        width: '35px',
                                        height: '35px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {user.profile_pic ? (
                                            <img src={getImageUrl(user.profile_pic)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <HiOutlineUser size={20} color="white" />
                                        )}
                                    </div>
                                </Link>
                                <button onClick={handleLogout} className="auth-btn logout-btn" style={authBtnStyle}>
                                    <HiOutlineArrowLeftOnRectangle className="mobile-icon-only" size={24} />
                                    <span className="desktop-text-only">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="auth-btn login-btn" style={linkStyle}>
                                    <HiOutlineArrowRightOnRectangle className="mobile-icon-only" size={24} />
                                    <span className="desktop-text-only">Login</span>
                                </Link>
                                <Link to="/register" className="auth-btn register-btn" style={{
                                    background: 'white',
                                    color: 'var(--primary-color)',
                                    padding: '8px 24px',
                                    borderRadius: '30px',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <HiOutlineUserPlus className="mobile-icon-only" size={24} />
                                    <span className="desktop-text-only">Register</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </motion.nav >

            {/* MOBILE BOTTOM NAV */}
            {
                !isAuthPage && (
                    <motion.div
                        className="mobile-bottom-nav"
                    >
                        <NavItem to="/" icon={HiOutlineHome} label="Home" currentPath={location.pathname} />
                        <NavItem to="/stores" icon={HiOutlineBuildingStorefront} label="Stores" currentPath={location.pathname} />

                        {/* Favorites for both users and admins */}
                        {user && (user.role === 'user' || user.role === 'admin') && (
                            <NavItem to="/favorites" icon={HiOutlineHeart} label="Favorites" currentPath={location.pathname} />
                        )}

                        {/* User-specific items */}
                        {user && user.role === 'user' && (
                            <>
                                <NavItem to="/orders" icon={HiOutlineClipboardDocumentList} label="Orders" currentPath={location.pathname} />
                                <NavItem to="/contact" icon={HiOutlineEnvelope} label="Contact" currentPath={location.pathname} />
                            </>
                        )}

                        {/* Admin-specific items */}
                        {user && user.role === 'admin' && (
                            <NavItem to="/admin/dashboard" icon={HiOutlineShieldCheck} label="Dashboard" currentPath={location.pathname} />
                        )}

                        {/* Guest-specific items */}
                        {!user && (
                            <NavItem to="/contact" icon={HiOutlineEnvelope} label="Contact" currentPath={location.pathname} />
                        )}
                    </motion.div>
                )
            }

            <style>{`
                .main-navbar {
                    background: rgba(16, 185, 129, 0.95);
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }

                .mobile-bottom-nav {
                    display: none;
                    position: fixed;
                    bottom: 25px; /* Floating at the bottom */
                    left: 20px;
                    right: 20px;
                    margin: 0 auto;
                    max-width: 500px;
                    height: 65px;
                    background: #022c22; /* Solid Emerald 950 */
                    border-radius: 40px; /* Pill shape */
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                    z-index: 2000;
                    justify-content: space-evenly;
                    align-items: center;
                    padding: 0 10px;
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .bottom-nav-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255,255,255,0.6);
                    text-decoration: none;
                    font-size: 0.85rem;
                    height: 48px;
                    padding: 0 8px;
                    transition: all 0.3s ease;
                    border-radius: 24px;
                    -webkit-tap-highlight-color: transparent;
                    outline: none;
                }

                .bottom-nav-item.active {
                    color: white;
                }

                .active-pill-bg {
                    position: absolute;
                    inset: 0;
                    background: rgba(255,255,255,0.15);
                    border-radius: 30px;
                }

                .nav-label {
                    font-weight: 600;
                    white-space: nowrap;
                }

                .mobile-icon-only {
                    display: none;
                }

                @media (max-width: 992px) {
                    .main-navbar {
                        background: rgba(16, 185, 129, 0.5) !important;
                        backdrop-filter: blur(15px) !important;
                    }
                    .main-navbar {
                        padding: 0 20px !important;
                    }
                    .desktop-nav-links {
                        display: none !important;
                    }
                    .mobile-bottom-nav {
                        display: flex;
                    }
                    .nav-brand-container img {
                        height: 100px !important;
                    }
                    .mobile-icon-only {
                        display: block;
                        font-size: 1.2rem;
                    }
                    .desktop-text-only {
                        display: none;
                    }
                    .auth-btn {
                        padding: 8px !important;
                        border-radius: 50% !important;
                        min-width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .register-btn {
                        padding: 8px !important;
                    }
                }
            `}</style>
        </>
    );
};

const authBtnStyle = {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid white',
    color: 'white',
    borderRadius: '30px',
    padding: '8px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
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
