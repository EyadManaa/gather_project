import React, { useState, useEffect } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useUI } from '../context/UIContext';

const RatingModal = ({ isOpen, onClose, storeId, onRatingSubmitted, initialRating }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [globalStats, setGlobalStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const { showAlert } = useUI();

    useEffect(() => {
        if (isOpen) {
            setRating(initialRating || 0);
            fetchStats();
        }
        // eslint-disable-next-line
    }, [isOpen, initialRating]);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await axios.get(`/api/ratings/${storeId}/stats`);
            setGlobalStats(res.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) return;
        setSubmitting(true);
        try {
            await axios.post('/api/ratings', { storeId, score: rating });
            onRatingSubmitted();
            onClose();
        } catch (err) {
            showAlert('Error submitting rating', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>
                    <FaTimes />
                </button>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⭐</div>
                <h2 style={{ color: 'var(--primary-dark)', marginBottom: '10px' }}>Rate This Store</h2>
                <p style={{ color: '#666', marginBottom: '25px' }}>How would you describe your overall experience?</p>

                {/* Global Stats Summary */}
                {globalStats && (
                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '15px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-dark)' }}>{globalStats.average}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Global Average</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{globalStats.total}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Ratings</div>
                            </div>
                        </div>

                        {[5, 4, 3, 2, 1].map(s => {
                            const percent = globalStats.total > 0 ? (globalStats[s] / globalStats.total) * 100 : 0;
                            return (
                                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                    <div style={{ fontSize: '0.8rem', width: '45px', textAlign: 'right', fontWeight: 'bold', color: '#64748b' }}>{s} Star</div>
                                    <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', width: '35px', color: '#94a3b8' }}>{Math.round(percent)}%</div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '30px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            size={40}
                            style={{
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                                color: (hover || rating) >= star ? '#fbbf24' : '#e2e8f0'
                            }}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        />
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        disabled={rating === 0 || submitting}
                    >
                        {submitting ? 'Saving...' : 'Submit Rating'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
