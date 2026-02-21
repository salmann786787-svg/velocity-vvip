import React, { useState } from 'react';
import './Dispatch.css'; // Importing Dispatch styles for the modal
import type { Reservation, Stop, RateBreakdown } from '../types';

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

    const getPickupLocation = () => {
        return reservation.stops && reservation.stops.length > 0 ? reservation.stops[0].location : '';
    };

    const getDropoffLocation = () => {
        return reservation.stops && reservation.stops.length > 1 ? reservation.stops[reservation.stops.length - 1].location : 'As Directed';
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
                    <form onSubmit={handleSubmit} style={{ padding: '0 0.5rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                        {/* Left Column: Summary */}
                        <div className="confirmation-summary section-panel" style={{ height: 'fit-content' }}>
                            <div className="section-title">
                                <span>TRIP SUMMARY</span>
                            </div>
                            <div className="summary-list" style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="text-secondary">Date:</span>
                                    <span className="font-bold">{reservation.pickupDate}</span>
                                </div>
                                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="text-secondary">Time:</span>
                                    <span className="font-bold">{reservation.pickupTime}</span>
                                </div>
                                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="text-secondary">Vehicle:</span>
                                    <span className="font-bold">{reservation.vehicle}</span>
                                </div>
                                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="text-secondary">Passenger:</span>
                                    <span className="font-bold">{reservation.customerName}</span>
                                </div>
                                <div className="summary-divider" style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                                <div className="summary-row">
                                    <span className="text-secondary" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem' }}>PICKUP</span>
                                    <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{getPickupLocation()}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="text-secondary" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem' }}>DROPOFF</span>
                                    <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{getDropoffLocation()}</span>
                                </div>
                                <div className="summary-divider" style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                                    <span>Total Estimate:</span>
                                    <span className="font-bold">{getTotal()}</span>
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
