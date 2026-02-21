import { useState, useEffect } from 'react';
import { CustomerAPI } from '../services/api';
import './Accounts.css';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    isVIP: boolean;
    totalBookings: number;
    totalSpent: number;
    createdAt?: string;
    reservations?: any[];
}

function Accounts() {
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
    });

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const loadCustomers = async () => {
        try {
            setIsLoading(true);
            const data = await CustomerAPI.getAll();
            // Map API response: totalBookings from reservations array, totalSpent from reservations totals
            const mapped: Customer[] = data.map((c: any) => ({
                ...c,
                totalBookings: c.reservations?.length ?? 0,
                totalSpent: c.reservations?.reduce((sum: number, r: any) => sum + (r.total ?? 0), 0) ?? 0,
            }));
            setCustomers(mapped);
        } catch (err) {
            console.error('Failed to load customers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadCustomers(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && editingCustomerId) {
                await CustomerAPI.update(editingCustomerId, {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company || null,
                });
                setNotification({ message: 'Customer updated successfully', type: 'success' });
            } else {
                await CustomerAPI.create({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company || null,
                });
                setNotification({ message: 'Customer added successfully', type: 'success' });
            }
            await loadCustomers();
            resetForm();
        } catch (err: any) {
            setNotification({ message: err.message || 'Failed to save customer', type: 'error' });
        }
    };

    const resetForm = () => {
        setShowModal(false);
        setIsEditMode(false);
        setEditingCustomerId(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
        });
    };

    const handleEdit = (customer: Customer) => {
        setIsEditMode(true);
        setEditingCustomerId(customer.id);
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            company: customer.company || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this customer? This cannot be undone.')) return;
        try {
            await CustomerAPI.delete(id);
            await loadCustomers();
            setNotification({ message: 'Customer deleted', type: 'success' });
        } catch (err: any) {
            setNotification({ message: err.message || 'Failed to delete customer', type: 'error' });
        }
    };

    const handleView = (customer: Customer) => {
        setViewingCustomer(customer);
        setShowViewModal(true);
    };

    const handleSendEmail = (customer: Customer) => {
        alert(`Opening message portal for ${customer.email}...`);
    };

    return (
        <div className="accounts fade-in">
            <div className="accounts-header">
                <div className="accounts-header-content">
                    <h2 className="title-gradient">Customer Directory</h2>
                    <p className="text-secondary">Manage relationships and customer booking history</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setIsEditMode(false);
                    setShowModal(true);
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
                        <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
                    </svg>
                    Add Customer
                </button>
            </div>

            {/* Stats Overview */}
            <div className="accounts-stats">
                <div className="stat-card glass-card summary vip">
                    <p className="stat-label">VIP Customers</p>
                    <h4 className="stat-value title-gradient">{customers.filter(c => c.isVIP).length}</h4>
                </div>
                <div className="stat-card glass-card summary active">
                    <p className="stat-label">Active Customers</p>
                    <h4 className="stat-value title-gradient">{customers.filter(c => !c.isVIP).length}</h4>
                </div>
                <div className="stat-card glass-card summary revenue">
                    <p className="stat-label">Total Revenue</p>
                    <h4 className="stat-value title-gradient">${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}</h4>
                </div>
                <div className="stat-card glass-card summary bookings">
                    <p className="stat-label">Total Bookings</p>
                    <h4 className="stat-value title-gradient">{customers.reduce((sum, c) => sum + c.totalBookings, 0)}</h4>
                </div>
            </div>

            {/* Registry Table */}
            <div className="customers-section">
                <div className="section-controls">
                    <h4 className="title-gradient">Customer Database</h4>
                    <input
                        type="search"
                        className="form-input"
                        style={{ maxWidth: '300px' }}
                        placeholder="Search customers..."
                    />
                </div>

                <div className="table-glass-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Company</th>
                                <th>Bookings</th>
                                <th>Total Spent</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Loading customers...</td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No customers found</td></tr>
                            ) : customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>
                                        <div className="customer-cell">
                                            <div className="customer-avatar">
                                                {customer.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="customer-meta">
                                                <span className="customer-name">{customer.name}</span>
                                                <span className="customer-id">REF: {customer.id.toString().padStart(4, '0')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-meta">
                                            <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{customer.email}</p>
                                            <p style={{ fontSize: '0.75rem', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>{customer.phone}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, opacity: 0.8 }}>{customer.company}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ height: '4px', width: '60px', background: 'var(--color-bg-tertiary)', borderRadius: '2px' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${Math.min((customer.totalBookings / 30) * 100, 100)}%`,
                                                    background: 'var(--color-primary)',
                                                    borderRadius: '2px',
                                                    boxShadow: '0 0 10px var(--color-primary)'
                                                }}></div>
                                            </div>
                                            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{customer.totalBookings}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: '0.95rem' }}>
                                            ${customer.totalSpent.toLocaleString()}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="status-indicator">
                                            <div className="glow-point" style={{
                                                background: customer.isVIP ? 'var(--color-accent)' : 'var(--color-success)'
                                            }}></div>
                                            {customer.isVIP ? 'VIP' : 'ACTIVE'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-sm btn-outline" onClick={() => handleView(customer)}>View</button>
                                            <button className="btn btn-sm btn-outline" onClick={() => handleEdit(customer)}>Edit</button>
                                            <button className="btn btn-sm btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={() => handleDelete(customer.id)}>Del</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notification toast */}
            {notification && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
                    padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem',
                    background: notification.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    border: `1px solid ${notification.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                    color: notification.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }} onClick={() => setNotification(null)}>
                    {notification.message}
                </div>
            )}

            {/* Add/Edit Customer Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal glass-card" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="title-gradient">{isEditMode ? 'Edit Customer' : 'Add Customer'}</h3>
                            <button className="modal-close" onClick={resetForm}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="customer-form">
                            <div className="grid grid-cols-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" className="form-input" value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Company</label>
                                    <input type="text" className="form-input" value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-input" value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input type="tel" className="form-input" value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {isEditMode ? 'Update Customer' : 'Add Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile View Modal */}
            {showViewModal && viewingCustomer && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="modal glass-card" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="profile-view">
                            <div className="profile-top">
                                <div className="profile-avatar-large">
                                    {viewingCustomer.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="profile-info">
                                    <h3 className="title-gradient">{viewingCustomer.name}</h3>
                                    <p className="text-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                                        Joined: {viewingCustomer.createdAt ? new Date(viewingCustomer.createdAt).toLocaleDateString() : 'N/A'} // ID: {viewingCustomer.id.toString().padStart(6, '0')}
                                    </p>
                                    <div className="status-indicator" style={{ marginTop: '1.5rem' }}>
                                        <div className="glow-point" style={{
                                            background: viewingCustomer.isVIP ? 'var(--color-accent)' : 'var(--color-success)'
                                        }}></div>
                                        {viewingCustomer.isVIP ? 'VIP' : 'ACTIVE'}
                                    </div>
                                </div>
                            </div>

                            <div className="profile-stats-grid">
                                <div className="profile-stat-box">
                                    <span className="profile-stat-label">Total Bookings</span>
                                    <p className="profile-stat-value">{viewingCustomer.totalBookings} Units</p>
                                </div>
                                <div className="profile-stat-box">
                                    <span className="profile-stat-label">Total Spend</span>
                                    <p className="profile-stat-value" style={{ color: 'var(--color-success)' }}>
                                        ${viewingCustomer.totalSpent.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="profile-sections">
                                <div className="profile-section">
                                    <h5>Contact Information</h5>
                                    <div className="info-item">
                                        <span className="info-label">Email</span>
                                        <span className="info-value">{viewingCustomer.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone</span>
                                        <span className="info-value">{viewingCustomer.phone}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Company</span>
                                        <span className="info-value">{viewingCustomer.company}</span>
                                    </div>
                                </div>
                                <div className="profile-section">
                                    <h5>Additional Info</h5>
                                    <div className="info-item">
                                        <span className="info-label">Company</span>
                                        <span className="info-value">{viewingCustomer.company || '—'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Status</span>
                                        <span className="info-value">{viewingCustomer.isVIP ? 'VIP Client' : 'Standard'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowViewModal(false)}>Close</button>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleSendEmail(viewingCustomer)}>Send Message</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Accounts;
