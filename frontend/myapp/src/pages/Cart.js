import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUI } from '../context/UIContext';

const Cart = () => {
    const { showAlert } = useUI();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axios.get('/api/cart');
                setCartItems(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCart();
    }, []);

    const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary-dark)' }}>My Cart</h2>
            {cartItems.length === 0 ? <p className="card">Your cart is empty.</p> : (
                <>
                    {cartItems.map(item => (
                        <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {item.image && <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px', borderRadius: '4px' }} />}
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
                                    <p style={{ margin: 0, color: '#666' }}>${item.price} x {item.quantity}</p>
                                </div>
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="card" style={{ textAlign: 'right', marginTop: '20px', backgroundColor: '#e8f5e9' }}>
                        <h3>Total: ${total.toFixed(2)}</h3>
                        <button className="btn btn-primary" onClick={() => showAlert('Checkout functionality is simulated. Thank you!', 'info')}>Proceed to Checkout</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
