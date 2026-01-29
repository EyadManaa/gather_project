import React from 'react';
import { FaPhone, FaEnvelope, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';

const Contact = () => {
    return (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
                backgroundColor: 'white',
                maxWidth: '600px',
                margin: '0 auto',
                padding: '50px',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ color: 'var(--primary-dark)', fontSize: '2.5rem', marginBottom: '10px' }}>Get in Touch 📬</h1>
                <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '40px' }}>
                    Have questions or feedback? We'd love to hear from you.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                    <div style={contactRowStyle}>
                        <div style={iconContainerStyle}>
                            <FaEnvelope size={20} color="var(--primary-dark)" />
                        </div>
                        <a href="mailto:contact@gather.com" style={linkStyle}>contact@gather.com</a>
                    </div>
                    <div style={contactRowStyle}>
                        <div style={iconContainerStyle}>
                            <FaPhone size={20} color="var(--primary-dark)" />
                        </div>
                        <a href="tel:+1234567890" style={linkStyle}>+1 (234) 567-890</a>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '30px' }}>
                    <p style={{ fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '20px' }}>Follow Us</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '25px' }}>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noreferrer"
                            style={socialIconStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#e1306c';
                                e.currentTarget.style.transform = 'scale(1.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#666';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <FaInstagram size={28} />
                        </a>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noreferrer"
                            style={socialIconStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#1877f2';
                                e.currentTarget.style.transform = 'scale(1.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#666';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <FaFacebook size={28} />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noreferrer"
                            style={socialIconStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#0a66c2';
                                e.currentTarget.style.transform = 'scale(1.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#666';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <FaLinkedin size={28} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const contactRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    transition: 'transform 0.2s',
    cursor: 'pointer'
};

const iconContainerStyle = {
    background: 'white',
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const linkStyle = {
    color: 'var(--text-color)',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: '500'
};

const socialIconStyle = {
    color: '#666',
    transition: 'color 0.3s, transform 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

export default Contact;
