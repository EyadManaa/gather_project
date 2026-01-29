import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaChartLine, FaUsers, FaBoxOpen, FaGem, FaCheck, FaRocket, FaStore } from 'react-icons/fa';
import { motion, useAnimation } from 'framer-motion';
import { Tilt } from 'react-tilt';
import FallingLeaves from './FallingLeaves';

// Animated Counter Component
const Counter = ({ from, to }) => {
    const [count, setCount] = useState(from);

    useEffect(() => {
        const controls = {
            from,
            to,
            duration: 2, // seconds
            onUpdate: (latest) => setCount(Math.floor(latest))
        };
        // Simple manual implementation since framer-motion useAnimation handles components mostly
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / (controls.duration * 1000), 1);
            setCount(Math.floor(progress * (to - from) + from));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [from, to]);

    return <span>{count}</span>;
}

const AdminHome = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({ income: 0, visitors: 0, productCount: 0 });
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storeRes = await axios.get('/api/stores/my-store');
                if (storeRes.data) {
                    setStore(storeRes.data);
                    const [statsRes, prodRes] = await Promise.all([
                        axios.get(`/api/stores/${storeRes.data.id}/stats`),
                        axios.get(`/api/products?storeId=${storeRes.data.id}`)
                    ]);
                    setStats(statsRes.data);
                    setProducts(prodRes.data);
                }

                // Fetch subscriptions from public endpoint
                const subsRes = await axios.get('/api/subscriptions');
                setSubscriptions(subsRes.data);
            } catch (err) { }
        };
        fetchData();
    }, []);

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.2, type: 'spring', stiffness: 50 }
        })
    };

    return (
        <div style={{ background: 'transparent', minHeight: '100vh', padding: '40px 0', position: 'relative', overflow: 'hidden' }}>
            <FallingLeaves />
            <div className="container">
                {/* BAN NOTICE */}
                {!!store?.is_banned && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            backgroundColor: '#fee2e2',
                            border: '2px solid #dc2626',
                            color: '#dc2626',
                            padding: '20px 30px',
                            borderRadius: '20px',
                            marginBottom: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            boxShadow: '0 10px 25px rgba(220, 38, 38, 0.1)'
                        }}
                    >
                        <div style={{ fontSize: '2.5rem' }}>🚫</div>
                        <div>
                            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', fontWeight: 'bold' }}>Store Access Restricted</h2>
                            <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>
                                Your store has been restricted by a platform administrator.
                                Customers can no longer view your shop or products, and you cannot receive new orders.
                                Please contact support for more information.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* WELCOME HEADER */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: '50px' }}
                    className="admin-welcome-header"
                >
                    <h1 style={{ color: 'var(--primary-dark)', fontSize: '2.5rem', marginBottom: '10px' }} className="responsive-title">
                        Welcome back, <span style={{ color: 'var(--primary-color)' }}>{store?.name || user.username}</span>! 🚀
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.2rem' }} className="responsive-subtitle">Here's what's happening in your store today.</p>
                </motion.div>

                {/* ANIMATED STATS */}
                <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '60px' }}>
                    {[
                        { label: 'Total Revenue', value: stats.income, prefix: '$', icon: <FaChartLine />, color: '#10b981' },
                        { label: 'Active Visitors', value: stats.visitors, prefix: '', icon: <FaUsers />, color: '#3b82f6' },
                        { label: 'Products', value: stats.productCount, prefix: '', icon: <FaBoxOpen />, color: '#f59e0b' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.7)',
                                padding: '30px',
                                borderRadius: '20px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '25px',
                                border: '1px solid rgba(241, 245, 249, 0.5)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '15px', background: `${stat.color}15`,
                                color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem'
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '2.5rem', color: '#1e293b' }}>
                                    {stat.prefix}<Counter from={0} to={parseFloat(stat.value)} />
                                </h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* SUBSCRIPTION PLANS */}
                <div style={{ marginBottom: '80px' }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        style={{ textAlign: 'center', marginBottom: '40px' }}
                    >
                        <h2 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '15px' }}>Unlock Full Potential</h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Upgrade your store to reach more customers and increase sales.</p>
                    </motion.div>

                    <div className="admin-subs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', alignItems: 'center' }}>
                        {subscriptions.map((sub, index) => {
                            const isPopular = sub.name.toLowerCase() === 'pro';
                            const isCurrent = store?.subscription_tier?.toLowerCase() === sub.name.toLowerCase();
                            const getPeriodText = (days) => {
                                if (!days || days <= 0) return 'mo';
                                if (days === 30) return 'mo';
                                if (days === 365) return 'year';
                                if (days === 7) return 'week';
                                return `${days} days`;
                            };

                            const features = Array.isArray(sub.features) ? sub.features : (sub.features ? sub.features.split(',') : []);

                            if (isPopular) {
                                return (
                                    <Tilt key={sub.id} options={{ max: 10, scale: 1.02 }}>
                                        <motion.div
                                            custom={index}
                                            variants={cardVariants}
                                            initial="hidden"
                                            whileInView="visible"
                                            style={{
                                                background: 'linear-gradient(145deg, #10b981, #059669)',
                                                padding: '50px',
                                                borderRadius: '30px',
                                                boxShadow: '0 20px 50px rgba(16,185,129,0.3)',
                                                color: 'white',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute', top: '20px', right: '20px',
                                                background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold'
                                            }}>POPULAR</div>

                                            <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaRocket /> {sub.name}</h3>
                                            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '30px' }}>${parseFloat(sub.price).toFixed(2)}<span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>/{getPeriodText(sub.duration_days)}</span></div>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0' }}>
                                                {features.map((feature, i) => (
                                                    <li key={i} style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}><FaCheck color="white" /> {feature}</li>
                                                ))}
                                            </ul>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => navigate('/admin/dashboard', { state: { activeSection: 'subscriptions' } })}
                                                style={{
                                                    width: '100%', padding: '18px', borderRadius: '15px', border: 'none',
                                                    background: 'white', color: '#059669', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {isCurrent ? 'Current Plan' : `Upgrade to ${sub.name}`}
                                            </motion.button>
                                        </motion.div>
                                    </Tilt>
                                );
                            }

                            return (
                                <motion.div
                                    key={sub.id}
                                    custom={index}
                                    variants={cardVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)' }}
                                >
                                    <h3 style={{ color: '#64748b', fontSize: '1.5rem', marginBottom: '20px' }}>{sub.name}</h3>
                                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '30px' }}>
                                        {parseFloat(sub.price) === 0 ? 'Free' : `$${parseFloat(sub.price).toFixed(2)}`}
                                        {parseFloat(sub.price) > 0 && <span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>/{getPeriodText(sub.duration_days)}</span>}
                                    </div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', color: '#64748b' }}>
                                        {features.map((feature, i) => (
                                            <li key={i} style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}><FaCheck color="#10b981" /> {feature}</li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => navigate('/admin/dashboard', { state: { activeSection: 'subscriptions' } })}
                                        style={{
                                            width: '100%',
                                            padding: '15px',
                                            borderRadius: '12px',
                                            border: isCurrent ? '1px solid #e2e8f0' : '1px solid #10b981',
                                            background: 'transparent',
                                            color: isCurrent ? '#64748b' : '#10b981',
                                            fontWeight: 'bold',
                                            cursor: isCurrent ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={isCurrent}
                                    >
                                        {isCurrent ? 'Current Plan' : sub.name.toLowerCase() === 'enterprise' ? 'Contact Sales' : `Upgrade to ${sub.name}`}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* FEATURE SHOWCASE MOCKUP */}
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '40px' }}>Your Store on Mobile</h2>
                        <div className="admin-phone-mockup" style={{
                            width: '300px', height: '600px', background: 'white', border: '10px solid #1e293b', borderRadius: '40px', margin: '0 auto',
                            position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}>
                            {/* Mockup Screen Content */}
                            <div style={{ background: 'var(--primary-color)', height: '60px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                {store?.name || 'My Store'} {!store?.is_open_effective && <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(Closed)</span>}
                            </div>
                            <div style={{ padding: '15px', height: 'calc(100% - 60px)', overflowY: 'auto' }}>
                                <div style={{ width: '100%', height: '140px', background: '#f1f5f9', borderRadius: '15px', marginBottom: '15px', overflow: 'hidden' }}>
                                    {store?.banner ? <img src={store.banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--primary-light)', opacity: 0.2 }}></div>}
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'center' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-light)', overflow: 'hidden', border: '2px solid white' }}>
                                        {store?.profile_pic ? <img src={store.profile_pic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaStore style={{ margin: '12px', color: 'white' }} />}
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ width: '120px', fontWeight: 'bold', color: 'var(--primary-dark)', fontSize: '0.9rem' }}>{store?.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{store?.description?.substring(0, 30)}...</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {products.slice(0, 4).map(product => (
                                        <div key={product.id} style={{ height: '110px', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                            <div style={{ height: '70px', background: '#f8fafc' }}>
                                                {product.image ? <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--primary-light)', opacity: 0.1 }}></div>}
                                            </div>
                                            <div style={{ padding: '5px', textAlign: 'left' }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>${product.price}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {products.length === 0 && [1, 2, 3, 4].map(i => (
                                        <div key={i} style={{ height: '110px', background: '#f1f5f9', borderRadius: '12px' }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style>{`
                @media (max-width: 992px) {
                    .admin-stats-grid, .admin-subs-grid {
                        grid-template-columns: 1fr !important;
                        gap: 20px !important;
                    }
                    .admin-welcome-header {
                        text-align: center;
                        margin-bottom: 30px !important;
                    }
                    .responsive-title {
                        font-size: 1.8rem !important;
                    }
                    .responsive-subtitle {
                        font-size: 1rem !important;
                    }
                }
                @media (max-width: 480px) {
                    .admin-welcome-header {
                        padding: 0 10px;
                    }
                    .admin-phone-mockup {
                        width: 260px !important;
                        height: 520px !important;
                        border-width: 8px !important;
                    }
                }
            `}</style>
        </div >
    );
};

export default AdminHome;
