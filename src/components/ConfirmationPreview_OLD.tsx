import React, { useState, useEffect } from 'react';
import './ConfirmationPreview.css';

interface Stop {
    id: string;
    location: string;
    isAirport: boolean;
    airline?: string;
    flightNumber?: string;
    terminal?: string;
}

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

import type { RateBreakdown } from '../types';

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
    };
    onClose: () => void;
    onSend: () => void;
}

const ConfirmationPreview: React.FC<ConfirmationPreviewProps> = ({ reservation, onClose, onSend }) => {
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

    const [showRates, setShowRates] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('confirmationTemplateSettings');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Merge with default values to ensure new fields (like policies) exist
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
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const estimatedTotal = reservation.rateBreakdown ? reservation.rateBreakdown.grandTotal : (reservation.hours * 150);

    const getPolicyText = () => {
        switch (reservation.policyType) {
            case 'customer': return settings.policyCustomer;
            case 'driver': return settings.policyDriver;
            case 'affiliate': return settings.policyAffiliate;
            default: return null; // 'none' or undefined
        }
    };

    const policyText = getPolicyText();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="confirmation-modal glass-card fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="title-gradient">Reservation Summary</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label className="checkbox-container" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showRates}
                                onChange={(e) => setShowRates(e.target.checked)}
                            />
                            <span>Show Full Rate Breakdown</span>
                        </label>
                        <button className="modal-close" onClick={onClose}>&times;</button>
                    </div>
                </div>

                <div className="preview-container">
                    <div className="email-preview">
                        {/* Email Header */}
                        <div
                            className="email-header"
                            style={{
                                background: `linear-gradient(135deg, ${settings.headerGradientStart}, ${settings.headerGradientEnd})`
                            }}
                        >
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
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5s-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.9-.2-1.6.1-1.8.6l-.7 1.3c-.2.3 0 .7.4.9l7.1 2.9-3.9 3.9-2.4-.7c-.2-.1-.4 0-.5.2l-.6.6c-.2.2-.2.5 0 .7l4 2.1 2.1 4c.2.2.5.2.7 0l.6-.6c.2-.1.3-.3.2-.5l-.7-2.4 3.9-3.9 2.9 7.1c.2.4.6.6.9.4l1.3-.7c.5-.2.8-.9.6-1.8z" />
                                                    </svg>
                                                    {stop.airline} {stop.flightNumber}
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
                                {showRates ? (
                                    reservation.rateBreakdown ? (
                                        <div className="detail-item full-width" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                                            <span className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>Rate Breakdown</span>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', width: '100%' }}>
                                                {/* Flat Rate */}
                                                {reservation.rateBreakdown.flatRate > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{reservation.rateBreakdown.flatRateLabel}</span>
                                                        <span>${reservation.rateBreakdown.flatRate.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {/* Hourly */}
                                                {reservation.rateBreakdown.hourlyTotal > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{reservation.rateBreakdown.hourlyRateLabel} ({reservation.rateBreakdown.hourlyHours}h @ ${reservation.rateBreakdown.hourlyRate})</span>
                                                        <span>${reservation.rateBreakdown.hourlyTotal.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {/* Extra Stops */}
                                                {reservation.rateBreakdown.extraStopsTotal > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{reservation.rateBreakdown.extraStopLabel} ({reservation.rateBreakdown.extraStopCount})</span>
                                                        <span>${reservation.rateBreakdown.extraStopsTotal.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {/* Sanitizing */}
                                                {reservation.rateBreakdown.sanitizingFee > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{reservation.rateBreakdown.sanitizingFeeLabel}</span>
                                                        <span>${reservation.rateBreakdown.sanitizingFee.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {/* OT/Wait */}
                                                {reservation.rateBreakdown.otWaitTime > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{reservation.rateBreakdown.otWaitTimeLabel}</span>
                                                        <span>${reservation.rateBreakdown.otWaitTime.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {/* Grat */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{reservation.rateBreakdown.stdGratLabel} ({reservation.rateBreakdown.stdGratPercent}%)</span>
                                                    <span>${reservation.rateBreakdown.primaryGratTotal.toFixed(2)}</span>
                                                </div>
                                                {/* STC */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{reservation.rateBreakdown.stcSurchLabel} ({reservation.rateBreakdown.stcSurchPercent}%)</span>
                                                    <span>${reservation.rateBreakdown.stcSurchTotal.toFixed(2)}</span>
                                                </div>
                                                {/* Tax */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{reservation.rateBreakdown.taxLabel} ({reservation.rateBreakdown.stdTaxPercent}%)</span>
                                                    <span>${reservation.rateBreakdown.primaryTaxTotal.toFixed(2)}</span>
                                                </div>
                                                {/* Grand Total */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '0.5rem', marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    <span>Grand Total</span>
                                                    <span>${reservation.rateBreakdown.grandTotal.toFixed(2)}</span>
                                                </div>
                                                {/* Deposit */}
                                                {reservation.rateBreakdown.deposit > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                                                        <span>Paid / Deposit</span>
                                                        <span>-${reservation.rateBreakdown.deposit.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {/* Due */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                                    <span>Total Due</span>
                                                    <span>${reservation.rateBreakdown.totalDue.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="detail-item">
                                            <span className="label">Estimated Cost</span>
                                            <span className="value price">${estimatedTotal.toLocaleString()}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#888', display: 'block' }}>(Breakdown unavailable)</span>
                                        </div>
                                    )
                                ) : (
                                    <div className="detail-item">
                                        <span className="label">Estimated Cost</span>
                                        <span className="value price">${estimatedTotal.toLocaleString()}</span>
                                    </div>
                                )}
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
                            <div style={{ marginTop: '3rem', opacity: 0.5, fontSize: '0.7rem', letterSpacing: '0.2em', fontWeight: 800 }}>
                                {settings.businessName.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="preview-actions">
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={onSend}>
                        Send Confirmation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPreview;
