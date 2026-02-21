import { useState } from 'react';
import './Drivers.css';

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    status: 'available' | 'on-trip' | 'off-duty';
    assignedVehicle?: string;
    joinedDate: string;
    rating: number;
    tripsCompleted: number;
}

const Drivers: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDriverId, setEditingDriverId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        status: 'available' as Driver['status'],
        assignedVehicle: '',
    });

    const [drivers, setDrivers] = useState<Driver[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && editingDriverId) {
            setDrivers(drivers.map(d =>
                d.id === editingDriverId
                    ? { ...d, ...formData }
                    : d
            ));
        } else {
            const newDriver: Driver = {
                id: drivers.length > 0 ? Math.max(...drivers.map(d => d.id)) + 1 : 1,
                ...formData,
                joinedDate: new Date().toISOString().split('T')[0],
                rating: 5.0,
                tripsCompleted: 0
            };
            setDrivers([newDriver, ...drivers]);
        }
        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setIsEditMode(false);
        setEditingDriverId(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            licenseNumber: '',
            status: 'available',
            assignedVehicle: '',
        });
    };

    const handleEdit = (driver: Driver) => {
        setIsEditMode(true);
        setEditingDriverId(driver.id);
        setFormData({
            name: driver.name,
            email: driver.email,
            phone: driver.phone,
            licenseNumber: driver.licenseNumber,
            status: driver.status,
            assignedVehicle: driver.assignedVehicle || '',
        });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this driver?')) {
            setDrivers(drivers.filter(d => d.id !== id));
        }
    };

    return (
        <div className="drivers fade-in">
            <div className="drivers-header">
                <div className="drivers-header-content">
                    <h2 className="title-gradient">Driver Management</h2>
                    <p className="text-secondary">Manage and monitor your professional driver roster</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setIsEditMode(false); setShowModal(true); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Driver
                </button>
            </div>

            <div className="drivers-grid">
                {drivers.map(driver => (
                    <div key={driver.id} className="driver-card glass-card">
                        <div className="driver-status">
                            <div className="res-status-dot" style={{ color: driver.status === 'available' ? 'var(--color-success)' : driver.status === 'on-trip' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                <div className="glow-point" style={{ background: driver.status === 'available' ? 'var(--color-success)' : driver.status === 'on-trip' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}></div>
                                {driver.status === 'available' ? 'Available' : driver.status === 'on-trip' ? 'On Trip' : 'Off Duty'}
                            </div>
                        </div>

                        <div className="driver-info">
                            <div className="driver-avatar-container">
                                <div className="driver-avatar">
                                    {driver.name.charAt(0)}
                                </div>
                            </div>
                            <div className="driver-name-block">
                                <h4 className="title-gradient">{driver.name}</h4>
                                <p className="driver-license">{driver.licenseNumber}</p>
                            </div>
                        </div>

                        <div className="driver-stats-modular">
                            <div className="driver-stat-item">
                                <span className="label">Rating</span>
                                <span className="value">⭐ {driver.rating}</span>
                            </div>
                            <div className="driver-stat-item">
                                <span className="label">Trips</span>
                                <span className="value">{driver.tripsCompleted}</span>
                            </div>
                        </div>

                        <div className="driver-contact-footer">
                            <div className="contact-line">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <span>{driver.email}</span>
                            </div>
                            <div className="contact-line">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span>{driver.phone}</span>
                            </div>
                            {driver.assignedVehicle && (
                                <div className="contact-line">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h2" />
                                        <circle cx="7" cy="17" r="2" />
                                        <circle cx="17" cy="17" r="2" />
                                    </svg>
                                    <span>{driver.assignedVehicle}</span>
                                </div>
                            )}
                        </div>

                        <div className="driver-actions">
                            <button className="btn btn-outline" onClick={() => handleEdit(driver)}>Edit</button>
                            <button className="btn btn-outline btn-danger" onClick={() => handleDelete(driver.id)}>Remove</button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal glass-card" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="title-gradient">{isEditMode ? 'Edit Driver' : 'Add New Driver'}</h3>
                            <button className="modal-close" onClick={resetForm}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                            <div className="form-group">
                                <label className="form-label">License Number</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    value={formData.licenseNumber}
                                    onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Assigned Vehicle</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.assignedVehicle}
                                    onChange={e => setFormData({ ...formData, assignedVehicle: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Driver Status</label>
                                <select
                                    className="form-select"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as Driver['status'] })}
                                >
                                    <option value="available">Available</option>
                                    <option value="on-trip">On Trip</option>
                                    <option value="off-duty">Off Duty</option>
                                </select>
                            </div>
                            <div className="form-actions" style={{ gridColumn: 'span 2', display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {isEditMode ? 'Update Driver' : 'Add Driver'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drivers;
