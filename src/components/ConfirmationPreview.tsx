import React, { useState, useEffect } from 'react';
import './Dispatch.css';
import './ConfirmationPreview.css';
import type { Reservation, Stop, RateBreakdown } from '../types';

interface TemplateSettings {
    businessName: string;
    tagline: string;
    logoUrl: string;
    headerGradientStart: string;
    headerGradientEnd: string;
    primaryColor: string;
    footerMessage: string;
    contactPhone: string;
    contactEmail: string;
    contactWebsite: string;
    policyCustomer?: string;
    policyDriver?: string;
    policyAffiliate?: string;
}

interface ConfirmationPreviewProps {
    reservation: {
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        pickupDate: string;
        pickupTime: string;
        stops: Stop[];
        vehicle: string;
        passengers: number;
        hours: number;
        specialInstructions?: string;
        bookedByName?: string;
        bookedByEmail?: string;
        bookedByPhone?: string;
        tripNotes?: string;
        addToConfirmation?: boolean;
        rateBreakdown?: RateBreakdown;
        policyType?: 'customer' | 'driver' | 'affiliate' | 'none';
        reservationData?: Reservation;
    };
    onClose: () => void;
    onSend: () => void;
}

const ConfirmationPreview: React.FC<ConfirmationPreviewProps> = ({ reservation, onClose, onSend }) => {
    const [showLog, setShowLog] = useState(false);
    const [showRates, setShowRates] = useState(false);
    const [settings, setSettings] = useState<TemplateSettings>({
        businessName: 'VELOCITY VVIP',
        tagline: 'Premium Limousine Services',
        logoUrl: '',
        headerGradientStart: '#B453E9',
        headerGradientEnd: '#00D4FF',
        primaryColor: '#B453E9',
        footerMessage: 'Your chauffeur will arrive 15 minutes prior to your scheduled pickup time. If you have any questions, please contact us at support@velocityvvip.com',
        contactPhone: '(800) VVIP-LIMO',
        contactEmail: 'reservations@velocityvvip.com',
        contactWebsite: 'www.velocityvvip.com'
    });

    useEffect(() => {
        const stored = localStorage.getItem('confirmationTemplateSettings');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const defaultData = {
                    businessName: 'VELOCITY VVIP',
                    tagline: 'Premium Limousine Services',
                    logoUrl: '',
                    headerGradientStart: '#B453E9',
                    headerGradientEnd: '#00D4FF',
                    primaryColor: '#B453E9',
                    footerMessage: 'Your chauffeur will arrive 15 minutes prior to your scheduled pickup time. If you have any questions, please contact us at support@velocityvvip.com',
                    contactPhone: '(800) VVIP-LIMO',
                    contactEmail: 'reservations@velocityvvip.com',
                    contactWebsite: 'www.velocityvvip.com',
                    policyCustomer: 'Example Customer Policy: Cancellations within 24 hours will be charged at 50%. No-shows will be charged in full.',
                    policyDriver: 'Example Chauffeur Protocol: Chauffeurs must be in full suit, arrive 15 mins early, and assist with luggage.',
                    policyAffiliate: 'Example Affiliate Terms: All trips must be fulfilled by vehicles less than 3 years old. Chauffeurs must not solicit client.'
                };
                setSettings({ ...defaultData, ...parsed });
            } catch (e) {
                console.error('Error parsing stored settings', e);
            }
        }
    }, []);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getPolicyText = () => {
        switch (reservation.policyType) {
            case 'customer': return settings.policyCustomer;
            case 'driver': return settings.policyDriver;
            case 'affiliate': return settings.policyAffiliate;
            default: return null;
        }
    };

    const policyText = getPolicyText();

    // Mock Confirmation Logs (Visual consistency with Dispatch)
    const confirmationLogs: any[] = [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend();
    };

    // Helper to get formatted total
    const getTotal = () => {
        if (reservation.rateBreakdown?.grandTotal) {
            return `$${reservation.rateBreakdown.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        // Fallback estimate
        return `$${(reservation.hours * 150).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };


    const getConfirmationNumber = () => {
        return reservation.reservationData?.confirmationNumber || 'NEW';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal glass-card modal-large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3 className="title-gradient">
                            {showLog ? 'Confirmation Log' : 'Send Confirmation'}
                            <span style={{ opacity: 0.6, fontSize: '0.8em', marginLeft: '0.5rem' }}>#{getConfirmationNumber()}</span>
                        </h3>
                        {!showLog && (
                            <button
                                className="btn-text"
                                onClick={() => setShowLog(true)}
                                style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                [View Log]
                            </button>
                        )}
                        {showLog && (
                            <button
                                className="btn-text"
                                onClick={() => setShowLog(false)}
                                style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                [Back to Send]
                            </button>
                        )}
                    </div>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                {showLog ? (
                    <div className="log-view" style={{ padding: '1rem', minHeight: '300px' }}>
                        {/* Reusing dispatch-table class from Dispatch.css */}
                        <table className="dispatch-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Recipient</th>
                                    <th>Sent By</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {confirmationLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="font-mono">{log.date}</td>
                                        <td className="font-mono">{log.time}</td>
                                        <td>{log.recipient}</td>
                                        <td>{log.sentBy}</td>
                                        <td>
                                            <span className={`status-badge ${log.status === 'Sent' ? 'status-dispatched' : 'status-cancelled'}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ padding: '0 0.5rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                        {/* Left Column: Summary */}
                        <div className="confirmation-summary section-panel modal-embedded-preview" style={{ height: '70vh', overflowY: 'auto', padding: '0', background: '#e0e0e0', borderRadius: '12px' }}>
                            <div className="email-preview" style={{ borderRadius: '0', minHeight: '100%', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                                {/* Email Header */}
                                <div className="email-header" style={{ background: `linear-gradient(135deg, ${settings.headerGradientStart}, ${settings.headerGradientEnd})` }}>
                                    <div className="email-logo">
                                        {settings.logoUrl ? (
                                            <div className="uploaded-logo">
                                                <img src={settings.logoUrl} alt={settings.businessName} />
                                            </div>
                                        ) : (
                                            <div style={{ background: 'rgba(255,255,255,0.2)', width: 64, height: 64, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h2" />
                                                    <circle cx="7" cy="17" r="2" />
                                                    <circle cx="17" cy="17" r="2" />
                                                </svg>
                                            </div>
                                        )}
                                        <h1>{settings.businessName}</h1>
                                        <p className="tagline">{settings.tagline}</p>
                                    </div>
                                </div>

                                {/* Confirmation Badge */}
                                <div className="confirmation-badge">
                                    <div className="check-icon" style={{ background: settings.headerGradientStart }}>✓</div>
                                    <h2>RESERVATION CONFIRMED</h2>
                                    <p>Your booking has been successfully scheduled</p>
                                </div>

                                {/* Customer Details */}
                                <div className="email-section">
                                    <h3>👤 Passenger Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="label">Name</span>
                                            <span className="value">{reservation.customerName}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Email</span>
                                            <span className="value">{reservation.customerEmail}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Phone</span>
                                            <span className="value">{reservation.customerPhone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Contact - Conditional Render */}
                                {reservation.bookedByName && (
                                    <div className="email-section" style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem', marginTop: '-0.5rem' }}>
                                        <h3>📋 Booking Contact</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <span className="label">Name</span>
                                                <span className="value">{reservation.bookedByName}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Email</span>
                                                <span className="value">{reservation.bookedByEmail || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Phone</span>
                                                <span className="value">{reservation.bookedByPhone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Trip Details */}
                                <div className="email-section" style={{ background: '#fafafa' }}>
                                    <h3>🚗 Trip Details</h3>
                                    <div className="trip-highlights">
                                        <div className="highlight-card">
                                            <span className="label">Pickup Date</span>
                                            <span className="value">{formatDate(reservation.pickupDate)}</span>
                                        </div>
                                        <div className="highlight-card">
                                            <span className="label">Pickup Time</span>
                                            <span className="value">{formatTime(reservation.pickupTime)}</span>
                                        </div>
                                        <div className="highlight-card">
                                            <span className="label">Vehicle Type</span>
                                            <span className="value">{reservation.vehicle}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Itinerary */}
                                <div className="email-section">
                                    <h3>📍 Itinerary</h3>
                                    <div className="itinerary">
                                        {reservation.stops.map((stop, index) => (
                                            <div key={stop.id} className="itinerary-stop">
                                                <div className="stop-indicator">
                                                    <div className={`stop-icon ${index === 0 ? 'pickup' : index === reservation.stops.length - 1 ? 'destination' : 'intermediate'}`}>
                                                        {index === 0 ? 'A' : index === reservation.stops.length - 1 ? 'B' : index}
                                                    </div>
                                                    {index < reservation.stops.length - 1 && <div className="stop-line" />}
                                                </div>
                                                <div className="stop-details">
                                                    <div className="stop-label">
                                                        {index === 0 ? 'Pickup Location' : index === reservation.stops.length - 1 ? 'Drop-off Location' : `Stop ${index}`}
                                                    </div>
                                                    <div className="stop-location">{stop.location}</div>
                                                    {stop.isAirport && stop.airline && (
                                                        <div className="flight-info">
                                                            ✈️ {stop.airline} {stop.flightNumber}
                                                            {stop.terminal && ` [T${stop.terminal}]`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="email-section" style={{ background: '#fafafa' }}>
                                    <h3>ℹ️ Additional Details</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="label">Passengers</span>
                                            <span className="value">{reservation.passengers} PAX</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Duration</span>
                                            <span className="value">{reservation.hours} Hours</span>
                                        </div>
                                        <div className="detail-item full-width" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                                            <label className="checkbox-container" style={{ fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input type="checkbox" checked={showRates} onChange={(e) => setShowRates(e.target.checked)} />
                                                <span style={{ fontWeight: 'bold' }}>Show Full Rate Breakdown</span>
                                            </label>

                                            {showRates ? (
                                                reservation.rateBreakdown ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', width: '100%', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                                        {reservation.rateBreakdown.flatRate > 0 && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span>{reservation.rateBreakdown.flatRateLabel}</span>
                                                                <span>${reservation.rateBreakdown.flatRate.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        {reservation.rateBreakdown.hourlyTotal > 0 && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span>{reservation.rateBreakdown.hourlyRateLabel} ({reservation.rateBreakdown.hourlyHours}h @ ${reservation.rateBreakdown.hourlyRate})</span>
                                                                <span>${reservation.rateBreakdown.hourlyTotal.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        {reservation.rateBreakdown.extraStopsTotal > 0 && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span>{reservation.rateBreakdown.extraStopLabel} ({reservation.rateBreakdown.extraStopCount})</span>
                                                                <span>${reservation.rateBreakdown.extraStopsTotal.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        {reservation.rateBreakdown.sanitizingFee > 0 && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span>{reservation.rateBreakdown.sanitizingFeeLabel}</span>
                                                                <span>${reservation.rateBreakdown.sanitizingFee.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        {reservation.rateBreakdown.otWaitTime > 0 && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span>{reservation.rateBreakdown.otWaitTimeLabel}</span>
                                                                <span>${reservation.rateBreakdown.otWaitTime.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>{reservation.rateBreakdown.stdGratLabel} ({reservation.rateBreakdown.stdGratPercent}%)</span>
                                                            <span>${reservation.rateBreakdown.primaryGratTotal.toFixed(2)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>{reservation.rateBreakdown.stcSurchLabel} ({reservation.rateBreakdown.stcSurchPercent}%)</span>
                                                            <span>${reservation.rateBreakdown.stcSurchTotal.toFixed(2)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>{reservation.rateBreakdown.taxLabel} ({reservation.rateBreakdown.stdTaxPercent}%)</span>
                                                            <span>${reservation.rateBreakdown.primaryTaxTotal.toFixed(2)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '0.5rem', marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                            <span>Grand Total</span>
                                                            <span>${reservation.rateBreakdown.grandTotal.toFixed(2)}</span>
                                                        </div>
                                                        {reservation.rateBreakdown.deposit > 0 && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                                                                <span>Paid / Deposit</span>
                                                                <span>-${reservation.rateBreakdown.deposit.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                            <span>Total Due</span>
                                                            <span>${reservation.rateBreakdown.totalDue.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="detail-item">
                                                        <span className="value price">{getTotal()}</span>
                                                        <span style={{ fontSize: '0.8rem', color: '#888', display: 'block' }}>(Breakdown unavailable)</span>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="detail-item">
                                                    <span className="value price">{getTotal()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Trip Notes - Conditional Render */}
                                {reservation.addToConfirmation && reservation.tripNotes && (
                                    <div className="email-section">
                                        <h3>📝 Trip Notes</h3>
                                        <div className="instructions-box" style={{ background: '#fff', border: '1px solid #eee' }}>
                                            {reservation.tripNotes}
                                        </div>
                                    </div>
                                )}

                                {/* Special Instructions */}
                                {reservation.specialInstructions && (
                                    <div className="email-section">
                                        <h3>⚠️ Special Instructions</h3>
                                        <div className="instructions-box">
                                            {reservation.specialInstructions}
                                        </div>
                                    </div>
                                )}

                                {/* Policy Section - Conditional Render */}
                                {policyText && (
                                    <div className="email-section">
                                        <h3>📜 Policy & Terms</h3>
                                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '0.9rem', color: '#555', background: '#fafafa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                            {policyText}
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="email-footer">
                                    <p style={{ fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.8 }}>
                                        {settings.footerMessage}
                                    </p>
                                    <div className="footer-contact">
                                        <p>{settings.contactPhone}</p>
                                        <p>{settings.contactEmail}</p>
                                        <p>{settings.contactWebsite}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Email Settings */}
                        <div className="confirmation-settings">
                            <div className="section-panel">
                                <div className="section-title">
                                    <span>CONFIGURATION</span>
                                </div>
                                <div className="form-group-custom">
                                    <label className="form-label">Send From</label>
                                    <select className="dispatch-input">
                                        <option>dispatch@velocity-vvip.com</option>
                                        <option>confirmations@velocity-vvip.com</option>
                                    </select>
                                </div>

                                <div className="form-group-custom">
                                    <label className="form-label">Template</label>
                                    <select className="dispatch-input">
                                        <option>Standard Confirmation</option>
                                        <option>Trip Sheet (Driver)</option>
                                        <option>Affiliate Confirmation</option>
                                    </select>
                                </div>
                            </div>

                            <div className="section-panel">
                                <div className="section-title" style={{ marginBottom: '1rem' }}>
                                    <span>RECIPIENTS</span>
                                </div>
                                <div className="recipients-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {/* Passenger */}
                                    <div className="recipient-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }} />
                                        <span className="status-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', width: '40px', textAlign: 'center', flexShrink: 0 }}>PAX</span>
                                        <input
                                            className="dispatch-input"
                                            style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                                            defaultValue={reservation.customerEmail || ''}
                                            placeholder="Passenger Email"
                                        />
                                    </div>
                                    {/* Billing */}
                                    <div className="recipient-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <input type="checkbox" style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }} />
                                        <span className="status-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', width: '40px', textAlign: 'center', flexShrink: 0 }}>BIL</span>
                                        <input
                                            className="dispatch-input"
                                            style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                                            defaultValue={reservation.bookedByEmail || 'billing@corporate.com'}
                                            placeholder="Billing Email"
                                        />
                                    </div>
                                    {/* Driver */}
                                    <div className="recipient-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <input type="checkbox" style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }} />
                                        <span className="status-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', width: '40px', textAlign: 'center', flexShrink: 0 }}>DRV</span>
                                        <input
                                            className="dispatch-input"
                                            style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                                            placeholder="Driver Email"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group-custom" style={{ marginTop: '1.5rem' }}>
                                <label className="form-label">Personal Message</label>
                                <textarea
                                    className="dispatch-input"
                                    rows={3}
                                    placeholder="Add a personal note to this email..."
                                    style={{ resize: 'none' }}
                                ></textarea>
                            </div>

                            <div className="form-options" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginTop: '1rem', marginBottom: '1.5rem' }}>
                                <label className="checkbox-label" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    <input type="checkbox" style={{ marginRight: '0.5rem' }} /> Hide Rates & Charges
                                </label>
                                <label className="checkbox-label" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    <input type="checkbox" defaultChecked style={{ marginRight: '0.5rem' }} /> Attach PDF
                                </label>
                                <label className="checkbox-label" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    <input type="checkbox" defaultChecked style={{ marginRight: '0.5rem' }} /> Include Assistance Offer
                                </label>
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
                                    Send Later
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Send Now
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ConfirmationPreview;
