import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('/api/orders/my-orders');
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <LoadingSpinner message="Loading your orders..." />
        </div>
    );

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--primary-dark)', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '10px' }}>Order History</h1>

            {orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>No orders yet. Start shopping!</p>
                </div>
            ) : (
                <div>
                    {orders.map(order => (
                        <div key={order.id} className="card" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', color: 'var(--primary-color)' }}>{order.store_name}</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                                        Order #{order.order_number} • {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                                        ${parseFloat(order.total_amount).toFixed(2)}
                                    </p>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        backgroundColor: order.status === 'pending' ? '#fff3cd' : '#d4edda',
                                        color: order.status === 'pending' ? '#856404' : '#155724',
                                        fontWeight: 'bold'
                                    }}>
                                        {order.status.toUpperCase()}
                                    </span>

                                </div>
                            </div>
                            <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px', marginTop: '10px' }}>
                                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>
                                    <strong>Contact:</strong> {order.phone_number}
                                </p>
                                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>
                                    <strong>Payment:</strong> {order.delivery_option === 'delivery' ? 'Pay on Delivery (+$5.00)' : 'Pay at Pickup'}
                                </p>
                                {order.order_notes && (
                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                                        <strong>Notes:</strong> {order.order_notes}
                                    </p>
                                )}
                                {order.location && (
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#01579b' }}>
                                        <strong>Delivery to:</strong> {order.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
