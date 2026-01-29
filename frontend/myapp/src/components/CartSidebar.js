import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const CartSidebar = () => {
    const { cartItems, isCartOpen, toggleCart, updateQuantity, removeFromCart, checkout } = useContext(CartContext);
    const { showAlert } = useUI();
    const [deliveryOption, setDeliveryOption] = React.useState('pickup'); // 'delivery' or 'pickup'
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [orderNotes, setOrderNotes] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);
    const [orderSummary, setOrderSummary] = React.useState(null);

    const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const deliveryFee = deliveryOption === 'delivery' ? 5 : 0;
    const total = subtotal + deliveryFee;

    return (
        <>
            {/* Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 999,
                    display: isCartOpen ? 'block' : 'none'
                }}
                onClick={toggleCart}
            />

            {/* Sidebar */}
            <div
                className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '380px',
                    height: '100%',
                    backgroundColor: 'white',
                    boxShadow: '-2px 0 5px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease-in-out',
                    padding: '20px',
                    boxSizing: 'border-box',
                    overflowY: 'auto'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-dark)' }}>Your Cart</h2>
                    <button onClick={toggleCart} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}><FaTimes /></button>
                </div>

                {cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <>
                        <div style={{ flex: 1 }}>
                            {cartItems.map(item => (
                                <div key={item.id} style={{ display: 'flex', marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', alignItems: 'center' }}>
                                    {item.image && <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }} />}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>{item.name}</h4>
                                        <p style={{ margin: '0 0 8px 0', color: 'var(--primary-color)', fontWeight: 'bold' }}>${item.price}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'var(--secondary-color)', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '4px 8px' }}>
                                                <FaMinus size={10} />
                                            </button>
                                            <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'var(--secondary-color)', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '4px 8px' }}>
                                                <FaPlus size={10} />
                                            </button>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'var(--error)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '6px 10px' }}>
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Delivery Options */}
                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--primary-dark)' }}>Order Details</h4>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number (Required)</label>
                                <input
                                    type="tel"
                                    placeholder="e.g. 0123456789"
                                    className="form-control"
                                    style={{ marginBottom: 0 }}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Order Notes (Optional)</label>
                                <textarea
                                    placeholder="Special instructions..."
                                    className="form-control"
                                    style={{ marginBottom: 0, minHeight: '60px', padding: '10px' }}
                                    value={orderNotes}
                                    onChange={(e) => setOrderNotes(e.target.value)}
                                />
                            </div>

                            {deliveryOption === 'delivery' && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Delivery Location (Required)</label>
                                    <textarea
                                        placeholder="Full address, building, floor..."
                                        className="form-control"
                                        style={{ marginBottom: 0, minHeight: '60px', padding: '10px' }}
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--primary-dark)' }}>Select Payment Option</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px', backgroundColor: deliveryOption === 'pickup' ? 'var(--secondary-color)' : 'white', borderRadius: '5px', border: '1px solid #ddd' }}>
                                    <input
                                        type="radio"
                                        name="deliveryOption"
                                        value="pickup"
                                        checked={deliveryOption === 'pickup'}
                                        onChange={(e) => setDeliveryOption(e.target.value)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    <div>
                                        <strong>Pickup from Shop</strong>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#666' }}>Pay at the store when you collect your order</p>
                                    </div>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px', backgroundColor: deliveryOption === 'delivery' ? 'var(--secondary-color)' : 'white', borderRadius: '5px', border: '1px solid #ddd' }}>
                                    <input
                                        type="radio"
                                        name="deliveryOption"
                                        value="delivery"
                                        checked={deliveryOption === 'delivery'}
                                        onChange={(e) => setDeliveryOption(e.target.value)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    <div>
                                        <strong>Home Delivery (+$5.00)</strong>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#666' }}>Pay when your order arrives at your doorstep</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span>Subtotal:</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {deliveryOption === 'delivery' && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>
                                        <span>Delivery Fee:</span>
                                        <span>+$5.00</span>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={async () => {
                                if (!phoneNumber.trim()) {
                                    showAlert('Please enter your phone number so the shop can reach you!', 'warning');
                                    return;
                                }
                                if (deliveryOption === 'delivery' && !location.trim()) {
                                    showAlert('Please enter your delivery location!', 'warning');
                                    return;
                                }
                                const result = await checkout(deliveryOption, phoneNumber, orderNotes, location);
                                if (result.success) {
                                    setOrderSummary({
                                        method: deliveryOption === 'delivery' ? 'Pay on Delivery' : 'Pay at Pickup',
                                        total: total.toFixed(2)
                                    });
                                    setShowSuccessModal(true);
                                    setPhoneNumber('');
                                    setOrderNotes('');
                                    setLocation('');
                                }
                            }}>Checkout</button>

                        </div>
                    </>
                )}
            </div>

            {/* Checkout Success Modal */}
            {showSuccessModal && orderSummary && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🛍️📦✨</div>
                        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '10px' }}>Order Confirmed!</h2>
                        <p style={{ color: '#666', marginBottom: '25px', fontSize: '1.1rem' }}>
                            Your order has been placed successfully. Get ready for some amazing items!
                        </p>

                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', textAlign: 'left', marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#64748b' }}>Payment Method:</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>{orderSummary.method}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                                <span style={{ color: '#64748b' }}>Total Paid:</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>${orderSummary.total}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '15px', borderRadius: '15px', fontSize: '1.1rem' }}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
            <style>{`
            @media (max-width: 480px) {
                .cart-sidebar {
                    width: 100% !important;
                }
            }
        `}</style>
        </>
    );
};

export default CartSidebar;
