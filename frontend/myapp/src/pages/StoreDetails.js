import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FaStar, FaInstagram, FaTiktok, FaFacebook, FaLinkedin, FaShoppingCart, FaStore, FaShieldAlt, FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ModernFileUpload from '../components/ModernFileUpload';
import RatingModal from '../components/RatingModal';
import { useUI } from '../context/UIContext';
import LoadingSpinner from '../components/LoadingSpinner';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Helper to darken/lighten color
const adjustColor = (color, amount) => {
    const clamp = (val) => Math.min(Math.max(val, 0), 255);
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00FF) + amount);
    const b = clamp((num & 0x0000FF) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const ProductScrollSection = ({ products, addToCart, getImageUrl, user, storeInfo }) => {
    const scrollRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 10);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    }, []);

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [checkScroll, products]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.8;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            // Check scroll after animation
            setTimeout(checkScroll, 500);
        }
    };

    return (
        <div className="products-scroll-wrapper">
            {showLeftArrow && (
                <button className="scroll-arrow left" onClick={() => scroll('left')}>
                    <FaChevronLeft />
                </button>
            )}

            <div
                className="scroll-grid"
                ref={scrollRef}
                onScroll={checkScroll}
            >
                {products.map(p => (
                    <div key={p.id} className="modern-product-card" style={{
                        opacity: p.is_out_of_stock ? 0.7 : 1,
                        filter: p.is_out_of_stock ? 'grayscale(0.5)' : 'none',
                        position: 'relative'
                    }}>
                        {!!p.is_out_of_stock && (
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: '#dc2626',
                                color: 'white',
                                padding: '5px 12px',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                fontSize: '0.7rem',
                                zIndex: 2,
                                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                            }}>
                                Out of Stock
                            </div>
                        )}
                        <div className="modern-product-image-container">
                            {p.image ? (
                                <img src={getImageUrl(p.image)} alt={p.name} />
                            ) : (
                                <div className="placeholder-product-img">
                                    <FaStore />
                                </div>
                            )}
                        </div>
                        <div className="modern-product-content">
                            <div>
                                <h3 className="modern-product-name">{p.name}</h3>
                                <p className="modern-product-desc">{p.description}</p>
                            </div>
                            <div className="modern-product-footer">
                                <span className="modern-product-price">${parseFloat(p.price).toFixed(2)}</span>
                                {user?.role !== 'super_admin' && (
                                    <button
                                        className={`btn ${(!storeInfo?.is_open || p.is_out_of_stock) ? 'btn-secondary' : 'btn-primary'}`}
                                        onClick={() => storeInfo?.is_open && !p.is_out_of_stock && addToCart(p.id)}
                                        style={{
                                            padding: '8px 15px',
                                            fontSize: '0.85rem',
                                            borderRadius: '15px',
                                            cursor: (!storeInfo?.is_open || p.is_out_of_stock) ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={!storeInfo?.is_open || p.is_out_of_stock}
                                    >
                                        {!storeInfo?.is_open ? 'Closed' : p.is_out_of_stock ? 'Sold Out' : 'Add'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showRightArrow && (
                <button className="scroll-arrow right" onClick={() => scroll('right')}>
                    <FaChevronRight />
                </button>
            )}
        </div>
    );
};

const StoreDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useUI();

    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [storeInfo, setStoreInfo] = useState(null);
    const [isBanned, setIsBanned] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const { addToCart, toggleCart, cartItems, isCartOpen, showNotification } = useContext(CartContext);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '', image: null });
    const [hoverRating, setHoverRating] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [navItems, setNavItems] = useState([]);
    const [productSections, setProductSections] = useState([]);
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [userRating, setUserRating] = useState(null);
    const hasIncremented = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Check ban status if user is logged in
            if (user) {
                const banRes = await axios.get(`/api/stores/${id}/ban-status`);
                if (banRes.data.isBanned) {
                    setIsBanned(true);
                    setLoading(false);
                    return;
                }
            }

            // Fetch store info
            const storeRes = await axios.get(`/api/stores`);
            const store = storeRes.data.find(s => String(s.id) === id);
            setStoreInfo(store);

            const prodRes = await axios.get(`/api/products?storeId=${id}`);
            setProducts(prodRes.data);

            const reviewRes = await axios.get(`/api/reviews/${id}`);
            setReviews(reviewRes.data);

            // Fetch custom nav
            const navRes = await axios.get(`/api/nav/${id}`);
            setNavItems(navRes.data);

            const sectionsRes = await axios.get(`/api/sections/${id}`);
            setProductSections(sectionsRes.data);

            // Fetch user's rating if logged in
            if (user) {
                const ratingRes = await axios.get(`/api/ratings/${id}`);
                setUserRating(ratingRes.data.rating);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (storeInfo?.primary_color) {
            const root = document.documentElement;
            const primary = storeInfo.primary_color;
            const dark = adjustColor(primary, -30);
            const light = adjustColor(primary, 30);

            root.style.setProperty('--primary-color', primary);
            root.style.setProperty('--primary-dark', dark);
            root.style.setProperty('--primary-light', light);

            return () => {
                // Reset to site defaults on unmount
                root.style.setProperty('--primary-color', '#10b981');
                root.style.setProperty('--primary-dark', '#059669');
                root.style.setProperty('--primary-light', '#6ee7b7');
            };
        }
    }, [storeInfo]);

    useEffect(() => {
        if (!hasIncremented.current) {
            axios.post(`/api/stores/${id}/visitors`)
                .catch(err => console.error('Visitor count error:', err));
            hasIncremented.current = true;
        }
    }, [id]);

    // addToCart is now handled by Context

    const submitReview = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('storeId', id);
        formData.append('rating', newReview.rating);
        formData.append('comment', newReview.comment);
        if (newReview.image) formData.append('image', newReview.image);

        try {
            await axios.post('/api/reviews', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showNotification('Review submitted successfully!');
            setNewReview({ rating: 0, comment: '', image: null });
            fetchData();
        } catch (err) {
            showNotification('Error submitting review', 'error');
        }
    };

    const handleDeleteReviewRequest = (reviewId) => {
        setReviewToDelete(reviewId);
        setShowDeleteModal(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.nav-item-container')) {
                setActiveDropdown(null);
            }
        };

        if (activeDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);

    const confirmDelete = async () => {
        try {
            await axios.delete(`/api/reviews/${reviewToDelete}`);
            showNotification('Review deleted');
            setShowDeleteModal(false);
            setReviewToDelete(null);
            fetchData();
        } catch (err) {
            showNotification('Error deleting review', 'error');
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const groupedProducts = filteredProducts.reduce((acc, product) => {
        const section = product.section || 'General';
        if (!acc[section]) acc[section] = [];
        acc[section].push(product);
        return acc;
    }, {});

    // Ordered sections based on manage product sections
    // Ordered sections based on manage product sections
    const orderedSectionNames = productSections.map(s => s.name);

    // Filter sections to only show those that are in navItems or are children of something in navItems
    const navItemSectionSlugs = navItems.map(ni => ni.section_id);
    const visibleSectionIds = productSections.filter(s => {
        const slug = s.name.toLowerCase().replace(/\s+/g, '-');
        // Is it explicitly in nav?
        if (navItemSectionSlugs.includes(slug)) return true;
        // Is its parent in nav?
        if (s.parent_id) {
            const parent = productSections.find(ps => ps.id === s.parent_id);
            if (parent) {
                const parentSlug = parent.name.toLowerCase().replace(/\s+/g, '-');
                if (navItemSectionSlugs.includes(parentSlug)) return true;
            }
        }
        return false;
    }).map(s => s.name);

    const availableSections = Object.keys(groupedProducts).filter(s => visibleSectionIds.includes(s) || s === 'General').sort((a, b) => {
        const indexA = orderedSectionNames.indexOf(a);
        const indexB = orderedSectionNames.indexOf(b);

        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    if (loading) return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <LoadingSpinner message="Loading Store Details..." />
        </div>
    );

    if (isBanned) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚫</div>
                    <h1 style={{ color: '#d32f2f', marginBottom: '15px' }}>Access Denied</h1>
                    <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
                        You have been banned from this store by the administrator.
                        You can no longer view products or place orders here.
                    </p>
                    <Link
                        to="/stores"
                        className="btn btn-primary"
                        style={{ padding: '12px 30px', borderRadius: '30px', textDecoration: 'none', display: 'inline-block' }}
                    >
                        Back
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '60px' }}>
            {/* Super Admin Oversight Bar */}
            {user && user.role === 'super_admin' && (
                <div className="oversight-bar" style={{
                    background: '#064e3b',
                    color: 'white',
                    padding: '12px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2500,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaShieldAlt style={{ color: 'var(--primary-light)' }} />
                        <span style={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.9rem' }}>OVERSIGHT PANEL</span>
                        <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                        <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Viewing {storeInfo?.name} as Shopper</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ marginRight: '10px', fontSize: '0.85rem', background: storeInfo?.is_banned ? 'rgba(220, 38, 38, 0.2)' : 'rgba(16, 185, 129, 0.2)', padding: '4px 12px', borderRadius: '15px', color: storeInfo?.is_banned ? '#fecaca' : '#d1fae5' }}>
                            Status: {storeInfo?.is_banned ? 'Banned' : 'Active'}
                        </div>
                        <button
                            className={`btn ${storeInfo?.is_banned ? 'btn-secondary' : 'btn-danger'}`}
                            style={{ padding: '6px 15px', fontSize: '0.8rem', borderRadius: '10px' }}
                            onClick={() => {
                                showConfirm(`Are you sure you want to ${storeInfo.is_banned ? 'unban' : 'ban'} this store?`, async () => {
                                    try {
                                        await axios.put(`/api/superadmin/ban-store/${id}`);
                                        showNotification(storeInfo.is_banned ? 'Store Unbanned' : 'Store Banned');
                                        fetchData();
                                    } catch (err) {
                                        showNotification('Action failed', 'error');
                                    }
                                });
                            }}
                        >
                            {storeInfo?.is_banned ? 'Unban Store' : 'Ban Store'}
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ padding: '6px 15px', fontSize: '0.8rem', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary-dark)', border: 'none' }}
                            onClick={() => navigate('/super-admin/dashboard')}
                        >
                            <FaArrowLeft style={{ marginRight: '8px' }} size={10} /> Dashboard
                        </button>
                    </div>
                </div>
            )}
            <div className="store-details-container" style={{
                padding: '20px 5%',
                minHeight: '100vh',
                transition: 'all 0.3s ease',
                backgroundColor: storeInfo?.background_color || '#ffffff',
                '--primary-color': storeInfo?.primary_color || '#10b981',
                '--primary-dark': adjustColor(storeInfo?.primary_color || '#10b981', -30),
                '--primary-light': adjustColor(storeInfo?.primary_color || '#10b981', 30),
                '--secondary-color': storeInfo?.secondary_color || '#d1fae5',
            }}>
                {/* Floating Cart Icon */}
                {user && user.role !== 'super_admin' && !isCartOpen && (
                    <button
                        className="floating-cart-btn"
                        onClick={toggleCart}
                        title="Open Cart"
                    >
                        <FaShoppingCart size={24} />
                        {cartItems.length > 0 && (
                            <span className="cart-badge">{cartItems.length}</span>
                        )}
                    </button>
                )}

                {/* pill-style Back Button at the top */}
                <Link to="/stores" className="dashboard-back-btn" title="Back to Stores">
                    ← Back
                </Link>

                {storeInfo && !storeInfo.is_open && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        border: '2px solid #dc2626',
                        color: '#dc2626',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '30px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <div style={{ fontSize: '2rem' }}>🏪🚪</div>
                        <h2 style={{ margin: 0 }}>This Store is Currently Closed</h2>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                            The owner is not accepting orders at the moment. Please come back later!
                        </p>
                    </div>
                )}

                {/* Store Header */}
                {storeInfo && (
                    <div style={{ marginBottom: '30px' }}>
                        {/* Banner */}
                        {storeInfo.banner && (
                            <div className="store-banner" style={{
                                width: '100%',
                                height: '250px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                marginBottom: '20px'
                            }}>
                                <img
                                    src={getImageUrl(storeInfo.banner)}
                                    alt={`${storeInfo.name} banner`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        )}

                        {/* Profile Picture and Info */}
                        <div className="store-header-info" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '25px',
                            paddingLeft: '20px'
                        }}>
                            <div className="store-profile-pic-container" style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '4px solid var(--primary-color)',
                                backgroundColor: storeInfo.profile_pic ? 'transparent' : 'var(--primary-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                flexShrink: 0
                            }}>
                                {storeInfo.profile_pic ? (
                                    <img
                                        src={getImageUrl(storeInfo.profile_pic)}
                                        alt={storeInfo.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '3rem', color: 'white', fontWeight: 'bold' }}>
                                        {storeInfo.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="store-header-text">
                                <h1 className="store-name-title" style={{ margin: '0 0 8px 0', color: 'var(--primary-dark)', fontSize: '2.5rem' }}>{storeInfo.name}</h1>
                                {storeInfo.description && (
                                    <p className="store-description-text" style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>{storeInfo.description}</p>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                                    <div style={{ display: 'flex', color: '#fbbf24' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <FaStar
                                                key={star}
                                                size={18}
                                                style={{
                                                    opacity: star <= Math.round(storeInfo.average_rating) ? 1 : 0.25
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                                        {storeInfo.review_count > 0 ? (
                                            <>
                                                {parseFloat(storeInfo.average_rating).toFixed(1)}
                                                <a
                                                    href="#reviews"
                                                    style={{
                                                        marginLeft: '8px',
                                                        color: '#64748b',
                                                        fontSize: '0.9rem',
                                                        textDecoration: 'none',
                                                        fontWeight: 'normal',
                                                        borderBottom: '1px dashed #cbd5e1'
                                                    }}
                                                >
                                                    ({storeInfo.review_count} reviews)
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        if (!user) {
                                                            showAlert('Please login to rate this store', 'warning');
                                                            return;
                                                        }
                                                        setIsRatingModalOpen(true);
                                                    }}
                                                    style={{
                                                        marginLeft: '15px',
                                                        background: 'white',
                                                        border: '1px solid var(--primary-color)',
                                                        color: 'var(--primary-color)',
                                                        padding: '5px 12px',
                                                        borderRadius: '15px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'var(--primary-color)';
                                                        e.currentTarget.style.color = 'white';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.color = 'var(--primary-color)';
                                                    }}
                                                >
                                                    {userRating ? 'Edit Your Rating' : 'Review Us'}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'normal' }}>No ratings yet</span>
                                                <button
                                                    onClick={() => {
                                                        if (!user) {
                                                            showAlert('Please login to rate this store', 'warning');
                                                            return;
                                                        }
                                                        setIsRatingModalOpen(true);
                                                    }}
                                                    style={{
                                                        marginLeft: '15px',
                                                        background: 'white',
                                                        border: '1px solid var(--primary-color)',
                                                        color: 'var(--primary-color)',
                                                        padding: '5px 12px',
                                                        borderRadius: '15px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'var(--primary-color)';
                                                        e.currentTarget.style.color = 'white';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.color = 'var(--primary-color)';
                                                    }}
                                                >
                                                    Review Us
                                                </button>
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mega Menu Navbar (Filtered by Store Navigation) */}
                {navItems.length > 0 && (
                    <>
                        <div className="store-custom-navbar" style={{
                            background: 'white',
                            padding: '0 30px',
                            borderRadius: '30px',
                            display: 'flex',
                            gap: '5px',
                            marginBottom: '30px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            position: 'sticky',
                            top: '20px',
                            zIndex: 1000,
                            width: 'fit-content',
                            margin: '0 auto 30px',
                            transform: showNavbar ? 'translateY(0)' : 'translateY(-100px)',
                            opacity: showNavbar ? 1 : 0,
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            pointerEvents: showNavbar ? 'auto' : 'none',
                            alignItems: 'center',
                            border: '1px solid rgba(0,0,0,0.02)'
                        }}>
                            {
                                navItems.map(item => {
                                    // Try to find if this nav item is one of our product sections
                                    const section = productSections.find(s =>
                                        s.name.toLowerCase().replace(/\s+/g, '-') === item.section_id
                                    );

                                    // Get children only if it's a section
                                    const children = section ? productSections.filter(c => c.parent_id === section.id) : [];

                                    return (
                                        <div
                                            key={item.id}
                                            className={`nav-item-container ${activeDropdown === item.id ? 'active' : ''}`}
                                            style={{ position: 'relative' }}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    if (children.length > 0) {
                                                        e.preventDefault();
                                                        setActiveDropdown(activeDropdown === item.id ? null : item.id);
                                                    } else {
                                                        const element = document.getElementById(item.section_id);
                                                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                                                        setActiveDropdown(null);
                                                    }
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: '16px 20px',
                                                    color: activeDropdown === item.id ? 'var(--primary-color)' : 'var(--primary-dark)',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    fontSize: '0.95rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    borderBottom: '3px solid transparent',
                                                    transition: 'all 0.2s'
                                                }}
                                                className="nav-main-btn"
                                            >
                                                {item.label}
                                                {children.length > 0 && (
                                                    <span style={{
                                                        fontSize: '0.6em',
                                                        opacity: 0.5,
                                                        transform: activeDropdown === item.id ? 'rotate(180deg)' : 'none',
                                                        transition: 'transform 0.2s'
                                                    }}>▼</span>
                                                )}
                                            </button>

                                            {/* Dropdown for Children */}
                                            {children.length > 0 && (
                                                <div className="nav-dropdown" style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: '50%',
                                                    transform: activeDropdown === item.id ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(10px)',
                                                    minWidth: '200px',
                                                    background: 'white',
                                                    borderRadius: '16px',
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                                                    padding: '8px',
                                                    opacity: activeDropdown === item.id ? 1 : 0,
                                                    visibility: activeDropdown === item.id ? 'visible' : 'hidden',
                                                    transition: 'all 0.2s ease',
                                                    border: '1px solid rgba(0,0,0,0.04)',
                                                    zIndex: 1001
                                                }}>
                                                    {children.map(child => (
                                                        <div
                                                            key={child.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const element = document.getElementById(child.name.toLowerCase().replace(/\s+/g, '-'));
                                                                if (element) {
                                                                    element.scrollIntoView({ behavior: 'smooth' });
                                                                }
                                                                setActiveDropdown(null);
                                                            }}
                                                            style={{
                                                                padding: '10px 15px',
                                                                cursor: 'pointer',
                                                                color: '#4b5563',
                                                                fontSize: '0.9rem',
                                                                fontWeight: '500',
                                                                borderRadius: '10px',
                                                                transition: 'all 0.1s',
                                                                textAlign: 'center'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.background = 'var(--secondary-color)';
                                                                e.target.style.color = 'var(--primary-dark)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.background = 'transparent';
                                                                e.target.style.color = '#4b5563';
                                                            }}
                                                        >
                                                            {child.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <style>{`
                            .nav-item-container:hover .nav-dropdown {
                                opacity: 1 !important;
                                visibility: visible !important;
                                transform: translateX(-50%) translateY(0) !important;
                            }
                            .nav-item-container:hover .nav-main-btn {
                                color: var(--primary-color) !important;
                            }
                        `}</style>
                    </>
                )}



                <input
                    placeholder="Search products in this store..."
                    className="form-control store-search-input"
                    style={{
                        marginBottom: '30px',
                        borderRadius: '25px',
                        width: '400px',
                        maxWidth: '100%',
                        padding: '12px 20px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />

                {/* Grouped Products */}
                {
                    availableSections.length > 0 ? availableSections.map(section => (
                        <div key={section} style={{ marginBottom: '40px' }}>
                            <h2 id={section.toLowerCase().replace(/\s+/g, '-')} style={{ color: 'var(--primary-dark)', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '10px', marginBottom: '20px' }}>
                                {section}
                            </h2>
                            {groupedProducts[section].length > (windowWidth <= 768 ? 2 : 5) ? (
                                <ProductScrollSection
                                    products={groupedProducts[section]}
                                    addToCart={addToCart}
                                    getImageUrl={getImageUrl}
                                    user={user}
                                    storeInfo={storeInfo}
                                />
                            ) : (
                                <div className="grid">
                                    {groupedProducts[section].map(p => (
                                        <div key={p.id} className="modern-product-card" style={{
                                            opacity: p.is_out_of_stock ? 0.7 : 1,
                                            filter: p.is_out_of_stock ? 'grayscale(0.5)' : 'none',
                                            position: 'relative'
                                        }}>
                                            {!!p.is_out_of_stock && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    background: '#dc2626',
                                                    color: 'white',
                                                    padding: '5px 12px',
                                                    borderRadius: '20px',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.7rem',
                                                    zIndex: 2,
                                                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                                                }}>
                                                    Out of Stock
                                                </div>
                                            )}
                                            <div className="modern-product-image-container">
                                                {p.image ? (
                                                    <img src={getImageUrl(p.image)} alt={p.name} />
                                                ) : (
                                                    <div className="placeholder-product-img">
                                                        <FaStore />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="modern-product-content">
                                                <div>
                                                    <h3 className="modern-product-name">{p.name}</h3>
                                                    <p className="modern-product-desc">{p.description}</p>
                                                </div>
                                                <div className="modern-product-footer">
                                                    <span className="modern-product-price">${parseFloat(p.price).toFixed(2)}</span>
                                                    {user?.role !== 'super_admin' && (
                                                        <button
                                                            className={`btn ${(!storeInfo?.is_open || p.is_out_of_stock) ? 'btn-secondary' : 'btn-primary'}`}
                                                            onClick={() => storeInfo?.is_open && !p.is_out_of_stock && addToCart(p.id)}
                                                            style={{
                                                                padding: '8px 15px',
                                                                fontSize: '0.85rem',
                                                                borderRadius: '15px',
                                                                cursor: (!storeInfo?.is_open || p.is_out_of_stock) ? 'not-allowed' : 'pointer'
                                                            }}
                                                            disabled={!storeInfo?.is_open || p.is_out_of_stock}
                                                        >
                                                            {!storeInfo?.is_open ? 'Closed' : p.is_out_of_stock ? 'Sold Out' : 'Add'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )) : <p>No products available yet.</p>
                }

                <div id="reviews" style={{ marginTop: '40px' }}>
                    <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Reviews</h3>
                    {reviews.length > 0 ? (showAllReviews ? reviews : reviews.slice(0, 2)).map(r => (
                        <div key={r.id} className="card" style={{ padding: '20px', marginBottom: '15px', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                        <strong style={{ fontSize: '1.1rem', color: 'var(--primary-dark)' }}>{r.username}</strong>
                                        <span style={{ color: '#ffc107', fontSize: '1.1rem' }}>{'★'.repeat(r.rating)}</span>
                                    </div>
                                    <p style={{ margin: '0 0 10px 0', color: '#444', lineHeight: '1.5' }}>{r.comment}</p>
                                    {r.image_url && (
                                        <img
                                            src={getImageUrl(r.image_url)}
                                            alt="Review"
                                            style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover', display: 'block' }}
                                        />
                                    )}
                                </div>
                                {(user && (user.id === r.user_id || user.id === storeInfo?.owner_id || user.role === 'super_admin')) && (
                                    <button
                                        onClick={() => handleDeleteReviewRequest(r.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#dc2626',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            padding: '5px 10px',
                                            borderRadius: '5px',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No reviews yet.</p>}

                    {reviews.length > 2 && (
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <button
                                onClick={() => setShowAllReviews(!showAllReviews)}
                                className="btn btn-secondary"
                                style={{
                                    padding: '8px 25px',
                                    fontSize: '0.9rem',
                                    borderRadius: '20px',
                                    background: 'white',
                                    border: '1px solid var(--primary-light)',
                                    color: 'var(--primary-color)'
                                }}
                            >
                                {showAllReviews ? 'Show Less' : `Show All (${reviews.length})`}
                            </button>
                        </div>
                    )}

                    {user ? (
                        <form id="review-form" onSubmit={submitReview} className="card" style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '25px', borderRadius: '15px' }}>
                            <h4 style={{ color: 'var(--primary-dark)', marginBottom: '20px' }}>Share Your Experience</h4>

                            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>Your Rating:</label>
                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <FaStar
                                            key={star}
                                            size={30}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'color 0.2s',
                                                color: star <= (hoverRating || newReview.rating) ? '#ffc107' : '#e4e5e9'
                                            }}
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        />
                                    ))}
                                    <span style={{ marginLeft: '10px', color: '#666', fontWeight: 'bold' }}>
                                        {newReview.rating} / 5
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>Your Review:</label>
                                <textarea
                                    placeholder="Tell us what you liked (or didn't like)..."
                                    value={newReview.comment}
                                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                    className="form-control"
                                    style={{ minHeight: '100px', borderRadius: '10px', padding: '15px' }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <ModernFileUpload
                                    label="Add a Review Photo (Optional)"
                                    onChange={e => setNewReview({ ...newReview, image: e.target.files[0] })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '1.1rem' }}
                            >
                                Post Your Review
                            </button>
                        </form>
                    ) : (
                        <div className="card" style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '15px', textAlign: 'center' }}>
                            <h4 style={{ color: 'var(--primary-dark)', marginBottom: '15px' }}>Have you visited this store?</h4>
                            <p style={{ color: '#666', marginBottom: '20px' }}>Share your experience with others.</p>
                            <Link to="/login" className="btn btn-primary" style={{ padding: '10px 25px', borderRadius: '20px', textDecoration: 'none' }}>
                                Login to Write a Review
                            </Link>
                        </div>
                    )}
                </div>

                {/* About Store Section */}
                {storeInfo && storeInfo.about_content && (
                    <div id="about" style={{ marginTop: '60px', marginBottom: '40px' }}>
                        <div className="card" style={{
                            padding: '30px',
                            backgroundColor: '#fff',
                            borderRadius: '20px',
                            border: '1px solid #eee',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}>
                            <h2 style={{
                                color: 'var(--primary-dark)',
                                borderBottom: '3px solid var(--primary-color)',
                                paddingBottom: '10px',
                                display: 'inline-block',
                                marginBottom: '20px'
                            }}>
                                About Our Store
                            </h2>
                            <div style={{
                                fontSize: '1.1rem',
                                lineHeight: '1.8',
                                color: '#444',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {storeInfo.about_content}
                            </div>

                            {/* Social Media Links */}
                            <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                <style>{`
                                    .social-icon-modern {
                                        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                                        display: inline-flex;
                                        text-decoration: none;
                                    }
                                    .social-icon-modern:hover {
                                        transform: translateY(-5px) scale(1.15);
                                        filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));
                                    }
                                    .social-icon-modern:active {
                                        transform: scale(0.95);
                                    }
                                `}</style>
                                <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#666' }}>Follow Us</h4>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    {storeInfo.instagram_link && (
                                        <a
                                            href={storeInfo.instagram_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="social-icon-modern"
                                            style={{ color: '#E1306C', fontSize: '1.8rem' }}
                                        >
                                            <FaInstagram />
                                        </a>
                                    )}
                                    {storeInfo.tiktok_link && (
                                        <a
                                            href={storeInfo.tiktok_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="social-icon-modern"
                                            style={{ color: 'black', fontSize: '1.6rem' }}
                                        >
                                            <FaTiktok />
                                        </a>
                                    )}
                                    {storeInfo.facebook_link && (
                                        <a
                                            href={storeInfo.facebook_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="social-icon-modern"
                                            style={{ color: '#1877F2', fontSize: '1.8rem' }}
                                        >
                                            <FaFacebook />
                                        </a>
                                    )}
                                    {storeInfo.linkedin_link && (
                                        <a
                                            href={storeInfo.linkedin_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="social-icon-modern"
                                            style={{ color: '#0A66C2', fontSize: '1.8rem' }}
                                        >
                                            <FaLinkedin />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Deletion Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🗑️</div>
                            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '15px' }}>Delete Review?</h2>
                            <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.1rem' }}>
                                Are you sure you want to permanently remove this review? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, padding: '12px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="btn btn-danger"
                                    style={{ flex: 1, padding: '12px' }}
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                storeId={id}
                initialRating={userRating}
                onRatingSubmitted={() => {
                    showNotification('Thank you for rating!');
                    fetchData();
                }}
            />
            <style>{`
                @media (max-width: 768px) {
                    .store-details-container {
                        padding: 15px !important;
                    }
                    .store-header-info {
                        flex-direction: column !important;
                        text-align: center !important;
                        padding-left: 0 !important;
                    }
                    .store-name-title {
                        font-size: 1.8rem !important;
                    }
                    .store-banner {
                        height: 150px !important;
                    }
                    .store-custom-navbar {
                        width: 100% !important;
                        overflow-x: auto !important;
                        white-space: nowrap !important;
                        padding: 0 10px !important;
                        border-radius: 15px !important;
                    }
                    .store-search-input {
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};
export default StoreDetails;
