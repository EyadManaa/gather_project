import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ModernFileUpload from '../components/ModernFileUpload';
import { FaGem, FaCheckCircle, FaHistory, FaPaperPlane } from 'react-icons/fa';
import { useUI } from '../context/UIContext';
import LoadingSpinner from '../components/LoadingSpinner';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const AdminDashboard = () => {
    const { showAlert, showConfirm } = useUI();
    const [store, setStore] = useState(null);
    const location = useLocation();
    const [activeSection, setActiveSection] = useState(location.state?.activeSection || 'stats');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.state?.activeSection) {
            setActiveSection(location.state.activeSection);
        }
    }, [location.state]);

    const [productSections, setProductSections] = useState([]);
    const [sectionForm, setSectionForm] = useState({ name: '', parent_id: '' });
    const [builderSelectedParentId, setBuilderSelectedParentId] = useState('');

    const [createForm, setCreateForm] = useState({ name: '', description: '', profile_pic: null, banner: null, category: 'General' });
    const [productForm, setProductForm] = useState({ name: '', description: '', price: '', image: null, section: '' });
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [navItems, setNavItems] = useState([]);
    const [navForm, setNavForm] = useState({ label: '', section_id: '' });
    const [highlightedItemId, setHighlightedItemId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [storeUsers, setStoreUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');
    const [incomeData, setIncomeData] = useState({ daily: [], monthly: [], annual: [] });
    const [timeRange, setTimeRange] = useState('daily');
    const [aboutContent, setAboutContent] = useState('');
    const [isUpdatingAbout, setIsUpdatingAbout] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmValue, setDeleteConfirmValue] = useState('');
    const [storeName, setStoreName] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [socialLinks, setSocialLinks] = useState({ instagram: '', tiktok: '', facebook: '', linkedin: '' });
    const [openingTime, setOpeningTime] = useState('');
    const [closingTime, setClosingTime] = useState('');
    const [category, setCategory] = useState('General');
    const [availableSubs, setAvailableSubs] = useState([]);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedUpgradeTier, setSelectedUpgradeTier] = useState(null);
    const [upgradeMessage, setUpgradeMessage] = useState('');
    const [upgradeRequests, setUpgradeRequests] = useState([]);
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [primaryColor, setPrimaryColor] = useState('#10b981'); // Default Emerald
    const [secondaryColor, setSecondaryColor] = useState('#d1fae5'); // Default Emerald Light
    const profileInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const editFormRef = useRef(null);

    useEffect(() => {
        fetchMyStore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (activeSection === 'subscriptions' && store) {
            fetchSubscriptions();
            fetchMyUpgradeRequests();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSection, store]);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/subscriptions');
            setAvailableSubs(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const fetchMyUpgradeRequests = async () => {
        try {
            const res = await axios.get(`/api/upgrade-requests/store/${store.id}`);
            setUpgradeRequests(res.data);
        } catch (err) { console.error(err); }
    };

    const handleUpgradeSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/upgrade-requests', {
                store_id: store.id,
                current_tier: store.subscription_tier,
                requested_tier: selectedUpgradeTier.name.toLowerCase(),
                message: upgradeMessage
            });
            showAlert('Upgrade request submitted successfully!', 'success');
            setShowUpgradeModal(false);
            setUpgradeMessage('');
            fetchMyUpgradeRequests();
        } catch (err) {
            showAlert(err.response?.data?.message || 'Error submitting request', 'error');
        }
    };

    const fetchMyStore = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/stores/my-store');
            setStore(res.data);
            setAboutContent(res.data.about_content || '');
            setStoreName(res.data.name || '');
            setStoreDescription(res.data.description || '');
            setSocialLinks({
                instagram: res.data.instagram_link || '',
                tiktok: res.data.tiktok_link || '',
                facebook: res.data.facebook_link || '',
                linkedin: res.data.linkedin_link || ''
            });
            setOpeningTime(res.data.opening_time || '');
            setClosingTime(res.data.closing_time || '');
            setCategory(res.data.category || 'General');
            setBackgroundColor(res.data.background_color || '#ffffff');
            setPrimaryColor(res.data.primary_color || '#10b981');
            setSecondaryColor(res.data.secondary_color || '#d1fae5');
            if (res.data) {
                fetchStats(res.data.id);
                fetchOrders(res.data.id);
                fetchNavItems(res.data.id);
                fetchProducts(res.data.id);
                fetchStoreUsers(res.data.id);
                fetchIncomeStats(res.data.id);
                fetchProductSections(res.data.id);
            }
        } catch (err) {
            // No store found
        } finally {
            setLoading(false);
        }
    };

    const fetchNavItems = async (storeId) => {
        try {
            const res = await axios.get(`/api/nav/${storeId}`);
            setNavItems(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchProductSections = async (storeId) => {
        try {
            const res = await axios.get(`/api/sections/${storeId}`);
            setProductSections(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchProducts = async (storeId) => {
        try {
            const res = await axios.get(`/api/products?storeId=${storeId}`);
            setProducts(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchStoreUsers = async (storeId, search = '') => {
        try {
            const res = await axios.get(`/api/stores/${storeId}/users?search=${search}`);
            setStoreUsers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleBanToggle = async (userId, isBanned) => {
        try {
            const endpoint = isBanned ? 'unban' : 'ban';
            await axios.post(`/api/stores/${endpoint}`, { storeId: store.id, userId });
            fetchStoreUsers(store.id, userSearch);
            showAlert(`User ${isBanned ? 'unbanned' : 'banned'} successfully`, 'success');
        } catch (err) { showAlert('Error updating user ban status', 'error'); }
    };

    const handleAddNav = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/nav/${store.id}`, navForm);
            setNavForm({ label: '', section_id: '' });
            fetchNavItems(store.id);
        } catch (err) { showAlert('Error adding nav item', 'error'); }
    };

    const handleDeleteNav = async (id) => {
        showConfirm('Delete this nav item?', async () => {
            try {
                await axios.delete(`/api/nav/${id}`);
                fetchNavItems(store.id);
            } catch (err) { showAlert('Error deleting nav item', 'error'); }
        });
    };

    const handleMoveNav = async (index, direction) => {
        const newItems = [...navItems];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newItems.length) return;

        // Swap order indices in backend
        try {
            const currentItem = newItems[index];
            const targetItem = newItems[targetIndex];

            await Promise.all([
                axios.put(`/api/nav/${currentItem.id}`, { order_index: targetItem.order_index }),
                axios.put(`/api/nav/${targetItem.id}`, { order_index: currentItem.order_index })
            ]);

            setHighlightedItemId(currentItem.id);
            setTimeout(() => setHighlightedItemId(null), 1500);

            fetchNavItems(store.id);
        } catch (err) { showAlert('Error reordering', 'error'); }
    };

    const handleAddSection = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/sections/${store.id}`, sectionForm);
            setSectionForm({ name: '', parent_id: '' });
            fetchProductSections(store.id);
            showAlert('Section added', 'success');
        } catch (err) { showAlert('Error adding section', 'error'); }
    };

    const handleDeleteSection = async (id) => {
        showConfirm('Delete this section? Products in this section will NOT be deleted, but will effectively become "General".', async () => {
            try {
                await axios.delete(`/api/sections/${id}`);
                fetchProductSections(store.id);
            } catch (err) { showAlert('Error deleting section', 'error'); }
        });
    };

    const handleMoveSection = async (index, direction) => {
        const newItems = [...productSections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newItems.length) return;

        try {
            const currentItem = newItems[index];
            const targetItem = newItems[targetIndex];

            await Promise.all([
                axios.put(`/api/sections/${currentItem.id}`, { order_index: targetItem.order_index }),
                axios.put(`/api/sections/${targetItem.id}`, { order_index: currentItem.order_index })
            ]);

            fetchProductSections(store.id);
        } catch (err) { showAlert('Error reordering sections', 'error'); }
    };

    const handleAssignChild = async (childId, parentId) => {
        try {
            const section = productSections.find(s => s.id === childId);
            await axios.put(`/api/sections/${childId}`, {
                ...section,
                parent_id: parentId || null
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchProductSections(store.id);
        } catch (err) {
            showAlert('Error updating assignment', 'error');
        }
    };


    const fetchStats = async (storeId) => {
        try {
            const res = await axios.get(`/api/stores/${storeId}/stats`);
            setStats(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchIncomeStats = async (storeId) => {
        try {
            const res = await axios.get(`/api/stores/${storeId}/income-stats`);
            setIncomeData(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchOrders = async (storeId) => {
        try {
            const res = await axios.get(`/api/orders/store/${storeId}`);
            setOrders(res.data);
        } catch (err) { console.error(err); }
    };

    const handleOrderStatusUpdate = async (orderId, newStatus) => {
        try {
            await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
            fetchOrders(store.id);
        } catch (err) { showAlert('Error updating order status', 'error'); }
    };


    const handleCreateStore = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', createForm.name);
        formData.append('description', createForm.description);
        if (createForm.profile_pic) formData.append('profile_pic', createForm.profile_pic);
        if (createForm.banner) formData.append('banner', createForm.banner);
        formData.append('category', createForm.category);

        try {
            await axios.post('/api/stores', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchMyStore();
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            showAlert('Error creating store: ' + errorMsg, 'error');
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('storeId', store.id);
        formData.append('name', productForm.name);
        formData.append('description', productForm.description);
        formData.append('price', productForm.price);
        formData.append('section', productForm.section || 'General');
        if (productForm.image) formData.append('image', productForm.image);

        try {
            await axios.post('/api/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showAlert('Product added', 'success');
            setProductForm({ name: '', description: '', price: '', image: null, section: '' });
            fetchStats(store.id);
            fetchProducts(store.id);
        } catch (err) { showAlert('Error adding product', 'error'); }
    };

    const handleDeleteProduct = async (id) => {
        showConfirm('Delete this product?', async () => {
            try {
                await axios.delete(`/api/products/${id}`);
                fetchProducts(store.id);
                fetchStats(store.id);
            } catch (err) { showAlert('Error deleting product', 'error'); }
        });
    };

    const handleToggleStock = async (id) => {
        try {
            await axios.patch(`/api/products/${id}/toggle-stock`);
            fetchProducts(store.id);
        } catch (err) { showAlert('Error updating stock status', 'error'); }
    };

    const handleToggleStoreStatus = async () => {
        try {
            await axios.patch(`/api/stores/${store.id}/toggle-status`);
            fetchMyStore();
        } catch (err) { showAlert('Error updating store status', 'error'); }
    };

    const handleUpdateAbout = async () => {
        setIsUpdatingAbout(true);
        try {
            await axios.put(`/api/stores/${store.id}`, {
                name: storeName,
                description: storeDescription,
                about_content: aboutContent,
                instagram_link: socialLinks.instagram,
                tiktok_link: socialLinks.tiktok,
                facebook_link: socialLinks.facebook,
                linkedin_link: socialLinks.linkedin,
                opening_time: openingTime,
                closing_time: closingTime,
                category: category,
                background_color: backgroundColor,
                primary_color: primaryColor,
                secondary_color: secondaryColor
            });
            showAlert('Store settings updated successfully!', 'success');
            fetchMyStore();
        } catch (err) {
            showAlert('Error updating store settings', 'error');
        } finally {
            setIsUpdatingAbout(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        showConfirm('Are you sure you want to delete this order? This action cannot be undone.', async () => {
            try {
                await axios.delete(`/api/orders/${orderId}`);
                fetchOrders(store.id);
            } catch (err) { showAlert('Error deleting order', 'error'); }
        });
    };

    const handleDeleteStore = async () => {
        if (deleteConfirmValue !== store.name) {
            showAlert('Store name does not match. Deletion cancelled.', 'warning');
            return;
        }

        try {
            await axios.delete(`/api/stores/${store.id}`);
            showAlert('Store deleted successfully.', 'success');
            window.location.href = '/';
        } catch (err) {
            showAlert('Error deleting store: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setShowDeleteModal(false);
            setDeleteConfirmValue('');
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', editingProduct.name);
        formData.append('description', editingProduct.description);
        formData.append('price', editingProduct.price);
        formData.append('section', editingProduct.section || 'General');
        if (editingProduct.newImage) formData.append('image', editingProduct.newImage);

        try {
            await axios.put(`/api/products/${editingProduct.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showAlert('Product updated', 'success');
            setEditingProduct(null);
            fetchProducts(store.id);
        } catch (err) { showAlert('Error updating product', 'error'); }
    };


    if (!loading && !store) {
        return (
            <div style={{ position: 'relative', minHeight: '100vh', padding: '100px 20px 40px' }}>
                <Link
                    to="/"
                    className="dashboard-back-btn"
                    title="Back to Home"
                    style={{ position: 'absolute', top: '30px', left: '30px', marginBottom: 0 }}
                >
                    ← Back to Home
                </Link>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ color: 'var(--primary-dark)', marginBottom: '25px', textAlign: 'center' }}>Setup Your Store</h2>
                    <form onSubmit={handleCreateStore} className="card">
                        <div style={{ marginBottom: '15px' }}>
                            <label>Store Name</label>
                            <input placeholder="E.g., Green Valley Organic" onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="form-control" required />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Description</label>
                            <textarea placeholder="Tell us about your store..." onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="form-control" />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Store Category</label>
                            <select
                                className="form-control"
                                value={createForm.category}
                                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                                required
                            >
                                <option value="General">General</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Food">Food</option>
                                <option value="Clothes">Clothes</option>
                                <option value="Beauty">Beauty</option>
                                <option value="Home">Home</option>
                                <option value="Sports">Sports</option>
                                <option value="Books">Books</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <ModernFileUpload
                                label="Choose Store Profile Picture"
                                onChange={(e) => setCreateForm({ ...createForm, profile_pic: e.target.files[0] })}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <ModernFileUpload
                                label="Choose Store Banner Image"
                                onChange={(e) => setCreateForm({ ...createForm, banner: e.target.files[0] })}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Store</button>
                    </form>
                </div>
            </div>
        );
    }

    // Add default background color handling for create store if needed, mostly handled by backend default.


    return (
        <div style={{ position: 'relative' }}>
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

            <div className="admin-content" style={{ marginLeft: '250px', padding: '30px' }}>
                {loading ? (
                    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LoadingSpinner message="Loading Dashboard..." />
                    </div>
                ) : (
                    <>
                        {/* Simple Back Button */}
                        {/* pill-style Back Button */}
                        <Link to="/stores" className="dashboard-back-btn" title="Back to Stores">
                            ← Back to Stores
                        </Link>

                        {/* Stats Section */}
                        {activeSection === 'stats' && (
                            <div className="stats-container">
                                <h1 className="responsive-title" style={{ color: 'var(--primary-dark)', marginBottom: '30px' }}>Dashboard: {store?.name}</h1>

                                {stats && (
                                    <div className="grid admin-stats-grid">
                                        <div className="card" style={{ textAlign: 'center' }}>
                                            <h3 style={{ margin: 0 }}>Total Income</h3>
                                            <p style={{ fontSize: '2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>${stats.income}</p>
                                        </div>
                                        <div className="card" style={{ textAlign: 'center' }}>
                                            <h3 style={{ margin: 0 }}>Products</h3>
                                            <p style={{ fontSize: '2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{stats.productCount}</p>
                                        </div>
                                        <div className="card" style={{ textAlign: 'center' }}>
                                            <h3 style={{ margin: 0 }}>Visitors</h3>
                                            <p style={{ fontSize: '2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{stats.visitors}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="card" style={{ marginTop: '30px', minHeight: '400px', backgroundColor: 'white' }}>
                                    <div className="admin-chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>Income Analysis</h3>
                                        <div className="admin-chart-filters" style={{ display: 'flex', gap: '10px' }}>
                                            {['daily', 'monthly', 'annual'].map(range => (
                                                <button
                                                    key={range}
                                                    onClick={() => setTimeRange(range)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '20px',
                                                        border: '1px solid var(--primary-color)',
                                                        backgroundColor: timeRange === range ? 'var(--primary-color)' : 'transparent',
                                                        color: timeRange === range ? 'white' : 'var(--primary-color)',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold',
                                                        textTransform: 'capitalize',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    {range}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ width: '100%', height: '300px', marginTop: '20px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={incomeData[timeRange] || []}>
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                                <XAxis
                                                    dataKey="label"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: '#666' }}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: '#666' }}
                                                    tickFormatter={(val) => `$${val}`}
                                                />
                                                <Tooltip
                                                    formatter={(value) => [`$${value}`, 'Income']}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="var(--primary-color)"
                                                    fillOpacity={1}
                                                    fill="url(#colorValue)"
                                                    strokeWidth={4}
                                                    animationDuration={1500}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div style={{ marginTop: '25px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-around', border: '1px solid #e2e8f0' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Performance Trend</p>
                                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                                {(() => {
                                                    const data = incomeData[timeRange];
                                                    if (!data || data.length < 2) return 'Stable ➡️';
                                                    const lastVal = parseFloat(data[data.length - 1]?.value || 0);
                                                    const prevVal = parseFloat(data[data.length - 2]?.value || 0);
                                                    if (lastVal > prevVal) return 'Gaining 📈';
                                                    if (lastVal < prevVal) return 'Declining 📉';
                                                    return 'Stable ➡️';
                                                })()}
                                            </p>
                                        </div>
                                        <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg. {timeRange === 'daily' ? 'Daily' : timeRange === 'monthly' ? 'Monthly' : 'Annual'} Income</p>
                                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                                                ${((incomeData[timeRange]?.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0) || 0) / (incomeData[timeRange]?.length || 1)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}



                        {/* Store Settings Section */}
                        {activeSection === 'settings' && (
                            <div>
                                <h1 style={{ color: 'var(--primary-dark)', marginBottom: '30px' }}>Store Settings</h1>

                                <div className="card" style={{ marginBottom: '30px', border: `2px solid ${store.is_open ? 'var(--primary-color)' : '#dc2626'}` }}>
                                    <div className="admin-status-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                                        <div>
                                            <h3 style={{ margin: 0 }}>Store Status</h3>
                                            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                                                {store.is_open ? (
                                                    store.is_open_effective ? 'Your store is currently OPEN and accepting orders.' : 'Manual toggle is ON, but Scheduled Hours indicate CLOSED.'
                                                ) : 'Your store is currently CLOSED. Shoppers cannot place orders.'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleToggleStoreStatus}
                                            className={`btn ${store.is_open ? 'btn-danger' : 'btn-primary'}`}
                                            style={{ padding: '12px 24px', borderRadius: '30px', minWidth: '160px' }}
                                        >
                                            {store.is_open ? 'Close Store' : 'Open Store'}
                                        </button>
                                    </div>
                                </div>

                                <div className="card" style={{ marginBottom: '30px', borderLeft: '5px solid var(--primary-color)' }}>
                                    <h3 style={{ marginBottom: '15px' }}>Automated Store Hours</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                                        Define your daily operational window. The store will automatically close for shoppers outside these hours.
                                        Leave blank for 24/7 manual control.
                                    </p>
                                    <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
                                                🕒 Opening Time
                                            </label>
                                            <input
                                                type="time"
                                                value={openingTime}
                                                onChange={(e) => setOpeningTime(e.target.value)}
                                                className="form-control"
                                                style={{ border: '1px solid var(--secondary-color)' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
                                                🌙 Closing Time
                                            </label>
                                            <input
                                                type="time"
                                                value={closingTime}
                                                onChange={(e) => setClosingTime(e.target.value)}
                                                className="form-control"
                                                style={{ border: '1px solid var(--secondary-color)' }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleUpdateAbout}
                                        disabled={isUpdatingAbout}
                                        className="btn btn-primary"
                                        style={{ padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem' }}
                                    >
                                        {isUpdatingAbout ? 'Saving Hours...' : 'Save Schedule'}
                                    </button>
                                </div>

                                <div className="card" style={{ marginBottom: '30px' }}>
                                    <h3 style={{ marginBottom: '20px' }}>Store Identity</h3>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Store Name</label>
                                        <input
                                            type="text"
                                            value={storeName}
                                            onChange={(e) => setStoreName(e.target.value)}
                                            className="form-control"
                                            placeholder="E.g., Green Valley Organic"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tagline / Short Description</label>
                                        <input
                                            type="text"
                                            value={storeDescription}
                                            onChange={(e) => setStoreDescription(e.target.value)}
                                            className="form-control"
                                            placeholder="E.g., Fresh from the farm to your door"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Store Category</label>
                                        <select
                                            className="form-control"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            required
                                        >
                                            <option value="General">General</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Food">Food</option>
                                            <option value="Clothes">Clothes</option>
                                            <option value="Beauty">Beauty</option>
                                            <option value="Home">Home</option>
                                            <option value="Sports">Sports</option>
                                            <option value="Books">Books</option>
                                            <option value="Other">Other</option>
                                        </select>

                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Store Theme</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px', display: 'block' }}>Background</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input
                                                        type="color"
                                                        value={backgroundColor}
                                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                                        style={{ width: '50px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0, background: 'none' }}
                                                    />
                                                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{backgroundColor}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px', display: 'block' }}>Primary Brand</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input
                                                        type="color"
                                                        value={primaryColor}
                                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                                        style={{ width: '50px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0, background: 'none' }}
                                                    />
                                                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{primaryColor}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px', display: 'block' }}>Secondary/Accent</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input
                                                        type="color"
                                                        value={secondaryColor}
                                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                                        style={{ width: '50px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0, background: 'none' }}
                                                    />
                                                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{secondaryColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '25px', marginBottom: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                                        <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#555' }}>Social Media Links</h4>
                                        <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Instagram</label>
                                                <input
                                                    type="url"
                                                    value={socialLinks.instagram}
                                                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                                    className="form-control"
                                                    placeholder="https://instagram.com/yourstore"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>TikTok</label>
                                                <input
                                                    type="url"
                                                    value={socialLinks.tiktok}
                                                    onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                                                    className="form-control"
                                                    placeholder="https://tiktok.com/@yourstore"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>Facebook</label>
                                                <input
                                                    type="url"
                                                    value={socialLinks.facebook}
                                                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                                                    className="form-control"
                                                    placeholder="https://facebook.com/yourstore"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 'bold' }}>LinkedIn</label>
                                                <input
                                                    type="url"
                                                    value={socialLinks.linkedin}
                                                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                                                    className="form-control"
                                                    placeholder="https://linkedin.com/in/yourstore"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpdateAbout}
                                        disabled={isUpdatingAbout}
                                        className="btn btn-primary"
                                        style={{ padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold' }}
                                    >
                                        {isUpdatingAbout ? 'Saving...' : 'Update Identity'}
                                    </button>
                                </div>


                                <div className="card">
                                    <h3 style={{ marginBottom: '20px' }}>Store Images</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        {/* Profile Picture */}
                                        <div>
                                            <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>Profile Picture</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '150px' }}>
                                                <div
                                                    className="image-upload-container"
                                                    onClick={() => profileInputRef.current.click()}
                                                    style={{ width: '150px', height: '150px', borderRadius: '50%', border: '3px solid var(--secondary-color)' }}
                                                >
                                                    {store.profile_pic ? (
                                                        <img src={getImageUrl(store.profile_pic)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                            No Image
                                                        </div>
                                                    )}
                                                    <div className="image-upload-overlay">
                                                        <span className="edit-text">Edit</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        showConfirm('Delete profile picture?', async () => {
                                                            const formData = new FormData();
                                                            formData.append('name', store.name);
                                                            formData.append('description', store.description);
                                                            await axios.put(`/api/stores/${store.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                            fetchMyStore();
                                                        });
                                                    }}
                                                    className="btn btn-danger btn-animated-danger"
                                                    style={{ marginTop: '15px', fontSize: '0.85rem', padding: '8px 24px', borderRadius: '20px' }}
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <input
                                                ref={profileInputRef}
                                                type="file"
                                                onChange={async (e) => {
                                                    if (e.target.files[0]) {
                                                        const formData = new FormData();
                                                        formData.append('name', store.name);
                                                        formData.append('description', store.description);
                                                        formData.append('profile_pic', e.target.files[0]);
                                                        await axios.put(`/api/stores/${store.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                        fetchMyStore();
                                                    }
                                                }}
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                            />
                                        </div>

                                        {/* Banner */}
                                        <div>
                                            <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>Banner Image</h4>
                                            <div
                                                className="image-upload-container"
                                                onClick={() => bannerInputRef.current.click()}
                                                style={{ width: '100%', height: '150px', borderRadius: '12px' }}
                                            >
                                                {store.banner ? (
                                                    <img src={getImageUrl(store.banner)} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                        No Banner Uploaded
                                                    </div>
                                                )}
                                                <div className="image-upload-overlay">
                                                    <span className="edit-text">Edit Banner</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    showConfirm('Delete banner?', async () => {
                                                        const formData = new FormData();
                                                        formData.append('name', store.name);
                                                        formData.append('description', store.description);
                                                        await axios.put(`/api/stores/${store.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                        fetchMyStore();
                                                    });
                                                }}
                                                className="btn btn-danger btn-animated-danger"
                                                style={{ marginTop: '15px', fontSize: '0.85rem', padding: '8px 24px', borderRadius: '20px' }}
                                            >
                                                Remove
                                            </button>

                                            <input
                                                ref={bannerInputRef}
                                                type="file"
                                                onChange={async (e) => {
                                                    if (e.target.files[0]) {
                                                        const formData = new FormData();
                                                        formData.append('name', store.name);
                                                        formData.append('description', store.description);
                                                        formData.append('banner', e.target.files[0]);
                                                        await axios.put(`/api/stores/${store.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                        fetchMyStore();
                                                    }
                                                }}
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>

                                    {/* About Store Section */}
                                    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                                        <h3 style={{ marginBottom: '15px' }}>About Your Store</h3>
                                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
                                            Tell your customers more about your store, your history, or your mission. This will appear on your store page.
                                        </p>
                                        <textarea
                                            value={aboutContent}
                                            onChange={(e) => setAboutContent(e.target.value)}
                                            placeholder="Write something about your store..."
                                            className="form-control"
                                            style={{
                                                minHeight: '200px',
                                                borderRadius: '12px',
                                                padding: '15px',
                                                fontSize: '1rem',
                                                lineHeight: '1.6',
                                                border: '1px solid #ddd',
                                                marginBottom: '15px'
                                            }}
                                        />
                                        <button
                                            onClick={handleUpdateAbout}
                                            disabled={isUpdatingAbout}
                                            className="btn btn-primary"
                                            style={{ padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold' }}
                                        >
                                            {isUpdatingAbout ? 'Saving...' : 'Save About Section'}
                                        </button>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div style={{ marginTop: '40px', borderTop: '2px solid #fee2e2', paddingTop: '30px' }}>
                                    <h3 style={{ color: '#dc2626', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>⚠️</span> Danger Zone
                                    </h3>
                                    <div className="admin-danger-zone-card" style={{
                                        backgroundColor: '#fff1f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '20px'
                                    }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0', color: '#991b1b' }}>Delete this store</h4>
                                            <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.9rem' }}>
                                                Once you delete a store, there is no going back. Please be certain.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="btn btn-danger btn-animated-danger"
                                            style={{
                                                padding: '12px 24px',
                                                fontWeight: 'bold',
                                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Delete Entire Store
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Custom Delete Store Modal */}
                        {showDeleteModal && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                                backdropFilter: 'blur(5px)'
                            }}>
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '40px',
                                    borderRadius: '25px',
                                    maxWidth: '500px',
                                    width: '90%',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                    textAlign: 'center',
                                    animation: 'modalSlideIn 0.3s ease'
                                }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
                                    <h2 style={{ color: '#dc2626', marginBottom: '15px' }}>Critical Action Required</h2>
                                    <p style={{ color: '#444', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '25px' }}>
                                        Are you absolutely sure? This will <strong>permanently remove</strong> all products, orders, and settings for <strong>{store.name}</strong>.
                                    </p>

                                    <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#666' }}>
                                            Type your store name to confirm:
                                        </label>
                                        <input
                                            type="text"
                                            value={deleteConfirmValue}
                                            onChange={(e) => setDeleteConfirmValue(e.target.value)}
                                            placeholder={store.name}
                                            className="form-control"
                                            style={{
                                                borderRadius: '12px',
                                                padding: '12px',
                                                border: deleteConfirmValue === store.name ? '2px solid #10b981' : '1px solid #ddd'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button
                                            onClick={() => {
                                                setShowDeleteModal(false);
                                                setDeleteConfirmValue('');
                                            }}
                                            className="btn btn-secondary"
                                            style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 'bold' }}
                                        >
                                            No, Keep It
                                        </button>
                                        <button
                                            onClick={handleDeleteStore}
                                            disabled={deleteConfirmValue !== store.name}
                                            className="btn btn-danger btn-animated-danger"
                                            style={{
                                                flex: 2,
                                                padding: '12px',
                                                borderRadius: '12px',
                                                fontWeight: 'bold',
                                                opacity: deleteConfirmValue === store.name ? 1 : 0.5,
                                                cursor: deleteConfirmValue === store.name ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            Permanently Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products Section */}
                        {activeSection === 'products' && (
                            <div>
                                <h1 style={{ color: 'var(--primary-dark)', marginBottom: '30px' }}>Products Management</h1>

                                {/* Product Sections Management integrated here */}
                                {store && (
                                    <div className="card" style={{ maxWidth: '1300px', marginBottom: '40px', backgroundColor: '#fdfdfd', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <div>
                                                <h3 style={{ margin: 0 }}>Manage Categories</h3>
                                                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
                                                    Create and organize categories for your products.
                                                </p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleAddSection} className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', marginBottom: '25px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                placeholder="Section Name (e.g., 'Appetizers')"
                                                className="form-control"
                                                style={{ marginBottom: 0, height: '45px', borderRadius: '12px' }}
                                                value={sectionForm.name}
                                                onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })}
                                                required
                                            />
                                            <select
                                                className="form-control"
                                                style={{ marginBottom: 0, height: '45px', borderRadius: '12px' }}
                                                value={sectionForm.parent_id || ''}
                                                onChange={e => setSectionForm({ ...sectionForm, parent_id: e.target.value || null })}
                                            >
                                                <option value="">None (Top Level Category)</option>
                                                {productSections.filter(s => !s.parent_id).map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} (Child Category)</option>
                                                ))}
                                            </select>
                                            <button type="submit" className="btn btn-primary" style={{ width: '140px', height: '45px', padding: 0 }}>Add Section</button>
                                        </form>

                                        {/* Mega Menu Builder */}
                                        <div style={{ marginBottom: '30px', padding: '20px', background: '#eff6ff', borderRadius: '16px', border: '1px solid #dbeafe' }}>
                                            <h4 style={{ color: '#1e40af', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '1.2rem' }}>📂</span> Mega Menu Builder
                                            </h4>
                                            <p style={{ fontSize: '0.85rem', color: '#1e3a8a', marginBottom: '20px' }}>
                                                Pick a <strong>Main Category</strong> and select which items go inside it.
                                            </p>

                                            <div style={{ marginBottom: '15px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#1e40af' }}>Select Main Category:</label>
                                                <select
                                                    className="form-control"
                                                    style={{ maxWidth: '400px', borderRadius: '10px' }}
                                                    value={builderSelectedParentId}
                                                    onChange={e => setBuilderSelectedParentId(e.target.value)}
                                                >
                                                    <option value="">-- Choose a Parent --</option>
                                                    {productSections.filter(s => !s.parent_id).map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {builderSelectedParentId && (
                                                <div style={{ background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>Assign sections to "{productSections.find(s => s.id === parseInt(builderSelectedParentId))?.name}":</label>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                                        {productSections
                                                            .filter(s => s.id !== parseInt(builderSelectedParentId))
                                                            .map(section => {
                                                                const isChild = section.parent_id === parseInt(builderSelectedParentId);
                                                                const hasOtherParent = section.parent_id && section.parent_id !== parseInt(builderSelectedParentId);

                                                                return (
                                                                    <div key={section.id} style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '10px',
                                                                        padding: '8px 12px',
                                                                        borderRadius: '8px',
                                                                        background: isChild ? '#dcfce7' : '#f8fafc',
                                                                        border: isChild ? '1px solid #86efac' : '1px solid #e2e8f0',
                                                                        transition: 'all 0.2s'
                                                                    }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChild}
                                                                            disabled={hasOtherParent}
                                                                            onChange={(e) => handleAssignChild(section.id, e.target.checked ? parseInt(builderSelectedParentId) : null)}
                                                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                                        />
                                                                        <span style={{ fontSize: '0.9rem', color: hasOtherParent ? '#94a3b8' : '#334155' }}>
                                                                            {section.name}
                                                                            {hasOtherParent && <span style={{ fontSize: '0.7rem', display: 'block' }}>(In: {productSections.find(p => p.id === section.parent_id)?.name})</span>}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                            <h4 style={{ marginBottom: '12px', fontSize: '0.95rem', color: '#475569' }}>Current Sections</h4>
                                            {productSections.length === 0 && <p style={{ color: '#999', fontSize: '0.9rem' }}>No sections added yet.</p>}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {productSections.map((item, index) => (
                                                    <div key={item.id} className="admin-product-item" style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '10px 15px',
                                                        background: 'white',
                                                        borderRadius: '10px',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                        border: '1px solid #edf2f7',
                                                        transition: 'all 0.3s ease',
                                                        gap: '15px'
                                                    }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <div style={{ fontWeight: '600', color: 'var(--primary-dark)', fontSize: '0.95rem' }}>{item.name}</div>
                                                            {item.parent_id && (
                                                                <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', display: 'inline-block', width: 'fit-content' }}>
                                                                    Inside: {productSections.find(s => s.id === item.parent_id)?.name || 'Unknown'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button
                                                                onClick={() => handleMoveSection(index, 'up')}
                                                                disabled={index === 0}
                                                                className="btn btn-secondary"
                                                                style={{ padding: '2px 8px', fontSize: '0.75rem', opacity: index === 0 ? 0.3 : 1 }}
                                                            >
                                                                ↑
                                                            </button>
                                                            <button
                                                                onClick={() => handleMoveSection(index, 'down')}
                                                                disabled={index === productSections.length - 1}
                                                                className="btn btn-secondary"
                                                                style={{ padding: '2px 8px', fontSize: '0.75rem', opacity: index === productSections.length - 1 ? 0.3 : 1 }}
                                                            >
                                                                ↓
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSection(item.id)}
                                                                className="btn btn-danger"
                                                                style={{ padding: '2px 10px', fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626' }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Edit Form */}
                                {editingProduct ? (
                                    <div ref={editFormRef} className="card" style={{ maxWidth: '1300px', marginBottom: '30px', border: '2px solid var(--primary-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <h3>Edit Product: {editingProduct.name}</h3>
                                            <button onClick={() => setEditingProduct(null)} className="btn btn-secondary" style={{ padding: '5px 15px' }}>Cancel</button>
                                        </div>
                                        <form onSubmit={handleUpdateProduct}>
                                            <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <input placeholder="Product Name" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="form-control" required />
                                                <input type="number" placeholder="Price" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} className="form-control" required />
                                            </div>
                                            <div style={{ marginTop: '15px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Product Section</label>
                                                <select
                                                    className="form-control"
                                                    value={editingProduct.section}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, section: e.target.value })}
                                                >
                                                    <option value="General">General</option>
                                                    {productSections.map(s => (
                                                        <option key={s.id} value={s.name}>{s.name}</option>
                                                    ))}
                                                    {editingProduct.section && editingProduct.section !== 'General' && !productSections.find(s => s.name === editingProduct.section) && (
                                                        <option value={editingProduct.section}>{editingProduct.section} (Legacy)</option>
                                                    )}
                                                </select>
                                            </div>
                                            <textarea placeholder="Description" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="form-control" style={{ marginTop: '15px' }} />
                                            <div style={{ marginTop: '20px' }}>
                                                <ModernFileUpload
                                                    label="Replace Product Image (Optional)"
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, newImage: e.target.files[0] })}
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Update Product</button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="card" style={{ maxWidth: '1300px', marginBottom: '30px' }}>
                                        <h3>Add New Product</h3>
                                        <form onSubmit={handleAddProduct}>
                                            <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <input placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="form-control" required />
                                                <input type="number" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="form-control" required />
                                            </div>
                                            <div style={{ marginTop: '15px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Product Section</label>
                                                <select
                                                    className="form-control"
                                                    value={productForm.section}
                                                    onChange={(e) => setProductForm({ ...productForm, section: e.target.value })}
                                                >
                                                    <option value="General">General</option>
                                                    {productSections.map(s => (
                                                        <option key={s.id} value={s.name}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="form-control" style={{ marginTop: '15px' }} />
                                            <div style={{ marginTop: '20px' }}>
                                                <ModernFileUpload
                                                    label="Select Product Image"
                                                    onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })}
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Add Product</button>
                                        </form>
                                    </div>
                                )}

                                {/* Products List */}
                                <div className="card" style={{ maxWidth: '1300px' }}>
                                    <h3 style={{ marginBottom: '20px' }}>Your Products</h3>
                                    {products.length === 0 ? (
                                        <p style={{ color: '#999' }}>No products added yet.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            {products.map(p => (
                                                <div key={p.id} className="admin-product-item" style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '15px',
                                                    border: '1px solid #eee',
                                                    borderRadius: '12px',
                                                    background: '#fafafa',
                                                    gap: '15px'
                                                }}>
                                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                        {p.image && <img src={getImageUrl(p.image)} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />}
                                                        <div>
                                                            <h4 style={{ margin: 0 }}>{p.name}</h4>
                                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                                                                ${parseFloat(p.price).toFixed(2)} • Section: {p.section}
                                                            </p>
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                padding: '2px 8px',
                                                                borderRadius: '10px',
                                                                background: p.is_out_of_stock ? '#fee2e2' : '#dcfce7',
                                                                color: p.is_out_of_stock ? '#dc2626' : '#166534',
                                                                fontWeight: 'bold',
                                                                display: 'inline-block',
                                                                marginTop: '5px'
                                                            }}>
                                                                {p.is_out_of_stock ? 'Out of Stock' : 'In Stock'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="admin-product-actions" style={{ display: 'flex', gap: '10px' }}>
                                                        <button
                                                            onClick={() => handleToggleStock(p.id)}
                                                            className={`btn ${p.is_out_of_stock ? 'btn-primary' : 'btn-secondary'}`}
                                                            style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                                                        >
                                                            {p.is_out_of_stock ? 'Set In Stock' : 'Set Out of Stock'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingProduct(p);
                                                                setTimeout(() => {
                                                                    editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                }, 100);
                                                            }}
                                                            className="btn btn-primary"
                                                            style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-danger" style={{ padding: '5px 15px', fontSize: '0.85rem' }}>Delete</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Orders Section */}
                        {activeSection === 'orders' && (
                            <div>
                                <h1 style={{ color: 'var(--primary-dark)', marginBottom: '30px' }}>Orders</h1>

                                {/* Order Search Bar */}
                                <div className="card" style={{ marginBottom: '25px', padding: '15px' }}>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            placeholder="Search by Order # (e.g., 42)"
                                            className="form-control"
                                            style={{ marginBottom: 0, paddingLeft: '45px', borderRadius: '15px' }}
                                            value={orderSearch}
                                            onChange={(e) => setOrderSearch(e.target.value)}
                                        />
                                        <div style={{ position: 'absolute', left: '15px', color: '#94a3b8' }}>
                                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                                        <p style={{ fontSize: '1.1rem', color: '#666' }}>No orders yet.</p>
                                    </div>
                                ) : (
                                    <div>
                                        {orders.filter(o => String(o.order_number || '').includes(orderSearch)).length === 0 ? (
                                            <div className="card" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                                No orders found matching "#{orderSearch}"
                                            </div>
                                        ) : (
                                            orders.filter(o => String(o.order_number || '').includes(orderSearch)).map(order => (
                                                <div key={order.id} className="card admin-order-card" style={{ marginBottom: '15px' }}>
                                                    <div className="admin-order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <h4 style={{ margin: '0 0 5px 0' }}>Order #{order.order_number}</h4>
                                                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>
                                                                Customer: <strong>{order.username}</strong> ({order.email}) • <strong>{order.phone_number}</strong>
                                                            </p>
                                                            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>
                                                                {new Date(order.created_at).toLocaleDateString()} • {order.delivery_option === 'delivery' ? 'Delivery (+$5)' : 'Pickup'}
                                                            </p>
                                                            {order.order_notes && (
                                                                <div style={{ backgroundColor: '#fff9c4', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#5d4037', borderLeft: '4px solid #fbc02d', marginBottom: '10px' }}>
                                                                    <strong>Note:</strong> {order.order_notes}
                                                                </div>
                                                            )}
                                                            {order.location && (
                                                                <div style={{ backgroundColor: '#e1f5fe', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#01579b', borderLeft: '4px solid #03a9f4', marginBottom: '10px' }}>
                                                                    <strong>Delivery Location:</strong> {order.location}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="admin-order-totals" style={{ textAlign: 'right' }}>
                                                            <p style={{ margin: '0 0 5px 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                                                ${parseFloat(order.total_amount).toFixed(2)}
                                                            </p>
                                                            <div className="admin-order-status-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
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
                                                                {order.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => handleOrderStatusUpdate(order.id, 'finished')}
                                                                        className="btn btn-primary"
                                                                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                                    >
                                                                        Mark as Finished
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteOrder(order.id)}
                                                                    className="btn btn-danger"
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        fontSize: '0.8rem',
                                                                        backgroundColor: '#fee2e2',
                                                                        color: '#dc2626',
                                                                        border: '1px solid #fecaca'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#dc2626';
                                                                        e.currentTarget.style.color = 'white';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#fee2e2';
                                                                        e.currentTarget.style.color = '#dc2626';
                                                                    }}
                                                                >
                                                                    Delete Order
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}


                        {activeSection === 'navigation' && store && (
                            <div>
                                <h1 style={{ color: 'var(--primary-dark)', marginBottom: '30px' }}>Store Navigation</h1>
                                <div className="card">
                                    <h3 style={{ marginBottom: '20px' }}>Custom Navigation Bar</h3>
                                    <p style={{ color: '#666', marginBottom: '20px' }}>
                                        Add sections to your store's horizontal navbar. Customers can click these to jump to specific parts of your page.
                                    </p>

                                    <div className="admin-nav-quick-add" style={{
                                        marginBottom: '25px',
                                        padding: '15px',
                                        backgroundColor: '#f0f9ff',
                                        borderRadius: '12px',
                                        border: '1px solid #bae6fd',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '15px'
                                    }}>
                                        <span style={{ fontWeight: 'bold', color: '#0369a1', fontSize: '0.9rem' }}>Quick Add:</span>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => setNavForm({ label: 'About Us', section_id: 'about' })}
                                                className="btn btn-secondary"
                                                style={{ padding: '5px 15px', fontSize: '0.85rem', backgroundColor: 'white', border: '1px solid #cbd5e1' }}
                                            >
                                                About Us
                                            </button>
                                            <button
                                                onClick={() => setNavForm({ label: 'Reviews', section_id: 'reviews' })}
                                                className="btn btn-secondary"
                                                style={{ padding: '5px 15px', fontSize: '0.85rem', backgroundColor: 'white', border: '1px solid #cbd5e1' }}
                                            >
                                                Reviews
                                            </button>
                                        </div>
                                        <span style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                            (Click to fill)
                                        </span>
                                    </div>

                                    <form onSubmit={handleAddNav} className="admin-form-grid" style={{ display: 'flex', gap: '12px', marginBottom: '30px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            placeholder="Link Label (e.g., 'Reviews')"
                                            className="form-control"
                                            style={{ flex: 1, marginBottom: 0, height: '45px', borderRadius: '12px' }}
                                            value={navForm.label}
                                            onChange={e => setNavForm({ ...navForm, label: e.target.value })}
                                            required
                                        />
                                        <div style={{ flex: 1.5 }}>
                                            <select
                                                className="form-control"
                                                style={{ marginBottom: 0, height: '45px', borderRadius: '12px', width: '100%' }}
                                                value={navForm.section_id}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    const newState = { ...navForm, section_id: val };
                                                    // Auto-fill label if empty
                                                    if (!navForm.label || navForm.label === '') {
                                                        const found = productSections.find(ps => ps.name.toLowerCase().replace(/\s+/g, '-') === val);
                                                        if (found) newState.label = found.name;
                                                        else if (val === 'about') newState.label = 'About Us';
                                                        else if (val === 'reviews') newState.label = 'Reviews';
                                                    }
                                                    setNavForm(newState);
                                                }}
                                                required
                                            >
                                                <option value="">Select Section to Link to...</option>
                                                <optgroup label="Standard Sections">
                                                    <option value="about">About Us (#about)</option>
                                                    <option value="reviews">Reviews (#reviews)</option>
                                                </optgroup>
                                                <optgroup label="Product Sections">
                                                    {productSections.map(s => (
                                                        <option key={s.id} value={s.name.toLowerCase().replace(/\s+/g, '-')}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{ width: '120px', height: '45px', padding: 0, flexShrink: 0 }}>Add Item</button>
                                    </form>

                                    <div className="card" style={{ backgroundColor: '#f9f9f9', padding: '20px' }}>
                                        <h4 style={{ marginBottom: '15px' }}>Current Menu Items</h4>
                                        {navItems.length === 0 && <p style={{ color: '#999' }}>No navigation items added yet.</p>}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {navItems.map((item, index) => (
                                                <div key={item.id} className="admin-product-item" style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '12px 20px',
                                                    background: highlightedItemId === item.id ? '#e8f5e9' : 'white',
                                                    borderRadius: '12px',
                                                    boxShadow: highlightedItemId === item.id ? '0 4px 12px rgba(46, 125, 50, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                                                    border: highlightedItemId === item.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'default',
                                                    gap: '15px'
                                                }}
                                                    onMouseEnter={(e) => {
                                                        if (highlightedItemId !== item.id) {
                                                            e.currentTarget.style.backgroundColor = '#f1f8e9';
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (highlightedItemId !== item.id) {
                                                            e.currentTarget.style.backgroundColor = 'white';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                                        }
                                                    }}
                                                >
                                                    <div>
                                                        <strong style={{ color: 'var(--primary-dark)' }}>{item.label}</strong>
                                                        <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.9rem' }}>(Anchor: #{item.section_id})</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handleMoveNav(index, 'up')}
                                                            disabled={index === 0}
                                                            className="btn btn-secondary"
                                                            style={{ padding: '4px 8px', fontSize: '0.8rem', opacity: index === 0 ? 0.5 : 1 }}
                                                        >
                                                            ↑
                                                        </button>
                                                        <button
                                                            onClick={() => handleMoveNav(index, 'down')}
                                                            disabled={index === navItems.length - 1}
                                                            className="btn btn-secondary"
                                                            style={{ padding: '4px 8px', fontSize: '0.8rem', opacity: index === navItems.length - 1 ? 0.5 : 1 }}
                                                        >
                                                            ↓
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteNav(item.id)}
                                                            className="btn btn-danger"
                                                            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {activeSection === 'subscriptions' && (
                            <div>
                                <h1 style={{ color: 'var(--primary-dark)', marginBottom: '30px' }}>Subscription Plans</h1>

                                <div className="card" style={{ marginBottom: '30px', borderLeft: '5px solid var(--primary-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ margin: 0 }}>Current Package: <span style={{ color: 'var(--primary-color)', textTransform: 'capitalize' }}>{store.subscription_tier}</span></h3>
                                            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Manage your plan and features.</p>
                                        </div>
                                        <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>
                                            <FaGem />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                                    {availableSubs.map(sub => (
                                        <div key={sub.id} className="card" style={{
                                            textAlign: 'center',
                                            padding: '30px',
                                            border: sub.name.toLowerCase() === store.subscription_tier ? '2px solid var(--primary-color)' : '1px solid #eee',
                                            position: 'relative'
                                        }}>
                                            {sub.name.toLowerCase() === store.subscription_tier && (
                                                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: 'white', padding: '2px 15px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    ACTIVE PLAN
                                                </div>
                                            )}
                                            <h3 style={{ color: 'var(--primary-dark)' }}>{sub.name}</h3>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '15px 0' }}>
                                                ${parseFloat(sub.price).toFixed(2)}<span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#666' }}>/mo</span>
                                            </div>
                                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px', textAlign: 'left' }}>
                                                {(Array.isArray(sub.features) ? sub.features : (sub.features ? sub.features.split(',') : [])).map((f, i) => (
                                                    <li key={i} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#555' }}>
                                                        <FaCheckCircle color="var(--primary-color)" /> {f.trim()}
                                                    </li>
                                                ))}
                                            </ul>
                                            {sub.name.toLowerCase() !== store.subscription_tier && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUpgradeTier(sub);
                                                        setShowUpgradeModal(true);
                                                    }}
                                                    className="btn btn-primary"
                                                    style={{ width: '100%', borderRadius: '12px' }}
                                                >
                                                    Request Upgrade
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="card" style={{ marginTop: '40px' }}>
                                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FaHistory /> Upgrade History
                                    </h3>
                                    {upgradeRequests.length === 0 ? (
                                        <p style={{ color: '#999' }}>No upgrade requests found.</p>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                <thead>
                                                    <tr style={{ background: '#f8fafc' }}>
                                                        <th style={{ padding: '12px' }}>Requested Tier</th>
                                                        <th style={{ padding: '12px' }}>Date</th>
                                                        <th style={{ padding: '12px' }}>Status</th>
                                                        <th style={{ padding: '12px' }}>Message</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {upgradeRequests.map(req => (
                                                        <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                                                            <td data-label="Requested Tier" style={{ padding: '12px', textTransform: 'capitalize', fontWeight: 'bold' }}>{req.requested_tier}</td>
                                                            <td data-label="Date" style={{ padding: '12px' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                                                            <td data-label="Status" style={{ padding: '12px' }}>
                                                                <span style={{
                                                                    padding: '4px 10px',
                                                                    borderRadius: '10px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 'bold',
                                                                    background: req.status === 'pending' ? '#fff3cd' : req.status === 'approved' ? '#d1e7dd' : '#f8d7da',
                                                                    color: req.status === 'pending' ? '#856404' : req.status === 'approved' ? '#0f5132' : '#842029'
                                                                }}>
                                                                    {req.status.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td data-label="Message" style={{ padding: '12px', fontSize: '0.9rem', color: '#666' }}>{req.message || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSection === 'users' && (
                            <div>
                                <h1 style={{ color: 'var(--primary-dark)', marginBottom: '30px' }}>Store Users & Customers</h1>

                                <div className="card" style={{ marginBottom: '30px' }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            placeholder="Search users by name or email..."
                                            className="form-control"
                                            style={{ flex: 1, marginBottom: 0 }}
                                            value={userSearch}
                                            onChange={(e) => {
                                                setUserSearch(e.target.value);
                                                fetchStoreUsers(store.id, e.target.value);
                                            }}
                                        />
                                        <button className="btn btn-primary" onClick={() => fetchStoreUsers(store.id, userSearch)}>Search</button>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 style={{ marginBottom: '20px' }}>Active Customers</h3>
                                    {storeUsers.length === 0 ? (
                                        <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No users found with interactions in your store.</p>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                <thead>
                                                    <tr style={{ background: '#f5f5f5' }}>
                                                        <th style={{ padding: '12px' }}>User</th>
                                                        <th style={{ padding: '12px' }}>Orders</th>
                                                        <th style={{ padding: '12px' }}>Reviews</th>
                                                        <th style={{ padding: '12px' }}>Views</th>
                                                        <th style={{ padding: '12px' }}>Last Visit</th>
                                                        <th style={{ padding: '12px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {storeUsers.map(u => (
                                                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                                            <td data-label="User" style={{ padding: '12px' }}>
                                                                <div style={{ fontWeight: 'bold' }}>{u.username}</div>
                                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{u.email}</div>
                                                            </td>
                                                            <td data-label="Orders" style={{ padding: '12px' }}>{u.order_count}</td>
                                                            <td data-label="Reviews" style={{ padding: '12px' }}>{u.review_count}</td>
                                                            <td data-label="Views" style={{ padding: '12px' }}>{u.visit_count}</td>
                                                            <td data-label="Last Visit" style={{ padding: '12px', fontSize: '0.85rem' }}>
                                                                {u.last_visit ? new Date(u.last_visit).toLocaleDateString() : 'Never'}
                                                            </td>
                                                            <td data-label="Action" style={{ padding: '12px' }}>
                                                                <button
                                                                    onClick={() => handleBanToggle(u.id, u.is_banned)}
                                                                    className={`btn ${u.is_banned ? 'btn-secondary' : 'btn-danger'}`}
                                                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                                >
                                                                    {u.is_banned ? 'Unban' : 'Ban from Store'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Upgrade Request Modal */}
                        {showUpgradeModal && (
                            <div className="modal-overlay" style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="modal-content" style={{ backgroundColor: 'white', maxWidth: '500px', width: '90%', borderRadius: '25px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                        <div style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '15px' }}><FaPaperPlane /></div>
                                        <h2 style={{ margin: 0, color: 'var(--primary-dark)' }}>Upgrade to {selectedUpgradeTier?.name}</h2>
                                        <p style={{ color: '#666', marginTop: '10px' }}>Send a request to the Super Admin.</p>
                                    </div>
                                    <form onSubmit={handleUpgradeSubmit}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Reason or Special Requests</label>
                                            <textarea
                                                className="form-control"
                                                style={{ minHeight: '120px', borderRadius: '15px', padding: '15px', width: '100%', border: '1px solid #ddd' }}
                                                placeholder="Tell the Super Admin why you want to upgrade..."
                                                value={upgradeMessage}
                                                onChange={(e) => setUpgradeMessage(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setShowUpgradeModal(false)}
                                                className="btn btn-secondary"
                                                style={{ flex: 1, borderRadius: '12px', padding: '12px', border: 'none', cursor: 'pointer' }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                style={{ flex: 1, borderRadius: '12px', padding: '12px', border: 'none', cursor: 'pointer', background: 'var(--primary-color)', color: 'white' }}
                                            >
                                                Send Request
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .admin-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }

                @media (max-width: 992px) {
                    .admin-content {
                        margin-left: 0 !important;
                    }
                }

                @media (max-width: 768px) {
                    .admin-stats-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .admin-content {
                        padding: 15px !important;
                        margin-left: 0 !important;
                    }
                    .admin-form-grid {
                        grid-template-columns: 1fr !important;
                        gap: 10px !important;
                    }
                    .admin-product-item {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .admin-product-actions {
                        width: 100% !important;
                        justify-content: flex-start !important;
                        flex-wrap: wrap !important;
                    }
                    .admin-order-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 15px !important;
                    }
                    .admin-order-totals {
                        text-align: left !important;
                        width: 100% !important;
                    }
                    .admin-order-status-actions {
                        align-items: flex-start !important;
                    }
                    .admin-chart-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 15px !important;
                    }
                    .admin-chart-filters {
                        width: 100% !important;
                        justify-content: flex-start !important;
                    }
                    .admin-status-flex {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .admin-nav-quick-add {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .admin-danger-zone-card {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        text-align: center !important;
                        margin-bottom: 60px !important;
                    }
                    table, thead, tbody, th, td, tr {
                        display: block !important;
                    }
                    thead tr {
                        position: absolute !important;
                        top: -9999px !important;
                        left: -9999px !important;
                    }
                    tr {
                        border: 1px solid #ccc !important;
                        margin-bottom: 20px !important;
                        border-radius: 12px !important;
                        overflow: hidden !important;
                    }
                    td {
                        border: none !important;
                        border-bottom: 1px solid #eee !important;
                        position: relative !important;
                        padding-left: 50% !important;
                        text-align: right !important;
                    }
                    td:last-child {
                        border-bottom: none !important;
                    }
                    td::before {
                        position: absolute !important;
                        left: 15px !important;
                        width: 45% !important;
                        padding-right: 10px !important;
                        white-space: nowrap !important;
                        text-align: left !important;
                        font-weight: bold !important;
                        content: attr(data-label) !important;
                    }
                }
            `}</style>
        </div >
    );
};

export default AdminDashboard;
