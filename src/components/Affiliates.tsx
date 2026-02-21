import { useState, useEffect } from 'react';
import { AffiliateAPI } from '../services/api';
import './Affiliates.css';

interface Affiliate {
    id: number;
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    city: string;
    commissionRate: number;
    status: 'active' | 'inactive' | 'pending';
    completedBookings: number;
}

const Affiliates: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAffiliateId, setEditingAffiliateId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        city: '',
        commissionRate: 10,
        status: 'active' as Affiliate['status'],
    });

    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAffiliates = async () => {
        try {
            setIsLoading(true);
            const data = await AffiliateAPI.getAll();
            setAffiliates(data);
        } catch (err) {
            console.error('Failed to load affiliates:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadAffiliates(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && editingAffiliateId) {
                await AffiliateAPI.update(editingAffiliateId, {
                    companyName: formData.companyName,
                    contactName: formData.contactName,
                    email: formData.email,
                    phone: formData.phone,
                    city: formData.city,
                    commissionRate: formData.commissionRate,
                    status: formData.status,
                });
            } else {
                await AffiliateAPI.create({
                    companyName: formData.companyName,
                    contactName: formData.contactName,
                    email: formData.email,
                    phone: formData.phone,
                    city: formData.city,
                    commissionRate: formData.commissionRate,
                });
            }
            await loadAffiliates();
            resetForm();
        } catch (err: any) {
            alert(err.message || 'Failed to save affiliate');
        }
    };

    const resetForm = () => {
        setShowModal(false);
        setIsEditMode(false);
        setEditingAffiliateId(null);
        setFormData({
            companyName: '',
            contactName: '',
            email: '',
            phone: '',
            city: '',
            commissionRate: 10,
            status: 'active',
        });
    };

    const handleEdit = (affiliate: Affiliate) => {
        setIsEditMode(true);
        setEditingAffiliateId(affiliate.id);
        setFormData({
            companyName: affiliate.companyName,
            contactName: affiliate.contactName,
            email: affiliate.email,
            phone: affiliate.phone,
            city: affiliate.city,
            commissionRate: affiliate.commissionRate,
            status: affiliate.status,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to remove this affiliate partner?')) {
            try {
                await AffiliateAPI.delete(id);
                await loadAffiliates();
            } catch (err: any) {
                alert(err.message || 'Failed to delete affiliate');
            }
        }
    };

    return (
        <div className="affiliates fade-in">
            <div className="affiliates-header">
                <div className="affiliates-header-content">
                    <h2 className="title-gradient">Affiliate Network</h2>
                    <p className="text-secondary">Manage relationships and bookings through your global partner network</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setIsEditMode(false); setShowModal(true); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Affiliate
                </button>
            </div>

            <div className="affiliates-list glass-card">
                <table className="affiliates-table">
                    <thead>
                        <tr>
                            <th>Agency</th>
                            <th>Contact</th>
                            <th>City</th>
                            <th>Commission</th>
                            <th>Status</th>
                            <th>Bookings</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Loading affiliates...</td></tr>
                        ) : affiliates.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No affiliates found. Add your first partner.</td></tr>
                        ) : affiliates.map(affiliate => (
                            <tr key={affiliate.id}>
                                <td>
                                    <div className="company-cell">
                                        <div className="company-avatar">
                                            {affiliate.companyName.charAt(0)}
                                        </div>
                                        <span className="company-name">{affiliate.companyName}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-info">
                                        <p style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>{affiliate.contactName}</p>
                                        <p className="subtext" style={{ fontSize: '0.75rem', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>{affiliate.phone}</p>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{affiliate.city.toUpperCase()}</span>
                                </td>
                                <td>
                                    <span className="commission-rate">{affiliate.commissionRate}%</span>
                                </td>
                                <td>
                                    <div className="res-status-dot" style={{ color: affiliate.status === 'active' ? 'var(--color-success)' : affiliate.status === 'inactive' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                                        <div className="glow-point" style={{ background: affiliate.status === 'active' ? 'var(--color-success)' : affiliate.status === 'inactive' ? 'var(--color-danger)' : 'var(--color-warning)' }}></div>
                                        {affiliate.status === 'active' ? 'Active' : affiliate.status === 'inactive' ? 'Inactive' : 'Pending'}
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-primary)' }}>{affiliate.completedBookings.toString().padStart(3, '0')}</span>
                                </td>
                                <td>
                                    <div className="table-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button className="btn btn-sm btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }} onClick={() => handleEdit(affiliate)}>Edit</button>
                                        <button className="btn btn-sm btn-outline btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }} onClick={() => handleDelete(affiliate.id)}>Remove</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal glass-card" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="title-gradient">{isEditMode ? 'Edit Affiliate' : 'Add New Affiliate'}</h3>
                            <button className="modal-close" onClick={resetForm}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="affiliate-form">
                            <div className="grid grid-cols-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Agency Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        value={formData.companyName}
                                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Contact Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        value={formData.contactName}
                                        onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Commission (%)</label>
                                    <input
                                        type="number"
                                        required
                                        className="form-input"
                                        value={formData.commissionRate}
                                        onChange={e => setFormData({ ...formData, commissionRate: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="form-input"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as Affiliate['status'] })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {isEditMode ? 'Update Affiliate' : 'Add Affiliate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Affiliates;
