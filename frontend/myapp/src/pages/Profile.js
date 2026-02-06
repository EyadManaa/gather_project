import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineUser,
    HiOutlineCamera,
    HiOutlineTrash,
    HiOutlineExclamationCircle,
    HiOutlineClipboardDocumentList,
    HiOutlineHeart,
    HiOutlineShoppingBag,
    HiOutlineBuildingStorefront,
    HiOutlineMapPin,
    HiOutlinePhone
} from 'react-icons/hi2';
import { FaHeart } from 'react-icons/fa';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const { showAlert } = useUI();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'purchases', 'orders', 'favorites'
    const [username, setUsername] = useState(user?.username || '');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(getImageUrl(user?.profile_pic));
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Data states
    const [purchasedProducts, setPurchasedProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [fetchingData, setFetchingData] = useState(false);

    useEffect(() => {
        if (activeTab === 'purchases') fetchPurchases();
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'favorites') fetchFavorites();
    }, [activeTab]);

    const fetchPurchases = async () => {
        setFetchingData(true);
        try {
            const res = await axios.get('/api/orders/purchased-products');
            setPurchasedProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingData(false);
        }
    };

    const fetchOrders = async () => {
        setFetchingData(true);
        try {
            const res = await axios.get('/api/orders/my-orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingData(false);
        }
    };

    const fetchFavorites = async () => {
        setFetchingData(true);
        try {
            const res = await axios.get('/api/favorites');
            setFavorites(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingData(false);
        }
    };

    const removeFavorite = async (storeId) => {
        try {
            await axios.post('/api/favorites/toggle', { storeId });
            setFavorites(favorites.filter(s => s.id !== storeId));
            showAlert('Store removed from favorites', 'success');
        } catch (err) {
            showAlert('Failed to remove favorite', 'error');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showAlert('Image size should be less than 2MB', 'error');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            showAlert('Name cannot be empty', 'warning');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('username', username);
        if (selectedFile) formData.append('profilePic', selectedFile);

        try {
            const res = await axios.put('/api/auth/profile', formData);
            updateUser(res.data.user);
            showAlert('Profile updated successfully!', 'success');
            setSelectedFile(null);
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePic = async () => {
        if (window.confirm('Are you sure?')) {
            try {
                const res = await axios.delete('/api/auth/profile/pic');
                updateUser(res.data.user);
                setPreview(null);
                showAlert('Profile picture removed', 'success');
            } catch (err) {
                showAlert('Failed to remove picture', 'error');
            }
        }
    };

    const TabButton = ({ id, icon: Icon, label }) => (
        <div
            onClick={() => setActiveTab(id)}
            style={{ cursor: 'pointer', marginBottom: '10px' }}
        >
            <motion.div
                whileHover={{ x: 5 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 20px',
                    borderRadius: '15px',
                    background: activeTab === id ? 'var(--primary-color)' : 'white',
                    color: activeTab === id ? 'white' : 'var(--primary-dark)',
                    border: '1px solid #f1f5f9',
                    fontWeight: activeTab === id ? '700' : '500',
                    boxShadow: activeTab === id ? '0 10px 20px rgba(16, 185, 129, 0.2)' : 'none',
                    transition: 'all 0.3s ease'
                }}
            >
                <Icon size={20} style={{ marginRight: '12px' }} />
                <span>{label}</span>
            </motion.div>
        </div>
    );

    return (
        <div className="profile-page" style={{
            padding: '120px 20px 60px',
            minHeight: '100vh',
            background: 'var(--background-color)',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div style={{ width: '100%', maxWidth: '1100px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }} className="profile-grid">

                {/* Sidebar */}
                <aside>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', position: 'sticky', top: '110px' }}
                    >
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '20px' }}>Menu</h3>
                        <TabButton id="profile" icon={HiOutlineUser} label="Edit Profile" />
                        <TabButton id="orders" icon={HiOutlineClipboardDocumentList} label="Order History" />
                        <TabButton id="favorites" icon={HiOutlineHeart} label="Favorite Stores" />
                        <TabButton id="purchases" icon={HiOutlineShoppingBag} label="Bought Products" />
                    </motion.div>
                </aside>

                {/* Content Area */}
                <main>
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}
                            >
                                <h2 style={{ color: 'var(--primary-dark)', marginBottom: '30px', fontSize: '1.8rem', fontWeight: '800' }}>Personal Details</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ width: '140px', height: '140px', borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', background: '#f8fafc' }}>
                                                {preview ? <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <HiOutlineUser size={70} style={{ width: '100%', height: '100%', padding: '30px', color: '#cbd5e1' }} />}
                                            </div>
                                            <button onClick={() => fileInputRef.current.click()} style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'var(--primary-color)', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)' }}><HiOutlineCamera size={18} /></button>
                                            {preview && <button onClick={handleDeletePic} style={{ position: 'absolute', top: '5px', right: '5px', background: '#ef4444', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><HiOutlineTrash size={16} /></button>}
                                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                                        </div>
                                    </div>
                                    <form onSubmit={handleUpdateProfile}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>Full Name</label>
                                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '14px 20px', borderRadius: '15px', border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem' }} />
                                        </div>
                                        <div style={{ marginBottom: '30px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>Email Address</label>
                                            <div style={{ padding: '14px 20px', borderRadius: '15px', background: '#f1f5f9', color: '#94a3b8', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><HiOutlineExclamationCircle size={18} /> {user?.email}</div>
                                        </div>
                                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '18px', fontSize: '1.1rem', fontWeight: '700', background: 'var(--primary-color)', color: 'white', border: 'none', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}>{loading ? 'Saving...' : 'Update Profile'}</button>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'orders' && (
                            <motion.div
                                key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                style={{ background: 'white', padding: '35px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}
                            >
                                <h2 style={{ color: 'var(--primary-dark)', marginBottom: '30px', fontSize: '1.8rem', fontWeight: '800' }}>Order History</h2>
                                {fetchingData ? (
                                    <div style={{ textAlign: 'center', padding: '30px' }}>Loading orders...</div>
                                ) : orders.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                                        <HiOutlineClipboardDocumentList size={60} style={{ marginBottom: '15px', opacity: 0.2 }} />
                                        <p>No orders found yet. Time to shop!</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {orders.map(order => (
                                            <div key={order.id} style={{ padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                    <div>
                                                        <h4 style={{ margin: 0, color: 'var(--primary-dark)', fontWeight: '700' }}>#{order.order_number} • {order.store_name}</h4>
                                                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary-dark)' }}>${parseFloat(order.total_amount).toFixed(2)}</div>
                                                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: order.status === 'pending' ? '#fef3c7' : '#dcfce7', color: order.status === 'pending' ? '#92400e' : '#166534', fontWeight: '700' }}>{order.status.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.85rem', color: '#475569', background: '#f8fafc', padding: '10px 15px', borderRadius: '12px' }}>
                                                    {order.location && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><HiOutlineMapPin size={14} /> {order.location}</div>}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><HiOutlinePhone size={14} /> {order.phone_number}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'favorites' && (
                            <motion.div
                                key="favorites" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                style={{ background: 'white', padding: '35px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}
                            >
                                <h2 style={{ color: 'var(--primary-dark)', marginBottom: '30px', fontSize: '1.8rem', fontWeight: '800' }}>Favorite Stores</h2>
                                {fetchingData ? (
                                    <div style={{ textAlign: 'center', padding: '30px' }}>Loading favorites...</div>
                                ) : favorites.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                                        <HiOutlineHeart size={60} style={{ marginBottom: '15px', opacity: 0.2 }} />
                                        <p>Heart some stores to see them here!</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                        {favorites.map(store => (
                                            <div key={store.id} onClick={() => navigate(`/store/${store.id}`)} style={{ cursor: 'pointer', background: '#f8fafc', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9', position: 'relative' }}>
                                                <div style={{ height: '100px', background: '#e2e8f0', overflow: 'hidden' }}>
                                                    {store.banner && <img src={getImageUrl(store.banner)} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                </div>
                                                <div style={{ padding: '15px', textAlign: 'center' }}>
                                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', margin: '-45px auto 10px', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                                        {store.profile_pic ? <img src={getImageUrl(store.profile_pic)} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontWeight: '800' }}>{store.name[0]}</div>}
                                                    </div>
                                                    <h4 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '0.95rem' }}>{store.name}</h4>
                                                    <button onClick={(e) => { e.stopPropagation(); removeFavorite(store.id); }} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                                                        <FaHeart size={14} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'purchases' && (
                            <motion.div
                                key="purchases" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                style={{ background: 'white', padding: '35px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}
                            >
                                <h2 style={{ color: 'var(--primary-dark)', marginBottom: '30px', fontSize: '1.8rem', fontWeight: '800' }}>Bought Products</h2>
                                {fetchingData ? (
                                    <div style={{ textAlign: 'center', padding: '30px' }}>Loading products...</div>
                                ) : purchasedProducts.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                                        <HiOutlineShoppingBag size={60} style={{ marginBottom: '15px', opacity: 0.2 }} />
                                        <p>You haven't bought any specific items yet.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                                        {purchasedProducts.map(p => (
                                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '15px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                <img src={getImageUrl(p.image)} alt={p.name} style={{ width: '55px', height: '55px', borderRadius: '10px', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://via.placeholder.com/55'} />
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <h5 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h5>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}><HiOutlineBuildingStorefront size={12} /> {p.store_name}</div>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-color)', marginTop: '2px' }}>${parseFloat(p.price).toFixed(2)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            <style>{`
                @media (max-width: 800px) {
                    .profile-grid { grid-template-columns: 1fr !important; }
                    aside { position: static !important; }
                }
            `}</style>
        </div>
    );
};

export default Profile;
