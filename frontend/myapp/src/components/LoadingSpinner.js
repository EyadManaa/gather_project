import React from 'react';
import { FaLeaf } from 'react-icons/fa';

/**
 * A local loading spinner for embedding within pages.
 * Features the same premium leaf animation as the loading screen.
 */
const LoadingSpinner = ({ message = '' }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            width: '100%',
            marginTop: '-80px'
        }}>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse-soft {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; }
                }
                .spinner-wrapper {
                    position: relative;
                    width: 100px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .spinner-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 3px solid rgba(16, 185, 129, 0.05);
                    border-top: 3px solid var(--primary-color, #10b981);
                    border-radius: 50%;
                    animation: spin 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
                }
                .spinner-leaf {
                    font-size: 2.5rem;
                    color: var(--primary-color, #10b981);
                    animation: pulse-soft 2s ease-in-out infinite;
                    filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.2));
                }
                .spinner-text {
                    margin-top: 25px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--primary-dark, #065f46);
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    opacity: 0.6;
                }
            `}</style>
            <div className="spinner-wrapper">
                <div className="spinner-ring"></div>
                <FaLeaf className="spinner-leaf" />
            </div>
            {message && <p className="spinner-text">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
