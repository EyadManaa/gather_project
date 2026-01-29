import React, { createContext, useState, useContext } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        confirmText: 'Got it!',
        cancelText: 'Cancel',
        showCancel: false
    });

    const showAlert = (message, type = 'info', title = 'Notification') => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: null,
            confirmText: 'Got it!',
            showCancel: false
        });
    };

    const showConfirm = (message, onConfirm, title = 'Are you sure?') => {
        setModal({
            isOpen: true,
            title,
            message,
            type: 'warning',
            onConfirm: () => {
                onConfirm();
                closeModal();
            },
            confirmText: 'Yes, Proceed',
            cancelText: 'No, Cancel',
            showCancel: true
        });
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <UIContext.Provider value={{ modal, showAlert, showConfirm, closeModal }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => useContext(UIContext);
