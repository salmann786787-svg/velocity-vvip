import { useState } from 'react';
import './Fleet.css';

interface Vehicle {
    id: number;
    name: string;
    plate: string;
    type: string;
    capacity: number;
    year: number;
    color: string;
    status: 'available' | 'in-service' | 'maintenance' | 'offline';
    mileage: number;
    lastService: string;
    nextService: string;
    driver: string | null;
}

function Fleet() {
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        plate: '',
        type: 'Luxury Sedan',
        capacity: 4,
        year: new Date().getFullYear(),
        color: 'Black',
        status: 'available' as Vehicle['status'],
        mileage: 0,
        lastService: '',
        nextService: '',
    });

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const updateStatus = (id: number, status: Vehicle['status']) => {
        setVehicles(vehicles.map(v => v.id === id ? { ...v, status } : v));
    };

    const handleEdit = (vehicle: Vehicle) => {
        setIsEditMode(true);
        setEditingVehicleId(vehicle.id);
        setFormData({
            name: vehicle.name,
            plate: vehicle.plate,
            type: vehicle.type,
            capacity: vehicle.capacity,
            year: vehicle.year,
            color: vehicle.color,
            status: vehicle.status,
            mileage: vehicle.mileage,
            lastService: vehicle.lastService,
            nextService: vehicle.nextService,
        });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            setVehicles(vehicles.filter(v => v.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && editingVehicleId) {
            setVehicles(vehicles.map(v =>
                v.id === editingVehicleId
                    ? { ...v, ...formData }
                    : v
            ));
        } else {
            const newVehicle: Vehicle = {
                id: vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1,
                ...formData,
                driver: null
            };
            setVehicles([newVehicle, ...vehicles]);
        }
        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setIsEditMode(false);
        setEditingVehicleId(null);
        setFormData({
            name: '',
            plate: '',
            type: 'Luxury Sedan',
            capacity: 4,
            year: new Date().getFullYear(),
            color: 'Black',
            status: 'available',
            mileage: 0,
            lastService: '',
            nextService: '',
        });
    };

    return (
        <div className="fleet fade-in">
            <div className="fleet-controls" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <button className="btn btn-primary" onClick={() => { setIsEditMode(false); setShowModal(true); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ marginRight: '8px' }}>
                        <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" />
                        <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" />
                    </svg>
                    ADD VEHICLE
                </button>
            </div>

            {/* Strategic Metrics */}
            <div className="fleet-stats">
                <div className="stat-item total">
                    <span className="stat-label">Total Vehicles</span>
                    <h4 className="stat-value">{vehicles.length}</h4>
                </div>
                <div className="stat-item available">
                    <span className="stat-label">Available</span>
                    <h4 className="stat-value">{vehicles.filter(v => v.status === 'available').length}</h4>
                </div>
                <div className="stat-item in-service">
                    <span className="stat-label">In Service</span>
                    <h4 className="stat-value">{vehicles.filter(v => v.status === 'in-service').length}</h4>
                </div>
                <div className="stat-item maintenance">
                    <span className="stat-label">Maintenance</span>
                    <h4 className="stat-value">{vehicles.filter(v => v.status === 'maintenance').length}</h4>
                </div>
            </div>

            {/* Asset Registry Grid */}
            <div className="vehicles-grid">
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="vehicle-card glass-card">
                        <div className="vehicle-header">
                            <div className="vehicle-title">
                                <h4 className="title-gradient">{vehicle.name}</h4>
                                <span className="vehicle-plate">{vehicle.plate}</span>
                            </div>
                            <span className={`badge badge-${vehicle.status === 'available' ? 'success' :
                                vehicle.status === 'in-service' ? 'primary' :
                                    'warning'
                                }`}>
                                <div className="glow-point"></div>
                                {vehicle.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="vehicle-details-grid">
                            <div className="detail-block">
                                <span className="detail-label">Vehicle Type</span>
                                <span className="detail-value">{vehicle.type}</span>
                            </div>
                            <div className="detail-block">
                                <span className="detail-label">Capacity</span>
                                <span className="detail-value">{vehicle.capacity} PAX</span>
                            </div>
                            <div className="detail-block">
                                <span className="detail-label">Mileage</span>
                                <span className="detail-value">{vehicle.mileage.toLocaleString()} mi</span>
                            </div>
                            <div className="detail-block">
                                <span className="detail-label">Assigned Driver</span>
                                <span className="detail-value">{vehicle.driver || 'No Driver'}</span>
                            </div>
                        </div>

                        <div className="status-manager">
                            <button
                                className={`status-btn available ${vehicle.status === 'available' ? 'active' : ''}`}
                                onClick={() => updateStatus(vehicle.id, 'available')}
                            >
                                Available
                            </button>
                            <button
                                className={`status-btn in-service ${vehicle.status === 'in-service' ? 'active' : ''}`}
                                onClick={() => updateStatus(vehicle.id, 'in-service')}
                            >
                                In Use
                            </button>
                            <button
                                className={`status-btn maintenance ${vehicle.status === 'maintenance' ? 'active' : ''}`}
                                onClick={() => updateStatus(vehicle.id, 'maintenance')}
                            >
                                Service
                            </button>
                        </div>

                        <div className="vehicle-actions">
                            <button className="btn btn-outline" onClick={() => handleEdit(vehicle)}>
                                Edit
                            </button>
                            <button className="btn btn-outline" style={{ border: '1px solid var(--color-danger)', color: 'var(--color-danger)' }} onClick={() => handleDelete(vehicle.id)}>
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Asset Provisioning Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal glass-card" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="title-gradient">{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                            <button className="modal-close" onClick={resetForm}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="vehicle-form" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="form-group">
                                <label className="form-label">Vehicle Name</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">License Plate</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        value={formData.plate}
                                        onChange={e => setFormData({ ...formData, plate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vehicle Type</label>
                                    <select
                                        className="form-select"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="Luxury Sedan">Luxury Sedan</option>
                                        <option value="Luxury SUV">Luxury SUV</option>
                                        <option value="Executive Sedan">Executive Sedan</option>
                                        <option value="Premium SUV">Premium SUV</option>
                                        <option value="Luxury Van">Luxury Van</option>
                                        <option value="Ultra-Luxury Sedan">Ultra-Luxury Sedan</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Capacity (PAX)</label>
                                    <input
                                        type="number"
                                        required
                                        className="form-input"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year</label>
                                    <input
                                        type="number"
                                        required
                                        className="form-input"
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-md">
                                <div className="form-group">
                                    <label className="form-label">Mileage (Miles)</label>
                                    <input
                                        type="number"
                                        required
                                        className="form-input"
                                        value={formData.mileage}
                                        onChange={e => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vehicle Status</label>
                                    <select
                                        className="form-select"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as Vehicle['status'] })}
                                    >
                                        <option value="available">Available</option>
                                        <option value="in-service">In Service</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="offline">Offline</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {isEditMode ? 'Update Vehicle' : 'Add Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Fleet;
