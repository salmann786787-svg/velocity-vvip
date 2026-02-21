import { useState, useEffect, useCallback } from 'react';
import './Reservations.css';
import ConfirmationPreview from './ConfirmationPreview';
import RateTable from './RateTable';
import type { RateBreakdown } from '../types';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    company?: string;
}

interface Stop {
    id: string;
    location: string;
    isAirport: boolean;
    airline?: string;
    flightNumber?: string;
    terminal?: string;
}

interface Reservation {
    id: number;
    confirmationNumber: string;
    customer: string;
    customerId?: number;
    email: string;
    phone: string;
    pickupDate: string;
    pickupTime: string;
    stops: Stop[];
    vehicle: string;
    passengers: number;
    hours: number;
    total: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    specialInstructions?: string;
    bookedByName?: string;
    bookedByEmail?: string;
    bookedByPhone?: string;
    tripNotes?: string;
    internalNotes?: string;
    addToConfirmation?: boolean;
    rateBreakdown?: RateBreakdown;
    policyType?: 'customer' | 'driver' | 'affiliate' | 'none';
}

interface ReservationsProps {
    initialCreateMode?: boolean;
    onResetCreateMode?: () => void;
}

function Reservations({ initialCreateMode, onResetCreateMode }: ReservationsProps) {
    const [showModal, setShowModal] = useState(false);
    const [modalState, setModalState] = useState<'default' | 'minimized' | 'fullscreen'>('default');
    const [showConfirmationPreview, setShowConfirmationPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [customerMode, setCustomerMode] = useState<'select' | 'create'>('select');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingReservationId, setEditingReservationId] = useState<number | null>(null);

    // Effect to handle initial create mode from creating via Dispatch/Header
    useEffect(() => {
        if (initialCreateMode) {
            setShowModal(true);
            setModalState('default');
            resetForm(); // Ensure clean form

            // Suggest creating new by default or keep selector?
            // Let's reset to defaults
            setCustomerMode('select');

            // Reset the prop in parent so it doesn't reopen if we navigate away and back
            if (onResetCreateMode) {
                onResetCreateMode();
            }
        }
    }, [initialCreateMode, onResetCreateMode]);

    // Mock customer database
    const [customers] = useState<Customer[]>([
        { id: 1, name: 'John Smith', email: 'john@example.com', phone: '(555) 123-4567', company: 'Tech Corp' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '(555) 234-5678', company: 'Creative Agency' },
        { id: 3, name: 'Michael Brown', email: 'michael@example.com', phone: '(555) 345-6789', company: 'Finance Group' }
    ]);

    const [formData, setFormData] = useState({
        // New customer fields
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerCompany: '',
        // Trip details
        pickupDate: '',
        pickupTime: '',
        vehicle: 'Mercedes S-Class',
        passengers: 1,
        hours: 3,
        // Notes and booked by
        specialInstructions: '',
        bookedByName: '',
        bookedByEmail: '',
        bookedByPhone: '',
        tripNotes: '',
        internalNotes: '',
        addToConfirmation: false,
        policyType: 'customer' as 'customer' | 'driver' | 'affiliate' | 'none'
    });

    const [rateTableTotal, setRateTableTotal] = useState(0);
    const [rateBreakdown, setRateBreakdown] = useState<RateBreakdown | null>(null);

    const [stops, setStops] = useState<Stop[]>([
        { id: '1', location: '', isAirport: false },
        { id: '2', location: '', isAirport: false }
    ]);

    const [reservations, setReservations] = useState<Reservation[]>([
        {
            id: 1,
            confirmationNumber: 'RES-8A92B1',
            customer: 'John Smith',
            customerId: 1,
            email: 'john@example.com',
            phone: '(555) 123-4567',
            pickupDate: '2026-02-15',
            pickupTime: '09:00',
            stops: [
                { id: '1', location: 'LAX Airport Terminal 1', isAirport: true, airline: 'American Airlines', flightNumber: 'AA1234' },
                { id: '2', location: 'Beverly Hills Hotel', isAirport: false }
            ],
            vehicle: 'Mercedes S-Class',
            passengers: 2,
            hours: 3,
            total: 450,
            status: 'confirmed'
        },
        {
            id: 2,
            confirmationNumber: 'RES-C7D4E5',
            customer: 'Sarah Johnson',
            customerId: 2,
            email: 'sarah@example.com',
            phone: '(555) 234-5678',
            pickupDate: '2026-02-16',
            pickupTime: '14:30',
            stops: [
                { id: '1', location: 'Downtown LA', isAirport: false },
                { id: '2', location: 'Santa Monica Pier', isAirport: false },
                { id: '3', location: 'Hollywood Sign', isAirport: false }
            ],
            vehicle: 'Cadillac Escalade',
            passengers: 6,
            hours: 4,
            total: 680,
            status: 'pending'
        }
    ]);

    const generateConfirmationNumber = () => {
        return 'RES-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const addStop = () => {
        const newStop: Stop = {
            id: Date.now().toString(),
            location: '',
            isAirport: false
        };
        setStops([...stops, newStop]);
    };

    const removeStop = (id: string) => {
        if (stops.length > 2) {
            setStops(stops.filter(stop => stop.id !== id));
        }
    };

    const updateStop = (id: string, field: keyof Stop, value: any) => {
        setStops(stops.map(stop =>
            stop.id === id ? { ...stop, [field]: value } : stop
        ));
    };

    const handleCustomerSelect = (customerId: number) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setSelectedCustomerId(customerId);
            setFormData({
                ...formData,
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone,
                customerCompany: customer.company || ''
            });
        }
    };

    const handleEdit = (reservation: Reservation) => {
        // Set edit mode
        setIsEditMode(true);
        setEditingReservationId(reservation.id);

        // Populate form with reservation data
        setFormData({
            customerName: reservation.customer,
            customerEmail: reservation.email,
            customerPhone: reservation.phone,
            customerCompany: '',
            pickupDate: reservation.pickupDate,
            pickupTime: reservation.pickupTime,
            vehicle: reservation.vehicle,
            passengers: reservation.passengers,
            hours: reservation.hours,
            specialInstructions: reservation.specialInstructions || '',
            bookedByName: reservation.bookedByName || '',
            bookedByEmail: reservation.bookedByEmail || '',
            bookedByPhone: reservation.bookedByPhone || '',
            tripNotes: reservation.tripNotes || '',
            internalNotes: reservation.internalNotes || '',
            addToConfirmation: reservation.addToConfirmation || false,
            policyType: reservation.policyType || 'customer'
        });

        // Populate stops
        setStops(reservation.stops.length > 0 ? reservation.stops : [
            { id: '1', location: '', isAirport: false },
            { id: '2', location: '', isAirport: false }
        ]);

        // Set customer mode
        if (reservation.customerId) {
            setCustomerMode('select');
            setSelectedCustomerId(reservation.customerId);
        } else {
            setCustomerMode('create');
        }

        // Open modal
        setShowModal(true);
        setModalState('default');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Find existing res to keep its number, or generate new one
        const existingRes = isEditMode && editingReservationId ? reservations.find(r => r.id === editingReservationId) : null;

        const reservationData: Reservation = {
            id: isEditMode && editingReservationId ? editingReservationId : reservations.length + 1,
            confirmationNumber: existingRes ? existingRes.confirmationNumber : generateConfirmationNumber(),
            customer: formData.customerName,
            customerId: customerMode === 'select' ? selectedCustomerId || undefined : undefined,
            email: formData.customerEmail,
            phone: formData.customerPhone,
            pickupDate: formData.pickupDate,
            pickupTime: formData.pickupTime,
            stops: stops.filter(stop => stop.location.trim() !== ''),
            vehicle: formData.vehicle,
            passengers: formData.passengers,
            hours: formData.hours,
            total: rateTableTotal > 0 ? rateTableTotal : formData.hours * 150,
            status: isEditMode ? (existingRes?.status || 'pending') : 'pending',
            specialInstructions: formData.specialInstructions || undefined,
            bookedByName: formData.bookedByName || undefined,
            bookedByEmail: formData.bookedByEmail || undefined,
            bookedByPhone: formData.bookedByPhone || undefined,
            tripNotes: formData.tripNotes,
            internalNotes: formData.internalNotes,
            addToConfirmation: formData.addToConfirmation,
            rateBreakdown: rateBreakdown || undefined,
            policyType: formData.policyType
        };

        // Show preview instead of immediately creating/updating
        setPreviewData({
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            customerPhone: formData.customerPhone,
            pickupDate: formData.pickupDate,
            pickupTime: formData.pickupTime,
            stops: stops.filter(stop => stop.location.trim() !== ''),
            vehicle: formData.vehicle,
            passengers: formData.passengers,
            hours: formData.hours,
            specialInstructions: formData.specialInstructions,
            bookedByName: formData.bookedByName,
            bookedByEmail: formData.bookedByEmail,
            bookedByPhone: formData.bookedByPhone,
            tripNotes: formData.tripNotes,
            internalNotes: formData.internalNotes,
            addToConfirmation: formData.addToConfirmation,
            rateBreakdown: rateBreakdown || undefined,
            policyType: formData.policyType,
            reservationData: reservationData
        });
        setShowConfirmationPreview(true);
    };

    const handleRateUpdate = useCallback((total: number, _: number, breakdown: RateBreakdown) => {
        setRateTableTotal(total);
        setRateBreakdown(breakdown);
    }, []);

    const resetForm = () => {
        setFormData({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            customerCompany: '',
            pickupDate: '',
            pickupTime: '',
            vehicle: 'Mercedes S-Class',
            passengers: 1,
            hours: 3,
            specialInstructions: '',
            bookedByName: '',
            bookedByEmail: '',
            bookedByPhone: '',
            tripNotes: '',
            internalNotes: '',
            addToConfirmation: false,
            policyType: 'customer'
        });
        setStops([
            { id: '1', location: '', isAirport: false },
            { id: '2', location: '', isAirport: false }
        ]);
        setSelectedCustomerId(null);
        setCustomerMode('select');
        setIsEditMode(false);
        setEditingReservationId(null);
        setModalState('default');
        setRateTableTotal(0);
        setRateBreakdown(null);
    };

    const sendConfirmation = (reservation: Reservation) => {
        // Create preview data from reservation
        const preview = {
            customerName: reservation.customer,
            customerEmail: reservation.email,
            customerPhone: reservation.phone,
            pickupDate: reservation.pickupDate,
            pickupTime: reservation.pickupTime,
            stops: reservation.stops,
            vehicle: reservation.vehicle,
            passengers: reservation.passengers,
            hours: reservation.hours,
            specialInstructions: reservation.specialInstructions,
            bookedByName: reservation.bookedByName,
            bookedByEmail: reservation.bookedByEmail,
            bookedByPhone: reservation.bookedByPhone,
            tripNotes: reservation.tripNotes,
            internalNotes: reservation.internalNotes,
            addToConfirmation: reservation.addToConfirmation,
            rateBreakdown: reservation.rateBreakdown,
            policyType: reservation.policyType || 'customer',
            reservationData: reservation
        };
        setPreviewData(preview);
        setShowConfirmationPreview(true);
    };

    const handleConfirmSend = () => {
        if (previewData && previewData.reservationData) {
            if (isEditMode && editingReservationId) {
                // Update existing reservation
                setReservations(reservations.map(res =>
                    res.id === editingReservationId ? previewData.reservationData : res
                ));
                alert(`Reservation #${previewData.reservationData.confirmationNumber} updated and confirmation email sent to ${previewData.customerEmail}`);
            } else {
                // Add new reservation
                setReservations([previewData.reservationData, ...reservations]);
                alert(`Reservation #${previewData.reservationData.confirmationNumber} created! Confirmation email sent to ${previewData.customerEmail}`);
            }
            setShowModal(false);
            resetForm();
        }
        setShowConfirmationPreview(false);
        setPreviewData(null);
    };

    const updateStatus = (id: number, status: Reservation['status']) => {
        setReservations(reservations.map(res =>
            res.id === id ? { ...res, status } : res
        ));
    };

    const [filterStatus, setFilterStatus] = useState<Reservation['status'] | 'all'>('all');

    const filteredReservations = reservations.filter(res => {
        if (filterStatus === 'all') return true;
        return res.status === filterStatus;
    });

    // Helper for modal styles based on state
    const getModalStyle = () => {
        switch (modalState) {
            case 'fullscreen':
                return {
                    width: '98vw',
                    height: '98vh',
                    maxWidth: 'none',
                    borderRadius: '0'
                };
            case 'minimized':
                return {
                    display: 'none' // Or handle differently if we want a taskbar concept, but 'none' for now or minimal
                };
            default:
                return {
                    width: '90vw',
                    maxWidth: '1200px',
                    height: 'auto',
                    maxHeight: '90vh'
                };
        }
    };

    return (
        <div className="reservations fade-in">
            {/* Navigation & Filters */}
            <div className="reservations-nav">
                <div className="filters-group">
                    <button className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All Reservations</button>
                    <button className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>Pending</button>
                    <button className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`} onClick={() => setFilterStatus('confirmed')}>Confirmed</button>
                    <button className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`} onClick={() => setFilterStatus('completed')}>Completed</button>
                </div>
                <div className="search-group">
                    <input type="search" className="form-input" style={{ width: '280px' }} placeholder="Search Reservations..." />
                    <button className="btn btn-primary" onClick={() => { setShowModal(true); setModalState('default'); }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" />
                            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" />
                        </svg>
                        <span>NEW</span>
                    </button>
                </div>
            </div>

            {/* Minimized Tray */}
            {modalState === 'minimized' && showModal && (
                <div className="minimized-tray">
                    <div className="minimized-item" onClick={() => setModalState('default')}>
                        <span className="minimized-title">Active Form: {isEditMode ? 'Editing...' : 'New Reservation'}</span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="modal-control-btn" title="Restore" onClick={(e) => { e.stopPropagation(); setModalState('default'); }}>
                                ❐
                            </button>
                            <button className="modal-control-btn" title="Maximize" onClick={(e) => { e.stopPropagation(); setModalState('fullscreen'); }}>
                                ☐
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reservations Grid */}
            <div className="reservations-grid">
                {filteredReservations.map((reservation) => (
                    <div key={reservation.id} className="reservation-card glass-card">
                        <div className="reservation-card-header">
                            <div className="res-identity">
                                <span className="res-client-name">{reservation.customer}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span className="res-id-tag">ID: {reservation.id.toString().padStart(6, '0')}</span>
                                    <span className="res-confirmation-tag">{reservation.confirmationNumber}</span>
                                </div>
                            </div>
                            <div className="res-status-dot">
                                <div className="glow-point" style={{
                                    background: reservation.status === 'confirmed' ? 'var(--color-success)' :
                                        reservation.status === 'pending' ? 'var(--color-warning)' :
                                            reservation.status === 'completed' ? 'var(--color-primary)' : 'var(--color-danger)'
                                }}></div>
                                {reservation.status}
                            </div>
                        </div>

                        <div className="res-main-details">
                            <div className="res-detail-item">
                                <span className="res-label">Pickup</span>
                                <span className="res-value">{reservation.pickupDate} @ {reservation.pickupTime}</span>
                            </div>
                            <div className="res-detail-item">
                                <span className="res-label">Vehicle</span>
                                <span className="res-value">{reservation.vehicle}</span>
                            </div>
                            <div className="res-detail-item">
                                <span className="res-label">Passengers</span>
                                <span className="res-value">{reservation.passengers} PAX</span>
                            </div>
                            <div className="res-detail-item">
                                <span className="res-label">Duration</span>
                                <span className="res-value">{reservation.hours} Hours</span>
                            </div>
                        </div>

                        <div className="res-itinerary">
                            <span className="res-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Itinerary</span>
                            {reservation.stops.map((stop, index) => (
                                <div key={stop.id} className="itinerary-step">
                                    <div className="step-marker" style={{
                                        borderColor: index === 0 ? 'var(--color-primary)' :
                                            index === reservation.stops.length - 1 ? 'var(--color-success)' : 'var(--color-border)'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div className="step-content">
                                        <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{stop.location}</p>
                                        {stop.isAirport && (
                                            <p style={{ fontSize: '0.7rem', color: 'var(--color-accent)', fontWeight: 800 }}>
                                                ✈️ {stop.airline} {stop.flightNumber}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="res-footer">
                            <span className="res-price">${reservation.total.toLocaleString()}</span>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn btn-sm btn-outline" onClick={() => sendConfirmation(reservation)}>Confirmation</button>
                                <button className="btn btn-sm btn-outline" onClick={() => handleEdit(reservation)}>Edit</button>
                                {reservation.status === 'pending' && (
                                    <button className="btn btn-sm btn-primary" onClick={() => updateStatus(reservation.id, 'confirmed')}>Confirm</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Enhanced Modal */}
            {showModal && modalState !== 'minimized' && (
                <div className="modal-overlay" onClick={() => { /* Don't close on background click */ }}>
                    <div className="modal glass-card" style={{ ...getModalStyle(), display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h3 className="title-gradient" style={{ margin: 0 }}>{isEditMode ? 'Edit Reservation' : 'Create New Reservation'}</h3>
                                {isEditMode && <span className="badge badge-primary">{reservations.find(r => r.id === editingReservationId)?.confirmationNumber}</span>}
                            </div>
                            <div className="window-controls">
                                <button className="modal-control-btn" title="Minimize" onClick={() => setModalState('minimized')} style={{ paddingBottom: '8px' }}>_</button>
                                <button className="modal-control-btn" title={modalState === 'fullscreen' ? 'Restore' : 'Maximize'} onClick={() => setModalState(modalState === 'fullscreen' ? 'default' : 'fullscreen')}>
                                    {modalState === 'fullscreen' ? '❐' : '☐'}
                                </button>
                                <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>&times;</button>
                            </div>
                        </div>

                        <div className="modal-content-scrollable">
                            <form onSubmit={handleSubmit} className="reservation-form">
                                {/* Top Section: Customer & Core Info in Columns */}
                                <div className="form-grid">

                                    {/* Left Column: Customer */}
                                    <div className="section-panel">
                                        <h4 className="section-title">Passenger Information</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                                            <button type="button" className={`btn ${customerMode === 'select' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setCustomerMode('select')}>Select Existing</button>
                                            <button type="button" className={`btn ${customerMode === 'create' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setCustomerMode('create')}>New Customer</button>
                                        </div>

                                        {customerMode === 'select' ? (
                                            <div className="form-group-custom">
                                                <label className="form-label">Search Customers</label>
                                                <select className="form-select" value={selectedCustomerId || ''} onChange={(e) => handleCustomerSelect(parseInt(e.target.value))} required>
                                                    <option value="">-- Select a customer --</option>
                                                    {customers.map(customer => (
                                                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="new-customer-fields">
                                                <div className="form-group-custom">
                                                    <label className="form-label">Full Name</label>
                                                    <input type="text" className="form-input" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} required />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div className="form-group-custom">
                                                        <label className="form-label">Phone</label>
                                                        <input type="tel" className="form-input" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} required />
                                                    </div>
                                                    <div className="form-group-custom">
                                                        <label className="form-label">Email</label>
                                                        <input type="email" className="form-input" value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} required />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: Asset */}
                                    <div className="section-panel">
                                        <h4 className="section-title">Logistics & Asset</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="form-group-custom">
                                                <label className="form-label">Pickup Date</label>
                                                <input type="date" className="form-input" value={formData.pickupDate} onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })} required />
                                            </div>
                                            <div className="form-group-custom">
                                                <label className="form-label">Pickup Time</label>
                                                <input type="time" className="form-input" value={formData.pickupTime} onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div className="form-group-custom">
                                            <label className="form-label">Vehicle Assignment</label>
                                            <select className="form-select" value={formData.vehicle} onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}>
                                                <option>Mercedes S-Class</option>
                                                <option>Cadillac Escalade</option>
                                                <option>Mercedes Sprinter</option>
                                                <option>Rolls-Royce Ghost</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="form-group-custom">
                                                <label className="form-label">PAX</label>
                                                <input type="number" className="form-input" value={formData.passengers} onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })} min="1" required />
                                            </div>
                                            <div className="form-group-custom">
                                                <label className="form-label">Duration (Hrs)</label>
                                                <input type="number" className="form-input" value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) })} min="1" required />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Width: Itinerary */}
                                <div className="itinerary-protocol">
                                    <h5 className="section-title">ITINERARY PROTOCOL</h5>
                                    <div>
                                        {stops.map((stop, index) => (
                                            <div key={stop.id} className="stop-entry-item">
                                                <div className="stop-marker">{index + 1}</div>

                                                <div className="stop-inputs">
                                                    <div className="form-group-custom" style={{ marginBottom: 0 }}>
                                                        <input type="text" className="form-input" value={stop.location} onChange={(e) => updateStop(stop.id, 'location', e.target.value)} required={index === 0} placeholder={index === 0 ? "Pickup Address or Airport Code" : "Dropoff Address"} />
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                                                        <label className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', opacity: 0.8, cursor: 'pointer' }}>
                                                            <input type="checkbox" checked={stop.isAirport} onChange={(e) => updateStop(stop.id, 'isAirport', e.target.checked)} />
                                                            <span>Airport Location</span>
                                                        </label>
                                                        {stop.isAirport && (
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <input type="text" className="form-input" style={{ width: '100px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} value={stop.airline || ''} onChange={(e) => updateStop(stop.id, 'airline', e.target.value)} placeholder="Airline" />
                                                                <input type="text" className="form-input" style={{ width: '80px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} value={stop.flightNumber || ''} onChange={(e) => updateStop(stop.id, 'flightNumber', e.target.value)} placeholder="Flt #" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="stop-actions">
                                                    {stops.length > 2 && index !== 0 && index !== stops.length - 1 && (
                                                        <button type="button" className="remove-stop-btn" onClick={() => removeStop(stop.id)} title="Remove Stop">✕</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginLeft: '3.5rem', marginTop: '1rem' }} onClick={addStop}>
                                        <span style={{ fontSize: '1.2rem', marginRight: '0.2rem' }}>+</span> Add Waypoint
                                    </button>
                                </div>

                                {/* Trip Notes & Internal Instructions */}
                                <div className="section-panel" style={{ marginTop: '0' }}>
                                    <h4 className="section-title">Trip Notes & Internal Instructions</h4>

                                    <div className="form-group-custom" style={{ marginBottom: '1rem' }}>
                                        <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Applicable Policy Protocol</label>
                                        <select
                                            className="form-input"
                                            value={formData.policyType}
                                            onChange={(e) => setFormData({ ...formData, policyType: e.target.value as any })}
                                            style={{ width: '100%', maxWidth: '300px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-primary)' }}
                                        >
                                            <option value="customer">Customer / Client Policy</option>
                                            <option value="driver">Driver / Chauffeur Policy</option>
                                            <option value="affiliate">Affiliate / Partner Policy</option>
                                            <option value="none">No Policy / Exclude</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className="form-group-custom">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <label className="form-label" style={{ marginBottom: 0 }}>Trip Notes</label>
                                                <label className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.addToConfirmation}
                                                        onChange={(e) => setFormData({ ...formData, addToConfirmation: e.target.checked })}
                                                    />
                                                    <span style={{ color: 'var(--color-primary)' }}>Add to Confirmation</span>
                                                </label>
                                            </div>
                                            <textarea
                                                className="form-input"
                                                rows={3}
                                                value={formData.tripNotes}
                                                onChange={(e) => setFormData({ ...formData, tripNotes: e.target.value })}
                                                placeholder="Notes visible to client..."
                                                style={{ resize: 'vertical' }}
                                            ></textarea>
                                        </div>
                                        <div className="form-group-custom">
                                            <label className="form-label">Internal / Dispatch Notes</label>
                                            <textarea
                                                className="form-input"
                                                rows={3}
                                                value={formData.internalNotes}
                                                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                                                placeholder="Private notes for dispatch only..."
                                                style={{ resize: 'vertical', background: 'rgba(255, 50, 50, 0.05)', borderColor: 'rgba(255, 50, 50, 0.2)' }}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Check Rates & Submit */}
                                <div className="section-panel" style={{ marginTop: '0' }}>
                                    <h4 className="section-title">Rate Calculation</h4>
                                    <RateTable
                                        onUpdateTotal={handleRateUpdate}
                                        hours={formData.hours}
                                        passengers={formData.passengers}
                                    />
                                </div>

                                <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    <button type="button" className="btn btn-outline" style={{ minWidth: '120px' }} onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }}>{isEditMode ? 'Save Changes' : 'Review & Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmationPreview && previewData && (
                <ConfirmationPreview
                    reservation={previewData}
                    onClose={() => setShowConfirmationPreview(false)}
                    onSend={handleConfirmSend}
                />
            )}
        </div>
    );
}

export default Reservations;
