import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import whiteLogo from '../assets/WGatherLogo1.png';

const Footer = () => {
    const location = useLocation();

    // Hide footer on these routes
    const isImmersive = location.pathname.startsWith('/store/') ||
        location.pathname.startsWith('/admin/dashboard') ||
        location.pathname.startsWith('/super-admin/dashboard') ||
        location.pathname === '/superlogin' ||
        location.pathname === '/login' ||
        location.pathname === '/register';

    if (isImmersive) return null;

    return (
        <footer className="main-footer">
            <div className="container">
                <div className="footer-content">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <img src={whiteLogo} alt="Gather" className="footer-logo" />
                        <p className="footer-tagline">
                            Gathering the best stores in one place. Your premium destination for quality shopping.
                        </p>
                        <div className="footer-socials">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook"><FaFacebook /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter"><FaTwitter /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn"><FaLinkedin /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links">
                        <h3>Discover</h3>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/stores">Stores</Link></li>
                            <li><Link to="/favorites">Favorites</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h3>Customer Care</h3>
                        <ul>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/orders">My Orders</Link></li>
                            <li><Link to="/profile">My Profile</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-contact">
                        <h3>Contact Us</h3>
                        <div className="contact-item">
                            <HiOutlineLocationMarker className="contact-icon" />
                            <span>123 Commerce Blvd, Tech City, TC 90210</span>
                        </div>
                        <div className="contact-item">
                            <HiOutlineMail className="contact-icon" />
                            <span>support@gather.com</span>
                        </div>
                        <div className="contact-item">
                            <HiOutlinePhone className="contact-icon" />
                            <span>+1 (555) 123-4567</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Gather. All rights reserved.</p>
                    <div className="footer-legal">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>

            <style>{`
                .main-footer {
                    background-color: #064e3b; /* Emerald 900 */
                    color: white;
                    padding: 60px 0 20px;
                    margin-top: auto;
                    font-size: 0.95rem;
                }

                .footer-content {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
                    gap: 40px;
                    margin-bottom: 40px;
                }

                /* Brand Section */
                .footer-brand {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .footer-logo {
                    height: 90px;
                    width: auto;
                    object-fit: contain;
                    align-self: flex-start;
                    margin-left: -10px; /* Align visual weight */
                }

                .footer-tagline {
                    color: #d1fae5; /* Emerald 100 */
                    line-height: 1.6;
                    margin: 0;
                    opacity: 0.9;
                }

                .footer-socials {
                    display: flex;
                    gap: 15px;
                    margin-top: 10px;
                }

                .social-icon {
                    color: white;
                    font-size: 1.2rem;
                    background: rgba(255, 255, 255, 0.1);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .social-icon:hover {
                    background: var(--primary-color);
                    transform: translateY(-3px);
                }

                /* Links Sections */
                .footer-links h3, .footer-contact h3 {
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 20px;
                    position: relative;
                    display: inline-block;
                }

                .footer-links h3::after, .footer-contact h3::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: -8px;
                    width: 30px;
                    height: 2px;
                    background: var(--primary-color);
                    border-radius: 2px;
                }

                .footer-links ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .footer-links a {
                    color: #e2e8f0;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }

                .footer-links a:hover {
                    color: var(--primary-color);
                    padding-left: 5px;
                }

                /* Contact Section */
                .contact-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 15px;
                    color: #e2e8f0;
                }

                .contact-icon {
                    color: var(--primary-color);
                    font-size: 1.2rem;
                    flex-shrink: 0;
                    margin-top: 3px;
                }

                /* Footer Bottom */
                .footer-bottom {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #94a3b8;
                    font-size: 0.85rem;
                }

                .footer-legal {
                    display: flex;
                    gap: 20px;
                }

                .footer-legal a {
                    color: #94a3b8;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .footer-legal a:hover {
                    color: white;
                }

                /* Responsive */
                @media (max-width: 992px) {
                    .footer-content {
                        grid-template-columns: 1fr 1fr;
                        gap: 30px;
                    }
                }

                @media (max-width: 576px) {
                    .footer-content {
                        grid-template-columns: 1fr;
                        text-align: center;
                    }

                    .footer-brand {
                        align-items: center;
                    }

                    .footer-logo {
                        margin-left: 0;
                    }

                    .footer-socials {
                        justify-content: center;
                    }

                    .contact-item {
                        justify-content: center;
                    }

                    .footer-links h3::after, .footer-contact h3::after {
                        left: 50%;
                        transform: translateX(-50%);
                    }

                    .footer-bottom {
                        flex-direction: column;
                        gap: 15px;
                        text-align: center;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
