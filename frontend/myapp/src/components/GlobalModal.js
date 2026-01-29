import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../context/UIContext';
import { FaInfoCircle, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const GlobalModal = () => {
    const { modal, closeModal } = useUI();

    const getIcon = () => {
        switch (modal.type) {
            case 'success': return <FaCheckCircle style={{ color: '#10b981', fontSize: '3.5rem' }} />;
            case 'error': return <FaTimesCircle style={{ color: '#ef4444', fontSize: '3.5rem' }} />;
            case 'warning': return <FaExclamationCircle style={{ color: '#f59e0b', fontSize: '3.5rem' }} />;
            default: return <FaInfoCircle style={{ color: 'var(--primary-color)', fontSize: '3.5rem' }} />;
        }
    };

    return (
        <AnimatePresence>
            {modal.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(8px)'
                }} onClick={closeModal}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            padding: '40px',
                            borderRadius: '30px',
                            maxWidth: '450px',
                            width: '90%',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <button
                            onClick={closeModal}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                zIndex: 1
                            }}
                        >
                            <FaTimes />
                        </button>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ marginBottom: '25px' }}>
                                {getIcon()}
                            </div>

                            <h2 style={{
                                color: 'var(--primary-dark)',
                                marginBottom: '15px',
                                fontSize: '1.8rem',
                                fontWeight: '800'
                            }}>
                                {modal.title}
                            </h2>

                            <p style={{
                                color: '#4b5563',
                                fontSize: '1.1rem',
                                lineHeight: '1.6',
                                marginBottom: '30px'
                            }}>
                                {modal.message}
                            </p>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                {modal.showCancel && (
                                    <button
                                        onClick={closeModal}
                                        style={{
                                            flex: 1,
                                            background: '#f1f5f9',
                                            color: '#64748b',
                                            padding: '14px',
                                            borderRadius: '15px',
                                            border: 'none',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                    >
                                        {modal.cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={modal.onConfirm || closeModal}
                                    style={{
                                        flex: 2,
                                        background: modal.type === 'error' ? '#ef4444' : 'var(--primary-color)',
                                        color: 'white',
                                        padding: '14px',
                                        borderRadius: '15px',
                                        border: 'none',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {modal.confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GlobalModal;
