import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHeart, FaRegHeart, FaArrowRight, FaStar, FaShoppingBag, FaStore } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useUI } from '../context/UIContext';
import { Tilt } from 'react-tilt';

const CustomerHome = () => {
    const [stores, setStores] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showAlert } = useUI();

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await axios.get('/api/stores/featured');
                setStores(res.data.slice(0, 4));
            } catch (err) {
                console.error(err);
            }
        };

        const fetchFavorites = async () => {
            if (user) {
                try {
                    const res = await axios.get('/api/favorites');
                    setFavorites(res.data.map(f => f.id));
                } catch (err) { console.error(err); }
            }
        };

        const fetchTrending = async () => {
            try {
                const res = await axios.get('/api/products/trending');
                setTrendingProducts(res.data.slice(0, 8));
            } catch (err) { console.error(err); }
        };

        fetchStores();
        fetchFavorites();
        fetchTrending();
    }, [user]);

    const toggleFavorite = async (e, storeId) => {
        e.stopPropagation();
        if (!user) {
            showAlert('Please login to add favorites', 'warning');
            return;
        }
        try {
            const res = await axios.post('/api/favorites/toggle', { storeId });
            if (res.data.isFavorite) {
                setFavorites([...favorites, storeId]);
            } else {
                setFavorites(favorites.filter(id => id !== storeId));
            }
        } catch (err) { console.error(err); }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    const floatAnimation = {
        y: [0, -15, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    return (
        <div style={{ overflowX: 'hidden' }}>
            {/* HERO SECTION */}
            <section style={{
                height: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Floating Background Blobs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        top: '-10%',
                        right: '-10%',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(74,222,128,0.2) 0%, rgba(255,255,255,0) 70%)',
                        zIndex: 0
                    }}
                />
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 60, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        bottom: '-10%',
                        left: '-10%',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, rgba(255,255,255,0) 70%)',
                        zIndex: 0
                    }}
                />

                <div className="container hero-container" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '50px', alignItems: 'center' }}>

                    {/* Hero Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="hero-title" style={{ fontSize: '4.5rem', lineHeight: '1.1', color: 'var(--primary-dark)', marginBottom: '25px', fontWeight: '900' }}>
                            Discover Your Next <span style={{ color: 'var(--primary-color)' }}>Obsession.</span>
                        </h1>
                        <p className="hero-subtitle" style={{ fontSize: '1.4rem', color: '#555', marginBottom: '40px', maxWidth: '500px' }}>
                            Explore unique stores, find amazing products, and support local creators. All in one place.
                        </p>
                        <div className="hero-actions" style={{ display: 'flex', gap: '20px' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/stores')}
                                className="btn btn-primary"
                                style={{ padding: '15px 40px', fontSize: '1.2rem', borderRadius: '50px', boxShadow: '0 10px 25px rgba(22,163,74,0.3)' }}
                            >
                                Start Exploring
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Hero Visuals (Floating Cards) */}
                    <div className="hero-visuals" style={{ position: 'relative', height: '500px' }}>
                        {stores.length > 0 && (
                            <motion.div
                                animate={floatAnimation}
                                onClick={() => navigate(`/store/${stores[0].id}`)}
                                style={{
                                    position: 'absolute',
                                    top: '50px',
                                    right: '50px',
                                    width: '300px',
                                    background: 'white',
                                    padding: '20px',
                                    borderRadius: '24px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                                    zIndex: 2,
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: 'var(--primary-light)',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {stores[0].profile_pic ? (
                                            <img src={getImageUrl(stores[0].profile_pic)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <FaStore style={{ color: 'white' }} size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--primary-dark)', fontSize: '0.9rem' }}>{stores[0].name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#666' }}>Featured Store</div>
                                    </div>
                                </div>
                                <div style={{ height: '200px', background: '#f8f8f8', borderRadius: '16px', overflow: 'hidden' }}>
                                    {stores[0].banner ? <img src={getImageUrl(stores[0].banner)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--primary-light)', opacity: 0.1 }}></div>}
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            style={{
                                position: 'absolute',
                                bottom: '40px',
                                left: '0px',
                                width: '280px',
                                background: 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(10px)',
                                padding: '20px',
                                borderRadius: '24px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                                zIndex: 3
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>Trending Now</div>
                                <FaHeart color="#ef4444" />
                            </div>
                            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                {trendingProducts.slice(0, 2).map((p, i) => (
                                    <div key={p.id} style={{ flex: 1, height: '90px', background: '#dcfce7', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/store/${p.store_id}`)}>
                                        {p.image ? <img src={getImageUrl(p.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--primary-color)', opacity: 0.2 }}></div>}
                                    </div>
                                ))}
                                {trendingProducts.length === 0 && (
                                    <>
                                        <div style={{ flex: 1, height: '80px', background: '#dcfce7', borderRadius: '12px' }}></div>
                                        <div style={{ flex: 1, height: '80px', background: '#dcfce7', borderRadius: '12px' }}></div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FEATURED FEED */}
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '60px' }}
                    >
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '15px' }}>Featured Stores</h2>
                        <p style={{ fontSize: '1.2rem', color: '#666' }}>Handpicked selections just for you.</p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid"
                    >
                        {stores.slice(0, 6).map(store => (
                            <Tilt key={store.id} options={{ max: 15, scale: 1.02 }}>
                                <motion.div
                                    variants={itemVariants}
                                    onClick={(e) => {
                                        if (!user || !store.is_banned) navigate(`/store/${store.id}`);
                                    }}
                                    style={{
                                        background: 'white',
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ height: '220px', position: 'relative' }}>
                                        {store.banner ? (
                                            <img src={getImageUrl(store.banner)} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: '#eee' }}></div>
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)'
                                        }}></div>

                                        {user && (
                                            <motion.button
                                                whileTap={{ scale: 0.8 }}
                                                onClick={(e) => toggleFavorite(e, store.id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '15px',
                                                    right: '15px',
                                                    background: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                {favorites.includes(store.id) ? (
                                                    <FaHeart color="#ef4444" size={20} />
                                                ) : (
                                                    <FaRegHeart color="#666" size={20} />
                                                )}
                                            </motion.button>
                                        )}

                                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{store.name}</h3>
                                            <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                                                {store.description?.substring(0, 50)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #eee' }}>
                                                {store.profile_pic ? (
                                                    <img src={getImageUrl(store.profile_pic)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: 'var(--primary-color)' }}></div>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>Visit Store</span>
                                        </div>
                                        <div style={{
                                            width: '35px', height: '35px', borderRadius: '50%', background: '#f0fdf4',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'
                                        }}>
                                            <FaArrowRight />
                                        </div>
                                    </div>
                                </motion.div>
                            </Tilt>
                        ))}
                    </motion.div>

                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/stores')}
                            style={{
                                background: 'transparent',
                                border: '2px solid var(--primary-color)',
                                color: 'var(--primary-color)',
                                padding: '12px 30px',
                                borderRadius: '30px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            View All Stores
                        </motion.button>
                    </div>
                </div>
            </section>

            {/* TRENDING PRODUCTS FEED */}
            <section style={{ padding: '80px 0', background: '#f0fdf4' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '60px' }}
                    >
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '15px' }}>Trending Now</h2>
                        <p style={{ fontSize: '1.2rem', color: '#666' }}>Most loved products on the platform.</p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid"
                    >
                        {trendingProducts.map(product => (
                            <Tilt key={product.id} options={{ max: 15, scale: 1.02 }}>
                                <motion.div
                                    variants={itemVariants}
                                    onClick={() => navigate(`/store/${product.store_id}`)}
                                    style={{
                                        background: 'white',
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                        cursor: 'pointer',
                                        height: '100%'
                                    }}
                                >
                                    <div style={{ height: '200px', background: '#f8f8f8' }}>
                                        {product.image ? (
                                            <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}><FaShoppingBag size={40} /></div>
                                        )}
                                    </div>
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: 'var(--primary-dark)' }}>{product.name}</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '900', color: 'var(--primary-color)', fontSize: '1.1rem' }}>${parseFloat(product.price).toFixed(2)}</span>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', border: 'none', padding: '8px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' }}
                                            >
                                                Buy Now
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            </Tilt>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* WHY JOIN SECTION */}
            <section style={{ padding: '80px 0', background: '#f9fafb' }}>
                <div className="container">
                    <div className="why-join-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                        {[
                            { icon: <FaShoppingBag />, title: "Curated Products", desc: "Find unique items you won't see anywhere else." },
                            { icon: <FaStore />, title: "Support Local", desc: "Directly support independent store owners and creators." },
                            { icon: <FaStar />, title: "Quality First", desc: "We ensure all stores meet our high standards." }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                style={{ textAlign: 'center', padding: '30px' }}
                            >
                                <div style={{
                                    width: '80px', height: '80px', margin: '0 auto 20px',
                                    background: 'var(--primary-light)', color: 'var(--primary-dark)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2rem'
                                }}>
                                    {item.icon}
                                </div>
                                <h3 style={{ marginBottom: '10px', color: 'var(--primary-dark)' }}>{item.title}</h3>
                                <p style={{ color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <style>{`
                @media (max-width: 992px) {
                    .hero-container {
                        grid-template-columns: 1fr !important;
                        text-align: center;
                        gap: 30px !important;
                    }
                    .hero-title {
                        font-size: 3rem !important;
                    }
                    .hero-subtitle {
                        margin: 0 auto 30px !important;
                        font-size: 1.1rem !important;
                    }
                    .hero-actions {
                        justify-content: center;
                    }
                    .hero-visuals {
                        height: 400px !important;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .hero-visuals > div {
                        position: relative !important;
                        top: auto !important;
                        right: auto !important;
                        left: auto !important;
                        bottom: auto !important;
                        transform: none !important;
                    }
                    .hero-visuals > div:last-child {
                        display: none !important; /* Hide the smaller floating card on mobile for cleaner look */
                    }
                    .why-join-grid {
                        grid-template-columns: 1fr !important;
                        gap: 15px !important;
                    }
                }
                @media (max-width: 480px) {
                    .hero-title {
                        font-size: 2.2rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CustomerHome;
