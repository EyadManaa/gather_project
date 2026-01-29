import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BannedNotice = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleBack = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '500px',
                width: '100%',
                background: 'white',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🚫</div>
                <h1 style={{ color: '#ef4444', marginBottom: '15px', fontSize: '2rem' }}>Account Restricted</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
                    Your account has been restricted from accessing the Gather platform by an administrator.
                    If you believe this is an error, please contact our support team.
                </p>
                <button
                    onClick={handleBack}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    Return to Homepage
                </button>
            </div>
        </div>
    );
};

export default BannedNotice;
