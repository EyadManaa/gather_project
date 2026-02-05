import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHeart, FaRegHeart, FaSearch, FaArrowRight, FaStar } from 'react-icons/fa';
import { useUI } from '../context/UIContext';
import LoadingSpinner from '../components/LoadingSpinner';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBanModal, setShowBanModal] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showNav, setShowNav] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showAlert } = useUI();

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await axios.get('/api/stores');
                setStores(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchFavorites = async () => {
            if (user) {
                try {
                    const res = await axios.get('/api/favorites');
                    setFavorites(res.data.map(f => f.id));
                } catch (err) {
                    console.error('Error fetching favorites:', err);
                }
            }
        };

        fetchStores();
        fetchFavorites();

        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 300) { // Scrolling down
                    setShowNav(false);
                } else { // Scrolling up
                    setShowNav(true);
                }
                setLastScrollY(window.scrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);
        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [user, lastScrollY]);

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
        } catch (err) {
            console.error('Error toggling favorite:', err);
        }
    };

    const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group stores by category
    const groupedStores = filteredStores.reduce((acc, store) => {
        const cat = store.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(store);
        return acc;
    }, {});

    if (loading) return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <LoadingSpinner message="Loading stores..." />
        </div>
    );

    return (
        <div style={{ paddingBottom: '60px', paddingTop: '80px', paddingLeft: '5%', paddingRight: '5%' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                {/* Search Bar */}
                <div style={{
                    maxWidth: '500px',
                    margin: '0 auto',
                    position: 'relative'
                }}>
                    <input
                        type="text"
                        placeholder="Search stores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control"
                        style={{
                            padding: '12px 20px 12px 45px',
                            borderRadius: '30px',
                            border: '1px solid #ddd',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            fontSize: '1rem',
                            width: '100%'
                        }}
                    />
                    <FaSearch style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-60%)', // Adjusted slightly up for inputs having bottom margin
                        color: '#999'
                    }} />
                </div>
                <p style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '15px', fontWeight: '500', textAlign: 'center' }}>Find your next favorite shop.</p>
            </div>

            {/* Category Navigation Pills */}
            {Object.keys(groupedStores).length > 1 && (
                <div style={{
                    position: 'sticky',
                    top: '80px',
                    zIndex: 100,
                    backgroundColor: 'rgba(240, 253, 244, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '15px 0',
                    marginBottom: '40px',
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                    transform: showNav ? 'translateY(0)' : 'translateY(-100px)',
                    opacity: showNav ? 1 : 0,
                    transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                }} className="category-nav">
                    <style>{`
                        .category-nav::-webkit-scrollbar { display: none; }
                        .cat-pill {
                            white-space: nowrap;
                            padding: 8px 20px;
                            background: white;
                            border: 1px solid var(--secondary-color);
                            border-radius: 30px;
                            color: var(--primary-dark);
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 0.9rem;
                            transition: all 0.3s ease;
                        }
                        .cat-pill:hover {
                            background: var(--primary-color);
                            color: white;
                            transform: translateY(-2px);
                        }
                    `}</style>
                    {Object.keys(groupedStores).sort().map(category => (
                        <div
                            key={category}
                            className="cat-pill"
                            onClick={() => {
                                const element = document.getElementById(`category-${category}`);
                                if (element) {
                                    const yOffset = -150;
                                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                    window.scrollTo({ top: y, behavior: 'smooth' });
                                }
                            }}
                        >
                            {category}
                        </div>
                    ))}
                </div>
            )}

            {Object.keys(groupedStores).length > 0 ? (
                Object.keys(groupedStores).sort().map(category => (
                    <div key={category} id={`category-${category}`} style={{ marginBottom: '60px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginBottom: '25px',
                            paddingBottom: '10px',
                            borderBottom: '2px solid var(--secondary-color)'
                        }}>
                            <h2 style={{
                                color: 'var(--primary-dark)',
                                margin: 0,
                                fontSize: '1.8rem',
                                fontWeight: '800',
                                textTransform: 'capitalize'
                            }}>
                                {category}
                            </h2>
                            <span style={{
                                background: 'var(--secondary-color)',
                                color: 'var(--primary-dark)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                            }}>
                                {groupedStores[category].length} {groupedStores[category].length === 1 ? 'Store' : 'Stores'}
                            </span>
                        </div>
                        <div className="grid">
                            {groupedStores[category].map(store => (
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

                                        {/* Favorite Icon */}
                                        {user && user.role !== 'super_admin' && (
                                            <div
                                                className="modern-store-fav"
                                                onClick={(e) => toggleFavorite(e, store.id)}
                                            >
                                                {favorites.includes(store.id) ? (
                                                    <FaHeart style={{ color: '#ef4444', fontSize: '1.3rem' }} />
                                                ) : (
                                                    <FaRegHeart style={{ color: '#666', fontSize: '1.3rem' }} />
                                                )}
                                            </div>
                                        )}

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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
                                                <div style={{ display: 'flex', color: '#fbbf24' }}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <FaStar
                                                            key={star}
                                                            size={14}
                                                            style={{
                                                                opacity: star <= Math.round(store.average_rating) ? 1 : 0.3
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 'bold' }}>
                                                    {store.review_count > 0 ? (
                                                        <>({parseFloat(store.average_rating).toFixed(1)}) <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>• {store.review_count} reviews</span></>
                                                    ) : (
                                                        <span style={{ fontSize: '0.7rem', fontStyle: 'italic', opacity: 0.8 }}>New Store</span>
                                                    )}
                                                </span>
                                            </div>
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
                    </div>
                ))
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '24px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
                    <h2 style={{ color: '#666', marginBottom: '10px' }}>No stores found</h2>
                    <p style={{ color: '#999' }}>Try searching for something else.</p>
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
                    zIndex: 2000,
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '24px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        maxWidth: '450px',
                        width: '90%',
                        position: 'relative',
                        textAlign: 'center',
                        transform: 'translateY(0)',
                        animation: 'slideUp 0.3s ease'
                    }}>
                        {/* Red Close Button */}
                        <button
                            onClick={() => setShowBanModal(false)}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#dc2626';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fee2e2';
                                e.currentTarget.style.color = '#dc2626';
                            }}
                        >
                            ×
                        </button>

                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚫</div>
                        <h2 style={{ color: '#b91c1c', marginBottom: '10px', fontSize: '1.8rem' }}>Access Denied</h2>
                        <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '30px' }}>
                            You have been restricted from entering this store by the administrator.
                            Please contact support if you believe this is an error.
                        </p>
                        <button
                            onClick={() => setShowBanModal(false)}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}
                        >
                            Understood
                        </button>
                    </div>
                    <style>{`
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default Stores;
