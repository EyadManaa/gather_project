import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import {
    FaUsers, FaStore, FaGem, FaShieldAlt, FaMapMarkerAlt, FaEnvelope,
    FaBan, FaSearch, FaChartPie, FaPaperPlane,
    FaUserCircle, FaCalendarAlt, FaHistory, FaCheckCircle, FaTimes, FaArrowLeft, FaExternalLinkAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminDashboard = () => {
    const { user, impersonate } = useContext(AuthContext);
    const { showNotification } = useContext(CartContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [owners, setOwners] = useState([]);
    const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [storeSearchTerm, setStoreSearchTerm] = useState('');
    const [stores, setStores] = useState([]);
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSub, setEditingSub] = useState(null);
    const [editForm, setEditForm] = useState({ price: '', features: '', duration_days: '' });
    const [upgradeRequests, setUpgradeRequests] = useState([]);
    const [requestSearchTerm, setRequestSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [statsRes, revenueRes, ownersRes, storesRes, subsRes, usersRes, requestsRes] = await Promise.all([
                    axios.get('/api/superadmin/stats'),
                    axios.get('/api/superadmin/revenue-chart'),
                    axios.get('/api/superadmin/owners'),
                    axios.get('/api/superadmin/all-stores'),
                    axios.get('/api/superadmin/subs'),
                    axios.get('/api/superadmin/users'),
                    axios.get('/api/upgrade-requests')
                ]);
                setStats(statsRes.data);
                setRevenueData(revenueRes.data);
                setOwners(ownersRes.data);
                setStores(storesRes.data);
                setSubs(subsRes.data);
                setUsers(usersRes.data);
                setUpgradeRequests(requestsRes.data);
            } catch (err) {
                console.error(err);
                showNotification('Error loading dashboard data', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
        // eslint-disable-next-line
    }, []);

    const handleBanStore = async (id, currentStatus) => {
        try {
            await axios.put(`/api/superadmin/ban-store/${id} `);
            showNotification(currentStatus ? 'Store Unbanned' : 'Store Banned');
            // Refresh stores
            const res = await axios.get('/api/superadmin/all-stores');
            setStores(res.data);
        } catch (err) {
            showNotification('Action failed', 'error');
        }
    };

    const handleBanUser = async (id, currentStatus) => {
        try {
            await axios.put(`/api/superadmin/ban-user/${id} `);
            showNotification(currentStatus ? 'User Unbanned' : 'User Banned');
            // Refresh users
            const res = await axios.get('/api/superadmin/users');
            setUsers(res.data);
        } catch (err) {
            showNotification('Action failed', 'error');
        }
    };

    const handleViewOrders = async (user) => {
        setSelectedUser(user);
        try {
            const res = await axios.get(`/api/superadmin/user-orders/${user.id} `);
            setUserOrders(res.data);
        } catch (err) {
            showNotification('Error fetching user orders', 'error');
        }
    };

    const handleUpdateRequestStatus = async (id, status) => {
        try {
            await axios.patch(`/api/upgrade-requests/${id}/status`, { status });
            showNotification(`Request ${status} successfully`);
            // Refresh requests and stores
            const [requestsRes, storesRes, statsRes] = await Promise.all([
                axios.get('/api/upgrade-requests'),
                axios.get('/api/superadmin/all-stores'),
                axios.get('/api/superadmin/stats')
            ]);
            setUpgradeRequests(requestsRes.data);
            setStores(storesRes.data);
            setStats(statsRes.data);
        } catch (err) {
            showNotification('Action failed', 'error');
        }
    };

    const renderOverview = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '30px' }}>Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px', marginBottom: '50px' }}>
                <div className="sa-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontWeight: 'bold' }}>Total Users</span>
                        <FaUsers style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{stats?.userCount}</span>
                    <div style={{ fontSize: '0.85rem', color: '#10b981' }}>↑ 12% from last month</div>
                </div>
                <div className="sa-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontWeight: 'bold' }}>Active Stores</span>
                        <FaStore style={{ color: 'var(--primary-light)' }} />
                    </div>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{stats?.storeCount}</span>
                    <div style={{ fontSize: '0.85rem', color: '#10b981' }}>↑ 5 new this week</div>
                </div>
                <div className="sa-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontWeight: 'bold' }}>Platform Profit</span>
                        <FaGem style={{ color: '#f59e0b' }} />
                    </div>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>${stats?.totalProfit}</span>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>10% marketplace fee</div>
                </div>
                <div className="sa-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontWeight: 'bold' }}>Premium Subs</span>
                        <FaShieldAlt style={{ color: '#3b82f6' }} />
                    </div>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{stats?.activeSubscriptions}</span>
                    <div style={{ fontSize: '0.85rem', color: '#3b82f6' }}>Active Pro/Enterprise</div>
                </div>
            </div>

            <div className="card" style={{ borderRadius: '25px', padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Recent Growth (Last 14 Days)</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Daily Revenue Trend</div>
                </div>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '20px 0' }}>
                    {revenueData.length > 0 ? revenueData.map((d, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.revenue / Math.max(...revenueData.map(x => x.revenue), 1)) * 100}%` }}
                            transition={{ delay: i * 0.05, duration: 0.8 }}
                            style={{
                                flex: 1,
                                background: 'var(--primary-color)',
                                borderRadius: '4px 4px 0 0',
                                opacity: 0.5 + (i * 0.03),
                                position: 'relative'
                            }}
                            title={`Date: ${new Date(d.date).toLocaleDateString()}, Revenue: $${parseFloat(d.revenue).toFixed(2)}`}
                        ></motion.div>
                    )) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            Insufficient data for chart
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem', marginTop: '10px' }}>
                    <span>{revenueData.length > 0 ? new Date(revenueData[0].date).toLocaleDateString() : 'Start'}</span>
                    <span>{revenueData.length > 0 ? new Date(revenueData[revenueData.length - 1].date).toLocaleDateString() : 'End'}</span>
                </div>
            </div>
        </motion.div>
    );

    const handleImpersonate = async (ownerId) => {
        try {
            const res = await axios.post(`/api/superadmin/impersonate/${ownerId}`);
            const { user, token } = res.data;
            impersonate(user, token);
            showNotification(`Now managing account: ${user.username}`);
            navigate('/admin/dashboard');
        } catch (err) {
            showNotification('Impersonation failed', 'error');
        }
    };

    const renderOwners = () => {
        const filteredOwners = owners.filter(o =>
            o.username.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
            o.email.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
            o.store_name?.toLowerCase().includes(ownerSearchTerm.toLowerCase())
        );

        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>Store Owners</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Search owners..."
                            value={ownerSearchTerm}
                            onChange={(e) => setOwnerSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 15px 10px 40px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={14} />
                    </div>
                </div>
                <table className="sa-table">
                    <thead>
                        <tr style={{ background: 'transparent', boxShadow: 'none' }}>
                            <th style={{ textAlign: 'left', padding: '10px 20px', color: '#64748b' }}>Owner</th>
                            <th style={{ textAlign: 'left', padding: '10px 20px', color: '#64748b' }}>Contact Details</th>
                            <th style={{ textAlign: 'left', padding: '10px 20px', color: '#64748b' }}>Primary Store</th>
                            <th style={{ textAlign: 'center', padding: '10px 20px', color: '#64748b' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOwners.map(owner => (
                            <tr key={owner.id}>
                                <td data-label="Owner">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                                            {owner.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{owner.username}</span>
                                    </div>
                                </td>
                                <td data-label="Contact Details">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                            <FaEnvelope size={12} /> {owner.email}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                            <FaMapMarkerAlt size={12} /> {owner.address || 'Address not provided'}
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Primary Store">
                                    <span className="sa-badge" style={{ background: 'var(--secondary-color)', color: 'var(--primary-dark)' }}>
                                        {owner.store_name}
                                    </span>
                                </td>
                                <td data-label="Actions" style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => navigate(`/store/${owner.store_id}`)}>
                                            View
                                        </button>
                                        <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem', background: '#064e3b', border: 'none' }} onClick={() => handleImpersonate(owner.id)}>
                                            <FaShieldAlt size={10} style={{ marginRight: '5px' }} /> Manage Account
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        );
    };

    const renderStores = () => {
        const filteredStores = stores.filter(s =>
            s.name.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
            s.owner_name?.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
            s.subscription_tier?.toLowerCase().includes(storeSearchTerm.toLowerCase())
        );

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="sa-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
                    <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>Platform Stores</h2>
                    <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                        <input
                            type="text"
                            placeholder="Search stores..."
                            value={storeSearchTerm}
                            onChange={(e) => setStoreSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 15px 10px 40px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={14} />
                    </div>
                </div>
                <div className="grid sa-stores-grid">
                    {filteredStores.map(store => (
                        <div key={store.id} className="card" style={{
                            borderRadius: '20px',
                            padding: '25px',
                            border: '1px solid #f1f5f9',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            {!!store.is_banned && (
                                <div style={{ position: 'absolute', top: '15px', right: '15px', color: 'var(--error)' }}>
                                    <FaBan title="Banned" />
                                </div>
                            )}
                            <div>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '15px', overflow: 'hidden', border: '2px solid #eee', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {store.profile_pic ? (
                                            <img
                                                src={store.profile_pic}
                                                alt={store.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="color: #94a3b8; font-size: 1.5rem">🏪</span>'; }}
                                            />
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '1.5rem' }}>🏪</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{store.name}</h3>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Owner: {store.owner_name}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                    <span className="sa-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Tier: {store.subscription_tier}</span>
                                    <span className="sa-badge" style={{ background: store.is_open ? 'var(--secondary-color)' : '#fee2e2', color: store.is_open ? 'var(--primary-dark)' : '#dc2626' }}>
                                        {store.is_open ? 'Open' : 'Closed'}
                                    </span>
                                </div>

                                {/* Performance Metrics */}
                                {store.performance && (
                                    <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>30-Day Performance</div>
                                        <div className="sa-perf-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '3px' }}>Visits</div>
                                                <div style={{
                                                    fontSize: '0.9rem',
                                                    fontWeight: 'bold',
                                                    color: store.performance.visits_growth >= 0 ? '#10b981' : '#ef4444'
                                                }}>
                                                    {store.performance.visits_growth >= 0 ? '↑' : '↓'} {Math.abs(store.performance.visits_growth)}%
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '3px' }}>Orders</div>
                                                <div style={{
                                                    fontSize: '0.9rem',
                                                    fontWeight: 'bold',
                                                    color: store.performance.orders_growth >= 0 ? '#10b981' : '#ef4444'
                                                }}>
                                                    {store.performance.orders_growth >= 0 ? '↑' : '↓'} {Math.abs(store.performance.orders_growth)}%
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '3px' }}>Reviews</div>
                                                <div style={{
                                                    fontSize: '0.9rem',
                                                    fontWeight: 'bold',
                                                    color: store.performance.reviews_growth >= 0 ? '#10b981' : '#ef4444'
                                                }}>
                                                    {store.performance.reviews_growth >= 0 ? '↑' : '↓'} {Math.abs(store.performance.reviews_growth)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }} onClick={() => navigate(`/store/${store.id}`)}>
                                    <FaExternalLinkAlt size={12} style={{ marginRight: '8px' }} /> Oversee
                                </button>
                                <button
                                    className={`btn ${store.is_banned ? 'btn-secondary' : 'btn-danger'}`}
                                    style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
                                    onClick={() => handleBanStore(store.id, store.is_banned)}
                                >
                                    {store.is_banned ? 'Unban' : 'Ban'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    };

    const renderUsers = () => {
        const filteredUsers = users.filter(u =>
            u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
        );

        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>Platform Users</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Find a shopper..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 15px 10px 40px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={14} />
                    </div>
                </div>
                <table className="sa-table">
                    <thead>
                        <tr style={{ background: 'transparent', boxShadow: 'none' }}>
                            <th style={{ textAlign: 'left', padding: '10px 20px', color: '#64748b' }}>User</th>
                            <th style={{ textAlign: 'left', padding: '10px 20px', color: '#64748b' }}>Email & Role</th>
                            <th style={{ textAlign: 'left', padding: '10px 20px', color: '#64748b' }}>Joined</th>
                            <th style={{ textAlign: 'left', padding: '10px 20px', color: '#64748b' }}>Total Spent</th>
                            <th style={{ textAlign: 'center', padding: '10px 20px', color: '#64748b' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td data-label="User">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)' }}>
                                            <FaUserCircle size={24} />
                                        </div>
                                        <span style={{ fontWeight: 'bold' }}>{u.username}</span>
                                    </div>
                                </td>
                                <td data-label="Email & Role">
                                    <div style={{ fontSize: '0.9rem' }}>{u.email}</div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>{u.role}</span>
                                </td>
                                <td data-label="Joined" style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    <FaCalendarAlt size={12} style={{ marginRight: '5px' }} />
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td data-label="Total Spent" style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                                    ${parseFloat(u.total_spent || 0).toFixed(2)}
                                </td>
                                <td data-label="Actions" style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => handleViewOrders(u)}>
                                            <FaHistory size={12} /> Orders
                                        </button>
                                        <button
                                            className={`btn ${u.is_banned ? 'btn-secondary' : 'btn-danger'}`}
                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                            onClick={() => handleBanUser(u.id, u.is_banned)}
                                        >
                                            {u.is_banned ? 'Unban' : 'Ban'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        );
    };

    const handleEditSub = (sub) => {
        setEditingSub(sub);
        setEditForm({
            price: parseFloat(sub.price).toFixed(2),
            features: Array.isArray(sub.features) ? sub.features.join(', ') : sub.features,
            duration_days: sub.duration_days || 30
        });
    };

    const handleUpdateSub = async () => {
        try {
            await axios.put(`/api/superadmin/subs/${editingSub.id}`, editForm);
            showNotification('Subscription package updated successfully!');
            setEditingSub(null);
            // Refresh subscriptions
            const res = await axios.get('/api/superadmin/subs');
            setSubs(res.data);
        } catch (err) {
            showNotification('Failed to update subscription', 'error');
        }
    };

    const getPeriodText = (days) => {
        if (!days || days <= 0) return 'mo';
        if (days === 30) return 'mo';
        if (days === 365) return 'year';
        if (days === 7) return 'week';
        return `${days} days`;
    };

    const renderSubs = () => (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '30px' }}>Subscription Packages</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                {subs.map(sub => (
                    <div key={sub.id} className="card" style={{
                        borderRadius: '30px',
                        padding: '40px',
                        textAlign: 'center',
                        position: 'relative',
                        border: sub.name === 'Basic' ? '2px solid var(--primary-color)' : '1px solid #f1f5f9'
                    }}>
                        {sub.name === 'Basic' && (
                            <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: 'white', padding: '5px 20px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>MOST POPULAR</div>
                        )}
                        <h3 style={{ fontSize: '1.5rem', color: '#64748b' }}>{sub.name}</h3>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: '20px 0' }}>
                            ${parseFloat(sub.price).toFixed(2)}<span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#94a3b8' }}>/{getPeriodText(sub.duration_days)}</span>
                        </div>
                        <div style={{ textAlign: 'left', marginBottom: '40px' }}>
                            {(Array.isArray(sub.features) ? sub.features : (sub.features ? sub.features.split(',') : [])).map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <FaCheckCircle color="var(--primary-color)" size={14} />
                                    <span style={{ fontSize: '0.95rem', color: '#475569' }}>{f.trim()}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', borderRadius: '15px' }}
                            onClick={() => handleEditSub(sub)}
                        >
                            Edit Package
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    const renderUpgrades = () => {
        const filteredRequests = upgradeRequests.filter(r =>
            r.store_name?.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
            r.owner_name?.toLowerCase().includes(requestSearchTerm.toLowerCase())
        );

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>Upgrade Requests</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={requestSearchTerm}
                            onChange={(e) => setRequestSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 15px 10px 40px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={14} />
                    </div>
                </div>

                <table className="sa-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '15px 20px', color: '#64748b' }}>Store & Owner</th>
                            <th style={{ textAlign: 'center', padding: '15px 20px', color: '#64748b' }}>Current → Requested</th>
                            <th style={{ textAlign: 'left', padding: '15px 20px', color: '#64748b' }}>Message</th>
                            <th style={{ textAlign: 'center', padding: '15px 20px', color: '#64748b' }}>Status</th>
                            <th style={{ textAlign: 'center', padding: '15px 20px', color: '#64748b' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map(req => (
                            <tr key={req.id}>
                                <td data-label="Store & Owner">
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{req.store_name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{req.owner_name} ({req.owner_email})</div>
                                </td>
                                <td data-label="Current → Requested" style={{ textAlign: 'center' }}>
                                    <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: '#64748b' }}>{req.current_tier}</span>
                                    <span style={{ margin: '0 10px', color: 'var(--primary-color)' }}>➔</span>
                                    <span style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>{req.requested_tier}</span>
                                </td>
                                <td data-label="Message">
                                    <div style={{ fontSize: '0.9rem', color: '#475569', fontStyle: req.message ? 'normal' : 'italic' }}>
                                        {req.message || 'No message provided'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px' }}>
                                        Submitted: {new Date(req.created_at).toLocaleString()}
                                    </div>
                                </td>
                                <td data-label="Status" style={{ textAlign: 'center' }}>
                                    <span className="sa-badge" style={{
                                        background: req.status === 'pending' ? '#fff3cd' : req.status === 'approved' ? '#d1e7dd' : '#f8d7da',
                                        color: req.status === 'pending' ? '#856404' : req.status === 'approved' ? '#0f5132' : '#842029',
                                        textTransform: 'uppercase',
                                        fontSize: '0.75rem'
                                    }}>
                                        {req.status}
                                    </span>
                                </td>
                                <td data-label="Actions" style={{ textAlign: 'center' }}>
                                    {req.status === 'pending' ? (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '8px 15px', fontSize: '0.8rem', background: '#059669', border: 'none' }}
                                                onClick={() => handleUpdateRequestStatus(req.id, 'approved')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: '8px 15px', fontSize: '0.8rem' }}
                                                onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Processed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredRequests.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    No upgrade requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>
        );
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ fontSize: '3rem' }}>🌿</motion.div>
        </div>
    );

    return (
        <div className="sa-container">
            {/* MOBILE SIDEBAR TOGGLE */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 2000,
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--primary-dark)',
                    color: 'white',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                className="sa-mobile-toggle"
            >
                {isSidebarOpen ? <FaTimes /> : <FaShieldAlt />}
            </button>

            {/* SIDEBAR */}
            <div className={`sa-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '20px 0', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <FaShieldAlt style={{ color: 'var(--primary-light)' }} /> GATHER
                    </h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', opacity: 0.5, fontWeight: 'bold', textTransform: 'uppercase' }}>Super Admin Portal</p>
                </div>

                <div className={`sa-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}>
                    <FaChartPie /> Overview
                </div>
                <div className={`sa-nav-item ${activeTab === 'owners' ? 'active' : ''}`} onClick={() => { setActiveTab('owners'); setIsSidebarOpen(false); }}>
                    <FaUsers /> Store Owners
                </div>
                <div className={`sa-nav-item ${activeTab === 'stores' ? 'active' : ''}`} onClick={() => { setActiveTab('stores'); setIsSidebarOpen(false); }}>
                    <FaStore /> Platform Stores
                </div>
                <div className={`sa-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}>
                    <FaUserCircle /> Platform Users
                </div>
                <div className={`sa-nav-item ${activeTab === 'subs' ? 'active' : ''}`} onClick={() => { setActiveTab('subs'); setIsSidebarOpen(false); }}>
                    <FaGem /> Subscriptions
                </div>
                <div className={`sa-nav-item ${activeTab === 'upgrades' ? 'active' : ''}`} onClick={() => { setActiveTab('upgrades'); setIsSidebarOpen(false); }}>
                    <FaPaperPlane /> Upgrade Requests
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="sa-nav-item" onClick={() => navigate('/stores')}>
                        <FaArrowLeft /> Exit Dashboard
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="sa-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>
                            Welcome back, {user.username}
                        </h1>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Platform performance and management overview.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold' }}>{user.email}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>SUPER ADMIN</div>
                        </div>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'white', border: '3px solid var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary-dark)', fontSize: '1.2rem' }}>
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'owners' && renderOwners()}
                    {activeTab === 'stores' && renderStores()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'subs' && renderSubs()}
                    {activeTab === 'upgrades' && renderUpgrades()}
                </AnimatePresence>

                {/* USER ORDERS MODAL */}
                {selectedUser && (
                    <div className="modal-overlay" style={{ zIndex: 3000 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="modal-content"
                            style={{ maxWidth: '800px', width: '90%', padding: '0', overflow: 'hidden', borderRadius: '25px' }}
                        >
                            <div style={{ background: 'var(--primary-dark)', padding: '30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaUserCircle size={40} />
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedUser.username}'s Activity</h2>
                                        <p style={{ margin: '5px 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Total Spend</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-light)' }}>
                                            ${parseFloat(selectedUser.total_spent || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: '30px', maxHeight: '500px', overflowY: 'auto' }}>
                                {userOrders.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {userOrders.map(order => (
                                            <div key={order.id} style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{order.store_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Order #{order.order_number} • {new Date(order.created_at).toLocaleDateString()}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>${parseFloat(order.total_amount).toFixed(2)}</div>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '3px 10px',
                                                        borderRadius: '10px',
                                                        background: order.status === 'completed' ? '#dcfce7' : '#fef9c3',
                                                        color: order.status === 'completed' ? '#166534' : '#854d0e',
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🛍️</div>
                                        <p>No orders found for this user.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* SUBSCRIPTION EDIT MODAL */}
                {editingSub && (
                    <div className="modal-overlay" style={{ zIndex: 3000 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="modal-content"
                            style={{ maxWidth: '600px', borderRadius: '25px', padding: '40px' }}
                        >
                            <div style={{ marginBottom: '30px' }}>
                                <h2 style={{ margin: 0, color: 'var(--primary-dark)' }}>Edit {editingSub.name} Package</h2>
                                <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Modify pricing, features, and duration</p>
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>Price (USD/month)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                    className="form-control"
                                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                />
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>Duration (Days)</label>
                                <input
                                    type="number"
                                    value={editForm.duration_days}
                                    onChange={(e) => setEditForm({ ...editForm, duration_days: e.target.value })}
                                    className="form-control"
                                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                    placeholder="30"
                                />
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>Features (comma-separated)</label>
                                <textarea
                                    value={editForm.features}
                                    onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                                    className="form-control"
                                    rows="5"
                                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', resize: 'vertical' }}
                                    placeholder="Feature 1, Feature 2, Feature 3"
                                />
                                <small style={{ display: 'block', marginTop: '5px', color: '#94a3b8' }}>Separate each feature with a comma</small>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px' }}
                                    onClick={() => setEditingSub(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px' }}
                                    onClick={handleUpdateSub}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
                <style>{`
                    .sa-content {
                        flex: 1;
                        padding: 40px;
                        overflow-y: auto;
                        transition: all 0.3s ease;
                    }

                    @media (max-width: 1024px) {
                        .sa-sidebar {
                            width: 240px;
                        }
                    }

                    @media (max-width: 992px) {
                        .sa-sidebar {
                            position: fixed;
                            left: -100%;
                            transition: left 0.3s ease;
                            z-index: 2001;
                        }
                        .sa-sidebar.open {
                            left: 0;
                        }
                        .sa-mobile-toggle {
                            display: flex !important;
                        }
                        .sa-content {
                            padding: 20px !important;
                            margin-left: 0 !important;
                            padding-bottom: 100px !important;
                        }
                        .sa-tab-header {
                            flex-direction: column;
                            align-items: flex-start !important;
                        }
                        .sa-stores-grid {
                            grid-template-columns: 1fr !important;
                        }
                        .sa-perf-grid {
                            grid-template-columns: 1fr !important;
                            gap: 15px !important;
                        }
                        .sa-stat-card {
                            padding: 20px !important;
                        }
                    }

                    @media (max-width: 768px) {
                        .sa-table thead {
                            display: none;
                        }
                        .sa-table tr {
                            display: flex;
                            flex-direction: column;
                            margin-bottom: 20px;
                            padding: 20px;
                            background: white;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                            border-radius: 20px;
                        }
                        .sa-table td {
                            display: flex;
                            flex-direction: column;
                            align-items: flex-start;
                            padding: 10px 0;
                            border-bottom: 1px solid #f1f5f9;
                            border-radius: 0 !important;
                            text-align: left !important;
                            gap: 5px;
                        }
                        .sa-table td::before {
                            content: attr(data-label);
                            font-weight: 800;
                            color: #64748b;
                            font-size: 0.75rem;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        .sa-table td:last-child {
                            border-bottom: none;
                            padding-top: 15px;
                            flex-direction: row;
                            justify-content: center;
                        }
                        
                        /* Revenue Chart Adjustments */
                        .card div[style*="height: 200px"] {
                            gap: 4px !important;
                        }
                    }

                    @media (max-width: 600px) {
                        .sa-stat-card span[style*="fontSize: 2.5rem"] {
                            font-size: 1.8rem !important;
                        }
                        .modal-content {
                            padding: 20px !important;
                            width: 95% !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
