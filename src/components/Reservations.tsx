import { useState, useEffect, useCallback } from 'react';
import './Reservations.css';
import ConfirmationPreview from './ConfirmationPreview';
import RateTable from './RateTable';
import type { RateBreakdown, Customer, Stop, Reservation } from '../types';
import {
    validateReservationForm,
    generateUniqueConfirmationNumber,
    saveDraftToLocalStorage,
    loadDraftFromLocalStorage,
    clearDraftFromLocalStorage,
    hasUnsavedChanges,
    formatPhoneNumber,
    parseReservationPromptAI
} from '../utils';
import { ReservationAPI } from '../services/api';

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
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
    const [initialFormState, setInitialFormState] = useState<any>(null);

    // AI Feature States
    const [aiPrompt, setAiPrompt] = useState('');
    const [isParsingAI, setIsParsingAI] = useState(false);
    const [aiKey, setAiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [showAiPanel, setShowAiPanel] = useState(false);

    // Mock customer database
    const [customers] = useState<Customer[]>([]);

    const [formData, setFormData] = useState({
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
        policyType: 'customer' as 'customer' | 'driver' | 'affiliate' | 'none'
    });

    const [rateTableTotal, setRateTableTotal] = useState(0);
    const [rateBreakdown, setRateBreakdown] = useState<RateBreakdown | null>(null);

    const [stops, setStops] = useState<Stop[]>([
        { id: '1', location: '', isAirport: false },
        { id: '2', location: '', isAirport: false }
    ]);

    // Load reservations from API on mount
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadReservations = async () => {
        try {
            setIsLoading(true);
            const data = await ReservationAPI.getAll();
            setReservations(data);
        } catch (error) {
            console.error('Failed to load reservations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReservations();
    }, []);

    // Removed localStorage save effect

    // Effect to handle initial create mode
    useEffect(() => {
        if (initialCreateMode) {
            setShowModal(true);
            setModalState('default');
            resetForm();
            setCustomerMode('select');

            if (onResetCreateMode) {
                onResetCreateMode();
            }
        }
    }, [initialCreateMode, onResetCreateMode]);

    // Check for draft on mount
    useEffect(() => {
        const draft = loadDraftFromLocalStorage();
        if (draft && !showModal) {
            const loadDraft = window.confirm('You have an unsaved draft reservation. Would you like to continue editing it?');
            if (loadDraft) {
                setFormData(draft.formData || formData);
                setStops(draft.stops || stops);
                setCustomerMode(draft.customerMode || 'select');
                setSelectedCustomerId(draft.selectedCustomerId || null);
                setShowModal(true);
            } else {
                clearDraftFromLocalStorage();
            }
        }
    }, []);

    // Auto-save draft
    useEffect(() => {
        if (showModal && !isEditMode) {
            const timeoutId = setTimeout(() => {
                saveDraftToLocalStorage({
                    formData,
                    stops,
                    customerMode,
                    selectedCustomerId
                });
            }, 2000);

            return () => clearTimeout(timeoutId);
        }
    }, [formData, stops, customerMode, selectedCustomerId, showModal, isEditMode]);

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
        setIsEditMode(true);
        setEditingReservationId(reservation.id);

        setFormData({
            customerName: reservation.customer,
            customerEmail: reservation.email,
            customerPhone: reservation.phone,
            customerCompany: reservation.company || '',
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

        setStops(reservation.stops.length > 0 ? reservation.stops : [
            { id: '1', location: '', isAirport: false },
            { id: '2', location: '', isAirport: false }
        ]);

        setRateBreakdown(reservation.rateBreakdown || null);

        if (reservation.customerId) {
            setCustomerMode('select');
            setSelectedCustomerId(reservation.customerId);
        } else {
            setCustomerMode('create');
        }

        setInitialFormState({
            formData: {
                customerName: reservation.customer,
                customerEmail: reservation.email,
                customerPhone: reservation.phone,
                customerCompany: reservation.company || '',
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
            },
            stops: reservation.stops
        });

        setShowModal(true);
        setModalState('default');
        setValidationErrors([]);
    };

    const handleAiParse = async () => {
        if (!aiKey) {
            alert('Please enter a Gemini API Key to use this feature.');
            return;
        }
        if (!aiPrompt) return;

        setIsParsingAI(true);
        localStorage.setItem('gemini_api_key', aiKey);
        try {
            const parsed = await parseReservationPromptAI(aiPrompt, aiKey);
            setCustomerMode('create');
            setFormData(prev => ({
                ...prev,
                customerName: parsed.customerName || prev.customerName,
                customerEmail: parsed.customerEmail || prev.customerEmail,
                customerPhone: parsed.customerPhone || prev.customerPhone,
                customerCompany: parsed.customerCompany || prev.customerCompany,
                pickupDate: parsed.pickupDate || prev.pickupDate,
                pickupTime: parsed.pickupTime || prev.pickupTime,
                vehicle: parsed.vehicle || prev.vehicle,
                passengers: parsed.passengers || prev.passengers,
                hours: parsed.hours || prev.hours,
                specialInstructions: parsed.specialInstructions || prev.specialInstructions,
                bookedByName: parsed.bookedByName || prev.bookedByName,
                bookedByEmail: parsed.bookedByEmail || prev.bookedByEmail,
                bookedByPhone: parsed.bookedByPhone || prev.bookedByPhone,
                tripNotes: parsed.tripNotes || prev.tripNotes
            }));

            if (parsed.stops && parsed.stops.length > 0) {
                const newStops = parsed.stops.map((s: any, i: number) => ({
                    id: String(i + 1),
                    location: s.location || '',
                    isAirport: s.isAirport || false,
                    airline: s.airline || '',
                    flightNumber: s.flightNumber || ''
                }));
                while (newStops.length < 2) {
                    newStops.push({ id: String(newStops.length + 1), location: '', isAirport: false, airline: '', flightNumber: '' });
                }
                setStops(newStops);
            }

            setAiPrompt('');
            setShowAiPanel(false);
        } catch (error: any) {
            alert(error.message || 'Failed to parse AI prompt');
        } finally {
            setIsParsingAI(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validateReservationForm(
            formData.customerName,
            formData.customerEmail,
            formData.customerPhone,
            formData.pickupDate,
            formData.pickupTime,
            stops,
            formData.vehicle
        );

        if (!validation.valid) {
            setValidationErrors(validation.errors);
            const modalContent = document.querySelector('.modal-content-scrollable');
            if (modalContent) {
                modalContent.scrollTop = 0;
            }
            return;
        }

        setValidationErrors([]);

        const existingRes = isEditMode && editingReservationId ? reservations.find(r => r.id === editingReservationId) : null;

        const now = new Date().toISOString();
        const reservationData: Reservation = {
            id: isEditMode && editingReservationId ? editingReservationId : (Math.max(0, ...reservations.map(r => r.id)) + 1),
            confirmationNumber: existingRes ? existingRes.confirmationNumber : generateUniqueConfirmationNumber(reservations),
            customer: formData.customerName,
            customerId: customerMode === 'select' ? selectedCustomerId || undefined : undefined,
            email: formData.customerEmail,
            phone: formatPhoneNumber(formData.customerPhone),
            company: formData.customerCompany || undefined,
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
            tripNotes: formData.tripNotes || undefined,
            internalNotes: formData.internalNotes || undefined,
            addToConfirmation: formData.addToConfirmation,
            rateBreakdown: rateBreakdown || undefined,
            policyType: formData.policyType,
            createdAt: existingRes?.createdAt || now,
            updatedAt: now
        };

        setPreviewData({
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            customerPhone: formatPhoneNumber(formData.customerPhone),
            customerCompany: formData.customerCompany,
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
        const defaultFormData = {
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
            policyType: 'customer' as 'customer' | 'driver' | 'affiliate' | 'none'
        };

        setFormData(defaultFormData);
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
        setValidationErrors([]);
        setInitialFormState(null);
        clearDraftFromLocalStorage();
    };

    const sendConfirmation = (reservation: Reservation) => {
        const preview = {
            customerName: reservation.customer,
            customerEmail: reservation.email,
            customerPhone: reservation.phone,
            customerCompany: reservation.company,
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
            reservationData: reservation,
            isResend: true
        };
        setPreviewData(preview);
        setShowConfirmationPreview(true);
    };

    const handleConfirmSend = async (autoConfirm: boolean = false) => {
        if (previewData && previewData.reservationData) {
            try {
                const updatedStatus = autoConfirm ? 'confirmed' : previewData.reservationData.status;

                let savedReservation;
                if (isEditMode && editingReservationId) {
                    // It's an update to existing DB record
                    savedReservation = await ReservationAPI.update(editingReservationId, {
                        ...previewData.reservationData,
                        status: updatedStatus
                    });

                    if (previewData.isResend) {
                        alert(`Confirmation email resent to ${previewData.customerEmail}`);
                    } else {
                        alert(`Reservation #${previewData.reservationData.confirmationNumber} updated! Confirmation email sent to ${previewData.customerEmail}`);
                    }
                } else {
                    // It's a brand new record for the DB
                    savedReservation = await ReservationAPI.create({
                        ...previewData.reservationData,
                        // remove the temporary frontend id
                        id: undefined,
                        status: updatedStatus
                    });
                    alert(`Reservation #${savedReservation.confirmationNumber} created! Confirmation email sent to ${previewData.customerEmail}`);
                }

                await loadReservations(); // Reload from server
                setShowModal(false);
                resetForm();
            } catch (error: any) {
                alert(`Error saving reservation: ${error.message}`);
                return;
            }
        }
        setShowConfirmationPreview(false);
        setPreviewData(null);
    };

    const updateStatus = async (id: number, status: Reservation['status']) => {
        try {
            await ReservationAPI.update(id, { status });
            await loadReservations();
        } catch (error: any) {
            alert(`Error updating status: ${error.message}`);
        }
    };

    const handleCloseModal = () => {
        if (initialFormState) {
            const currentState = { formData, stops };
            if (hasUnsavedChanges(currentState, initialFormState)) {
                setShowCloseConfirmation(true);
                return;
            }
        } else if (formData.customerName || formData.customerEmail || stops.some(s => s.location)) {
            setShowCloseConfirmation(true);
            return;
        }

        setShowModal(false);
        resetForm();
    };

    const confirmClose = () => {
        setShowCloseConfirmation(false);
        setShowModal(false);
        resetForm();
    };

    const cancelClose = () => {
        setShowCloseConfirmation(false);
    };

    const [filterStatus, setFilterStatus] = useState<Reservation['status'] | 'all'>('all');

    const filteredReservations = reservations.filter(res => {
        if (filterStatus === 'all') return true;
        return res.status === filterStatus;
    });

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
                    display: 'none'
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
            {showCloseConfirmation && (
                <div className="modal-overlay" style={{ zIndex: 10000 }}>
                    <div className="glass-card" style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Unsaved Changes</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                            You have unsaved changes. Are you sure you want to close? All changes will be lost.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={cancelClose}>Cancel</button>
                            <button className="btn btn-primary" style={{ background: 'var(--color-danger)' }} onClick={confirmClose}>
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            <div className="reservations-grid">
                {isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                        Loading reservations...
                    </div>
                ) : filteredReservations.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                        No reservations found.
                    </div>
                ) : (
                    filteredReservations.map((reservation) => (
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
                    ))
                )}
            </div>

            {showModal && modalState !== 'minimized' && (
                <div className="modal-overlay">
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
                                <button className="modal-close" onClick={handleCloseModal}>&times;</button>
                            </div>
                        </div>

                        <div className="modal-content-scrollable">
                            {validationErrors.length > 0 && (
                                <div style={{
                                    background: 'rgba(255, 50, 50, 0.1)',
                                    border: '1px solid rgba(255, 50, 50, 0.3)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <h4 style={{ color: 'var(--color-danger)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                                        Please fix the following errors:
                                    </h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--color-danger)' }}>
                                        {validationErrors.map((error, index) => (
                                            <li key={index} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="reservation-form">
                                {!isEditMode && (
                                    <div className="section-panel" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, hsla(280, 100%, 70%, 0.1) 0%, hsla(230, 20%, 10%, 0.8) 100%)', borderColor: 'hsla(280, 100%, 70%, 0.3)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showAiPanel ? '1.5rem' : '0' }}>
                                            <h4 className="section-title" style={{ margin: 0, color: 'var(--color-primary-light)' }}>
                                                ✨ AI Text Auto-Parser
                                            </h4>
                                            <button type="button" className="btn btn-sm btn-primary" onClick={() => setShowAiPanel(!showAiPanel)}>
                                                {showAiPanel ? 'Close AI' : 'Autofill with Text'}
                                            </button>
                                        </div>
                                        {showAiPanel && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                                <div className="form-group-custom">
                                                    <label className="form-label">Gemini AI Key</label>
                                                    <input type="password" placeholder="AI API Key (Saved locally)" className="form-input" value={aiKey} onChange={e => setAiKey(e.target.value)} />
                                                </div>
                                                <div className="form-group-custom">
                                                    <label className="form-label">Client Message / Email Content</label>
                                                    <textarea
                                                        className="form-input"
                                                        style={{ minHeight: '120px', resize: 'vertical' }}
                                                        placeholder="e.g. Need an S-Class for John Doe (john@example.com) tomorrow at 5PM from LAX to Beverly Hills Hotel..."
                                                        value={aiPrompt}
                                                        onChange={e => setAiPrompt(e.target.value)}
                                                    />
                                                </div>
                                                <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleAiParse} disabled={isParsingAI || !aiPrompt || !aiKey}>
                                                    {isParsingAI ? 'Parsing with AI...' : '✨ Generate Fields'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="form-grid">
                                    <div className="section-panel">
                                        <h4 className="section-title">Passenger Information</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                                            <button type="button" className={`btn ${customerMode === 'select' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => {
                                                setCustomerMode('select');
                                                if (customerMode === 'create') {
                                                    setFormData({
                                                        ...formData,
                                                        customerName: '',
                                                        customerEmail: '',
                                                        customerPhone: '',
                                                        customerCompany: ''
                                                    });
                                                    setSelectedCustomerId(null);
                                                }
                                            }}>Select Existing</button>
                                            <button type="button" className={`btn ${customerMode === 'create' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => {
                                                setCustomerMode('create');
                                                setSelectedCustomerId(null);
                                            }}>New Customer</button>
                                        </div>

                                        {customerMode === 'select' ? (
                                            <div className="form-group-custom">
                                                <label className="form-label">Search Customers</label>
                                                <select className="form-select" value={selectedCustomerId || ''} onChange={(e) => handleCustomerSelect(parseInt(e.target.value))} required>
                                                    <option value="">-- Select a customer --</option>
                                                    {customers.map(customer => (
                                                        <option key={customer.id} value={customer.id}>{customer.name} {customer.company ? `(${customer.company})` : ''}</option>
                                                    ))}
                                                </select>
                                                {selectedCustomerId && (
                                                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.85rem' }}>
                                                        <div style={{ marginBottom: '0.5rem' }}><strong>Name:</strong> {formData.customerName}</div>
                                                        <div style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {formData.customerEmail}</div>
                                                        <div style={{ marginBottom: '0.5rem' }}><strong>Phone:</strong> {formData.customerPhone}</div>
                                                        {formData.customerCompany && <div><strong>Company:</strong> {formData.customerCompany}</div>}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="new-customer-fields">
                                                <div className="form-group-custom">
                                                    <label className="form-label">Full Name *</label>
                                                    <input type="text" className="form-input" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} required />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div className="form-group-custom">
                                                        <label className="form-label">Phone *</label>
                                                        <input type="tel" className="form-input" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} required placeholder="(555) 123-4567" />
                                                    </div>
                                                    <div className="form-group-custom">
                                                        <label className="form-label">Email *</label>
                                                        <input type="email" className="form-input" value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} required />
                                                    </div>
                                                </div>
                                                <div className="form-group-custom">
                                                    <label className="form-label">Company (Optional)</label>
                                                    <input type="text" className="form-input" value={formData.customerCompany} onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="section-panel">
                                        <h4 className="section-title">Booking Contact (Optional)</h4>
                                        <div className="new-customer-fields">
                                            <div className="form-group-custom">
                                                <label className="form-label">Booked By Name</label>
                                                <input type="text" className="form-input" value={formData.bookedByName} onChange={(e) => setFormData({ ...formData, bookedByName: e.target.value })} placeholder="Assistant or Agent Name" />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div className="form-group-custom">
                                                    <label className="form-label">Booked By Phone</label>
                                                    <input type="tel" className="form-input" value={formData.bookedByPhone} onChange={(e) => setFormData({ ...formData, bookedByPhone: e.target.value })} placeholder="(555) 123-4567" />
                                                </div>
                                                <div className="form-group-custom">
                                                    <label className="form-label">Booked By Email</label>
                                                    <input type="email" className="form-input" value={formData.bookedByEmail} onChange={(e) => setFormData({ ...formData, bookedByEmail: e.target.value })} placeholder="agent@company.com" />
                                                </div>
                                            </div>
                                            <div className="form-group-custom">
                                                <label className="form-label">Special Instructions / Requests</label>
                                                <textarea className="form-input" rows={2} value={formData.specialInstructions} onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })} placeholder="e.g. Still water, child seat..."></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="section-panel">
                                        <h4 className="section-title">Logistics & Asset</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="form-group-custom">
                                                <label className="form-label">Pickup Date *</label>
                                                <input type="date" className="form-input" value={formData.pickupDate} onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })} required />
                                            </div>
                                            <div className="form-group-custom">
                                                <label className="form-label">Pickup Time *</label>
                                                <input type="time" className="form-input" value={formData.pickupTime} onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div className="form-group-custom">
                                            <label className="form-label">Vehicle Assignment *</label>
                                            <select className="form-select" value={formData.vehicle} onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })} required>
                                                <option>Mercedes S-Class</option>
                                                <option>Cadillac Escalade</option>
                                                <option>Mercedes Sprinter</option>
                                                <option>Rolls-Royce Ghost</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="form-group-custom">
                                                <label className="form-label">PAX *</label>
                                                <input type="number" className="form-input" value={formData.passengers} onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })} min="1" required />
                                            </div>
                                            <div className="form-group-custom">
                                                <label className="form-label">Duration (Hrs) *</label>
                                                <input type="number" className="form-input" value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) })} min="1" required />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="itinerary-protocol">
                                    <h5 className="section-title">ITINERARY PROTOCOL *</h5>
                                    <div>
                                        {stops.map((stop, index) => (
                                            <div key={stop.id} className="stop-entry-item">
                                                <div className="stop-marker">{index + 1}</div>

                                                <div className="stop-inputs">
                                                    <div className="form-group-custom" style={{ marginBottom: 0 }}>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={stop.location}
                                                            onChange={(e) => updateStop(stop.id, 'location', e.target.value)}
                                                            required={index < 2}
                                                            placeholder={index === 0 ? "Pickup Address or Airport Code *" : index === stops.length - 1 ? "Dropoff Address *" : "Waypoint Address"}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                                                        <label className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', opacity: 0.8, cursor: 'pointer' }}>
                                                            <input type="checkbox" checked={stop.isAirport} onChange={(e) => updateStop(stop.id, 'isAirport', e.target.checked)} />
                                                            <span>Airport Location</span>
                                                        </label>
                                                        {stop.isAirport && (
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <input type="text" className="form-input" style={{ width: '120px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} value={stop.airline || ''} onChange={(e) => updateStop(stop.id, 'airline', e.target.value)} placeholder="Airline" />
                                                                <input type="text" className="form-input" style={{ width: '100px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} value={stop.flightNumber || ''} onChange={(e) => updateStop(stop.id, 'flightNumber', e.target.value)} placeholder="Flight #" />
                                                                <input type="text" className="form-input" style={{ width: '80px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} value={stop.terminal || ''} onChange={(e) => updateStop(stop.id, 'terminal', e.target.value)} placeholder="Terminal" />
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

                                <div className="section-panel" style={{ marginTop: '0' }}>
                                    <h4 className="section-title">Rate Calculation</h4>
                                    <RateTable
                                        onUpdateTotal={handleRateUpdate}
                                        hours={formData.hours}
                                        passengers={formData.passengers}
                                        initialBreakdown={rateBreakdown}
                                    />
                                </div>

                                <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    <button type="button" className="btn btn-outline" style={{ minWidth: '120px' }} onClick={handleCloseModal}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }}>{isEditMode ? 'Review Changes' : 'Review & Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {
                showConfirmationPreview && previewData && (
                    <ConfirmationPreview
                        reservation={previewData}
                        onClose={() => {
                            setShowConfirmationPreview(false);
                            setPreviewData(null);
                        }}
                        onSend={handleConfirmSend}
                    />
                )
            }
        </div >
    );
}

export default Reservations;
