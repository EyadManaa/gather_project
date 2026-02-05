import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHeart, FaArrowRight } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const Favorites = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBanModal, setShowBanModal] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const fetchFavorites = async () => {
        if (user) {
            try {
                const res = await axios.get('/api/favorites');
                setStores(res.data);
            } catch (err) {
                console.error('Error fetching favorites:', err);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
            navigate('/login');
        }
    };

    useEffect(() => {
        fetchFavorites();
        // eslint-disable-next-line
    }, [user, navigate]);

    const handleStoreClick = async (e, storeId) => {
        e.preventDefault();
        try {
            const banRes = await axios.get(`/api/stores/${storeId}/ban-status`);
            if (banRes.data.isBanned) {
                setShowBanModal(true);
            } else {
                navigate(`/store/${storeId}`);
            }
        } catch (err) {
            navigate(`/store/${storeId}`);
        }
    };

    const removeFavorite = async (e, storeId) => {
        e.stopPropagation();
        try {
            await axios.post('/api/favorites/toggle', { storeId });
            setStores(stores.filter(s => s.id !== storeId));
        } catch (err) {
            console.error('Error removing favorite:', err);
        }
    };

    if (loading) return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <LoadingSpinner message="Loading your favorites..." />
        </div>
    );

    return (
        <div style={{ paddingBottom: '60px' }}>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <h1 style={{ color: 'var(--primary-dark)', fontSize: '3rem', marginBottom: '10px' }}>Your Favorites ❤️</h1>
                <p style={{ fontSize: '1.2rem', color: '#666' }}>All the stores you love, in one place.</p>
            </div>

            {stores.length > 0 ? (
                <div className="grid">
                    {stores.map(store => (
                        <div
                            key={store.id}
                            className="modern-store-card"
                            onClick={(e) => handleStoreClick(e, store.id)}
                        >
                            <div className="modern-store-banner">
                                {/* Closed Overlay */}
                                {!store.is_open && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '0',
                                        left: '0',
                                        right: '0',
                                        bottom: '0',
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 4
                                    }}>
                                        <span style={{
                                            background: '#dc2626',
                                            color: 'white',
                                            padding: '5px 15px',
                                            borderRadius: '20px',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem'
                                        }}>
                                            CLOSED
                                        </span>
                                    </div>
                                )}

                                {/* Heart Icon (Always fixed for removal on this page) */}
                                <div
                                    className="modern-store-fav"
                                    onClick={(e) => removeFavorite(e, store.id)}
                                >
                                    <FaHeart style={{ color: '#ef4444', fontSize: '1.3rem' }} />
                                </div>

                                {store.banner ? (
                                    <img src={getImageUrl(store.banner)} alt={store.name} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No Banner</div>
                                )}

                                {/* Gradient Overlay */}
                                <div className="modern-store-overlay"></div>

                                {/* Store Info Overlay */}
                                <div className="modern-store-info">
                                    <h3 className="modern-store-name">{store.name}</h3>
                                    {store.description && <p className="modern-store-tagline">{store.description}</p>}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="modern-store-footer">
                                <div className="modern-store-visit-group">
                                    {store.profile_pic ? (
                                        <img src={getImageUrl(store.profile_pic)} alt={store.name} className="modern-store-profile" />
                                    ) : (
                                        <div className="modern-store-profile" style={{ background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>{store.name.charAt(0)}</div>
                                    )}
                                    <span className="modern-store-visit-text">Visit Store</span>
                                </div>
                                <div className="modern-store-arrow-btn">
                                    <FaArrowRight />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb', borderRadius: '24px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❤️</div>
                    <h2 style={{ color: 'var(--primary-dark)', marginBottom: '10px' }}>No favorites yet!</h2>
                    <p style={{ color: '#666', marginBottom: '30px' }}>Start exploring and heart the stores you like to see them here.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                        style={{ padding: '12px 30px', borderRadius: '30px', fontWeight: 'bold' }}
                    >
                        Browse Stores
                    </button>
                </div>
            )}

            {/* Custom Ban Modal */}
            {showBanModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '24px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        maxWidth: '450px',
                        width: '90%',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚫</div>
                        <h2 style={{ color: '#b91c1c', marginBottom: '10px' }}>Access Denied</h2>
                        <p style={{ color: '#4b5563', marginBottom: '30px' }}>You have been restricted from entering this store.</p>
                        <button onClick={() => setShowBanModal(false)} className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px' }}>
                            Understood
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Favorites;
