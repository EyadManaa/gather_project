import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) fetchCart();
        else setCartItems([]);
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await axios.get('/api/cart');
            setCartItems(res.data);
        } catch (err) { console.error(err); }
    };

    const addToCart = async (productId) => {
        if (!user) {
            showNotification('Please login first', 'error');
            return;
        }
        try {
            await axios.post('/api/cart', { productId, quantity: 1 });
            await fetchCart();
            setIsCartOpen(true); // Auto open cart
            showNotification('Item added to cart!', 'success');
        } catch (err) {
            showNotification('Failed to add item', 'error');
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 1500);
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await axios.put(`/api/cart/${cartItemId}`, { quantity: newQuantity });
            await fetchCart();
        } catch (err) {
            showNotification('Failed to update quantity', 'error');
        }
    };

    const removeFromCart = async (cartItemId) => {
        try {
            await axios.delete(`/api/cart/${cartItemId}`);
            await fetchCart();
            showNotification('Item removed from cart', 'success');
        } catch (err) {
            showNotification('Failed to remove item', 'error');
        }
    };

    const checkout = async (deliveryOption, phoneNumber, orderNotes, location) => {
        try {
            const res = await axios.post('/api/orders/checkout', {
                deliveryOption,
                phoneNumber,
                orderNotes,
                location
            });
            await fetchCart(); // This will clear the cart items in state
            setIsCartOpen(false);
            showNotification('Order placed successfully!', 'success');
            return { success: true, data: res.data };
        } catch (err) {
            showNotification('Checkout failed', 'error');
            return { success: false };
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, isCartOpen, toggleCart, addToCart, updateQuantity, removeFromCart, checkout, notification, showNotification }}>
            {children}
        </CartContext.Provider>
    );
};
