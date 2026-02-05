import React from 'react';
import { FaLeaf } from 'react-icons/fa';

const LoadingScreen = ({ message = 'Loading...' }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px) saturate(180%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
        }}>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse-soft {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; }
                }
                .loader-wrapper {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .loader-spinner {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 3px solid rgba(16, 185, 129, 0.05);
                    border-top: 3px solid var(--primary-color, #10b981);
                    border-radius: 50%;
                    animation: spin 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
                }
                .leaf-icon {
                    font-size: 3rem;
                    color: var(--primary-color, #10b981);
                    animation: pulse-soft 2s ease-in-out infinite;
                    filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.2));
                }
                .loading-text {
                    margin-top: 40px;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--primary-dark, #065f46);
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    opacity: 0.7;
                    animation: pulse-soft 2s ease-in-out infinite;
                }
            `}</style>
            <div className="loader-wrapper">
                <div className="loader-spinner"></div>
                <FaLeaf className="leaf-icon" />
            </div>
            <p className="loading-text">
                {message}
            </p>
        </div>
    );
};

export default LoadingScreen;
