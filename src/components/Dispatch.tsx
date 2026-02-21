import { useState, useRef, useEffect } from 'react';
import './Dispatch.css';

interface DispatchRow {
    id: number;
    passenger: string;
    serviceType: 'To Airport' | 'From Airport' | 'Hourly/As Directed' | 'Point-to-Point';
    confNumber: string;
    status: 'Dispatched' | 'Done' | 'Cancelled' | 'Customer In' | 'Live' | 'Unassigned';
    notes?: string;
    pickupDate: string;
    pickupTime: string;
    type: 'INH' | 'FOT'; // In-House / Farm-Out
    pickupLocation: string;
    dropoffLocation: string;
    driver?: string;
    vehicleType: string;
    carId?: string;
    pax: number;
    lug: number;
}



function Dispatch() {
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-02-16T12:00:00')); // Default to match screenshot date for context

    // Mock Data based on the reference image + extra testing data
    const [dispatchData, setDispatchData] = useState<DispatchRow[]>([]);

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Dispatched': return 'status-dispatched';
            case 'Done': return 'status-done';
            case 'Cancelled': return 'status-cancelled';
            case 'Customer In': return 'status-live';
            default: return '';
        }
    };

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; reservationId: number | null }>({
        visible: false,
        x: 0,
        y: 0,
        reservationId: null
    });

    useEffect(() => {
        const handleClick = () => {
            if (contextMenu.visible) {
                setContextMenu({ ...contextMenu, visible: false });
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [contextMenu]);

    const handleContextMenu = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            reservationId: id
        });
    };

    // State for Modals
    const [editModal, setEditModal] = useState<{ visible: boolean; reservation: DispatchRow | null }>({ visible: false, reservation: null });
    const [assignModal, setAssignModal] = useState<{ visible: boolean; reservationId: number | null }>({ visible: false, reservationId: null });
    const [confirmModal, setConfirmModal] = useState<{ visible: boolean; reservation: DispatchRow | null; showLog: boolean }>({ visible: false, reservation: null, showLog: false });

    // Mock Drivers Data (In a real app, this would come from a Context or API)
    const driversList: any[] = [];

    // Mock Confirmation Logs
    const confirmationLogs: any[] = [];

    const handleRowAction = (action: string, id: number | null) => {
        if (!id) return;
        setContextMenu({ ...contextMenu, visible: false });

        const reservation = dispatchData.find(r => r.id === id);
        if (!reservation) return;

        switch (action) {
            case 'edit':
                setEditModal({ visible: true, reservation: { ...reservation } });
                break;
            case 'assign':
                setAssignModal({ visible: true, reservationId: id });
                break;
            case 'confirm':
                setConfirmModal({ visible: true, reservation: { ...reservation }, showLog: false });
                break;
            case 'copy':
                const text = `
Reservation #${reservation.confNumber}
Passenger: ${reservation.passenger}
Pickup: ${reservation.pickupDate} @ ${reservation.pickupTime}
Location: ${reservation.pickupLocation} -> ${reservation.dropoffLocation}
Vehicle: ${reservation.vehicleType}
Driver: ${reservation.driver || 'Unassigned'}
`.trim();
                navigator.clipboard.writeText(text).then(() => {
                    alert('Reservation details copied to clipboard!');
                });
                break;
            case 'cancel':
                if (window.confirm(`Are you sure you want to cancel reservation #${reservation.confNumber}?`)) {
                    setDispatchData(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' as const } : r)); // 'as const' helps TS infer the literal type
                }
                break;
        }
    };

    const handleEditSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editModal.reservation) {
            setDispatchData(prev => prev.map(r => r.id === editModal.reservation!.id ? editModal.reservation! : r));
            setEditModal({ visible: false, reservation: null });
        }
    };

    const handleSendConfirmation = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call an API
        alert(`Note: In a real environment, this would send an email for ${confirmModal.reservation?.confNumber}`);
        // Typically reset modal state
        setConfirmModal({ visible: false, reservation: null, showLog: false });
    };

    const handleAssignDriver = (driverName: string) => {
        if (assignModal.reservationId) {
            setDispatchData(prev => prev.map(r =>
                r.id === assignModal.reservationId
                    ? { ...r, driver: driverName, status: 'Dispatched' as const }
                    : r
            ));
            setAssignModal({ visible: false, reservationId: null });
        }
    };

    return (
        <div className="dispatch-container fade-in">
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0 0 1rem 0.5rem' }}>Daily Dispatch</h2>

            {/* ... (Controls remain the same) ... */}
            <div className="dispatch-controls glass-panel">
                <div className="control-group left">
                    {/* View toggle removed */}
                </div>

                <div className="control-group center">
                    <button className="icon-btn" onClick={() => changeDate(-1)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <div
                        className="date-display"
                        onClick={() => {
                            if (dateInputRef.current) {
                                try {
                                    dateInputRef.current.showPicker();
                                } catch (e) {
                                    // Fallback for older browsers
                                    dateInputRef.current.click();
                                }
                            }
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="icon-calendar">📅</span>
                        {formatDate(currentDate)}
                        <input
                            ref={dateInputRef}
                            type="date"
                            value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`}
                            onChange={(e) => {
                                if (e.target.value) {
                                    const [y, m, d] = e.target.value.split('-').map(Number);
                                    // Set to noon to avoid timezone rolling issues
                                    setCurrentDate(new Date(y, m - 1, d, 12, 0, 0));
                                }
                            }}
                            style={{
                                visibility: 'hidden',
                                position: 'absolute',
                                width: 0,
                                height: 0,
                                bottom: 0,
                                left: '50%'
                            }}
                        />
                    </div>
                    <button className="icon-btn" onClick={() => changeDate(1)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>

                <div className="control-group right">
                    <div className="quick-access">
                        <label className="checkbox-label">
                            <input type="checkbox" defaultChecked /> New/Live
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" defaultChecked /> Farm-Out
                        </label>
                    </div>
                    <div className="search-bar">
                        <input type="text" placeholder="Quick Search..." />
                        <button className="btn-go">GO</button>
                    </div>
                </div>
            </div>

            {/* Main Grid View */}
            <div className="dispatch-grid-wrapper glass-panel">
                <table className="dispatch-table">
                    <thead>
                        <tr>
                            <th style={{ width: '140px' }}>Passenger Name</th>
                            <th style={{ width: '120px' }}>Svc Type</th>
                            <th style={{ width: '80px' }}>Conf#</th>
                            <th style={{ width: '110px' }}>Status</th>
                            <th style={{ width: '50px' }}>Note</th>
                            <th style={{ width: '100px' }}>PU Date</th>
                            <th style={{ width: '90px' }}>PU Time</th>
                            <th style={{ width: '60px' }}>Type</th>
                            <th style={{ width: '250px' }}>PU Location</th>
                            <th style={{ width: '250px' }}>DO Location</th>
                            <th style={{ width: '100px' }}>Driver</th>
                            <th style={{ width: '80px' }}>Veh</th>
                            <th style={{ width: '80px' }}>Car</th>
                            <th style={{ width: '50px' }}>Pax#</th>
                            <th style={{ width: '50px' }}>Lug</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dispatchData.map((row) => (
                            <tr
                                key={row.id}
                                className={`dispatch-row ${getStatusColor(row.status)}`}
                                onContextMenu={(e) => handleContextMenu(e, row.id)}
                                onDoubleClick={() => handleRowAction('edit', row.id)}
                            >
                                <td className="font-bold">{row.passenger}</td>
                                <td className="text-secondary">{row.serviceType}</td>
                                <td className="font-mono">{row.confNumber}</td>
                                <td>
                                    <span className={`status-badge ${getStatusColor(row.status)}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td>{row.notes && <span className="note-icon">📝</span>}</td>
                                <td className="font-mono">{row.pickupDate}</td>
                                <td className="font-mono font-bold text-accent">{row.pickupTime}</td>
                                <td>
                                    <span className={`type-badge ${row.type === 'INH' ? 'inh' : 'fot'}`}>
                                        {row.type}
                                    </span>
                                </td>
                                <td className="location-cell" title={row.pickupLocation}>{row.pickupLocation}</td>
                                <td className="location-cell" title={row.dropoffLocation}>{row.dropoffLocation}</td>
                                <td className="font-bold">{row.driver}</td>
                                <td>{row.vehicleType}</td>
                                <td>{row.carId && <span className="car-badge">{row.carId}</span>}</td>
                                <td className="text-center">{row.pax}</td>
                                <td className="text-center">{row.lug}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div className="menu-item" onClick={() => handleRowAction('edit', contextMenu.reservationId)}>
                        <span>✏️</span> Edit Reservation
                    </div>
                    <div className="menu-item" onClick={() => handleRowAction('assign', contextMenu.reservationId)}>
                        <span>👤</span> Assign Driver
                    </div>
                    <div className="menu-item" onClick={() => handleRowAction('confirm', contextMenu.reservationId)}>
                        <span>📧</span> Send Confirmation
                    </div>
                    <div className="menu-item" onClick={() => handleRowAction('copy', contextMenu.reservationId)}>
                        <span>📋</span> Copy Details
                    </div>
                    <div className="menu-divider"></div>
                    <div className="menu-item text-danger" onClick={() => handleRowAction('cancel', contextMenu.reservationId)}>
                        <span>🚫</span> Cancel Trip
                    </div>
                </div>
            )}

            {/* Edit Modal - Premium Redesign */}
            {editModal.visible && editModal.reservation && (
                <div className="modal-overlay" onClick={() => setEditModal({ visible: false, reservation: null })}>
                    <div className="modal glass-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="title-gradient">Edit Reservation #{editModal.reservation.confNumber}</h3>
                            <button className="modal-close" onClick={() => setEditModal({ visible: false, reservation: null })}>&times;</button>
                        </div>

                        <form onSubmit={handleEditSave} style={{ padding: '0 0.5rem' }}>
                            <div className="section-panel">
                                <div className="section-title">
                                    <span>TRIP DETAILS</span>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group-custom">
                                        <label className="form-label">Passenger Name</label>
                                        <input
                                            className="dispatch-input"
                                            value={editModal.reservation.passenger}
                                            onChange={e => setEditModal({ ...editModal, reservation: { ...editModal.reservation!, passenger: e.target.value } })}
                                        />
                                    </div>
                                    <div className="form-group-custom">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="dispatch-input"
                                            value={editModal.reservation.status}
                                            onChange={e => setEditModal({ ...editModal, reservation: { ...editModal.reservation!, status: e.target.value as any } })}
                                        >
                                            <option>Dispatched</option>
                                            <option>Unassigned</option>
                                            <option>Customer In</option>
                                            <option>Done</option>
                                            <option>Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="form-group-custom">
                                        <label className="form-label">Date</label>
                                        <input
                                            type="date"
                                            className="dispatch-input"
                                            value={new Date(editModal.reservation.pickupDate).toISOString().split('T')[0]}
                                            onChange={e => {
                                                const d = new Date(e.target.value);
                                                const formatted = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                                setEditModal({ ...editModal, reservation: { ...editModal.reservation!, pickupDate: formatted } })
                                            }}
                                        />
                                    </div>
                                    <div className="form-group-custom">
                                        <label className="form-label">Time</label>
                                        <input
                                            type="time"
                                            className="dispatch-input"
                                            value={editModal.reservation.pickupTime.replace(' AM', '').replace(' PM', '')}
                                            onChange={e => setEditModal({ ...editModal, reservation: { ...editModal.reservation!, pickupTime: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="section-panel">
                                <div className="section-title">
                                    <span>LOGISTICS</span>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group-custom" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label">Pickup Location</label>
                                        <input
                                            className="dispatch-input"
                                            value={editModal.reservation.pickupLocation}
                                            onChange={e => setEditModal({ ...editModal, reservation: { ...editModal.reservation!, pickupLocation: e.target.value } })}
                                        />
                                    </div>
                                    <div className="form-group-custom" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label">Dropoff Location</label>
                                        <input
                                            className="dispatch-input"
                                            value={editModal.reservation.dropoffLocation}
                                            onChange={e => setEditModal({ ...editModal, reservation: { ...editModal.reservation!, dropoffLocation: e.target.value } })}
                                        />
                                    </div>
                                    <div className="form-group-custom">
                                        <label className="form-label">Vehicle Type</label>
                                        <select
                                            className="dispatch-input"
                                            value={editModal.reservation.vehicleType}
                                            onChange={e => setEditModal({ ...editModal, reservation: { ...editModal.reservation!, vehicleType: e.target.value } })}
                                        >
                                            <option>LUXSUV</option>
                                            <option>LUXSEDAN</option>
                                            <option>SPRINTER</option>
                                        </select>
                                    </div>
                                    <div className="form-group-custom">
                                        <label className="form-label">Type</label>
                                        <select
                                            className="dispatch-input"
                                            value={editModal.reservation.type}
                                            onChange={e => setEditModal({ ...editModal, reservation: { ...editModal.reservation!, type: e.target.value as any } })}
                                        >
                                            <option value="INH">In-House</option>
                                            <option value="FOT">Farm-Out</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Send Confirmation Modal */}
            {confirmModal.visible && confirmModal.reservation && (
                <div className="modal-overlay" onClick={() => setConfirmModal({ ...confirmModal, visible: false, reservation: null })}>
                    <div className="modal glass-card modal-large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h3 className="title-gradient">
                                    {confirmModal.showLog ? 'Confirmation Log' : 'Send Confirmation'}
                                    <span style={{ opacity: 0.6, fontSize: '0.8em', marginLeft: '0.5rem' }}>#{confirmModal.reservation.confNumber}</span>
                                </h3>
                                {!confirmModal.showLog && (
                                    <button
                                        className="btn-text"
                                        onClick={() => setConfirmModal({ ...confirmModal, showLog: true })}
                                        style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        [View Log]
                                    </button>
                                )}
                                {confirmModal.showLog && (
                                    <button
                                        className="btn-text"
                                        onClick={() => setConfirmModal({ ...confirmModal, showLog: false })}
                                        style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        [Back to Send]
                                    </button>
                                )}
                            </div>
                            <button className="modal-close" onClick={() => setConfirmModal({ ...confirmModal, visible: false, reservation: null })}>&times;</button>
                        </div>

                        {confirmModal.showLog ? (
                            <div className="log-view" style={{ padding: '1rem', minHeight: '300px' }}>
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
                            <form onSubmit={handleSendConfirmation} style={{ padding: '0 0.5rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                                {/* Left Column: Summary */}
                                <div className="confirmation-summary section-panel" style={{ height: 'fit-content' }}>
                                    <div className="section-title">
                                        <span>TRIP SUMMARY</span>
                                    </div>
                                    <div className="summary-list" style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className="text-secondary">Date:</span>
                                            <span className="font-bold">{confirmModal.reservation.pickupDate}</span>
                                        </div>
                                        <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className="text-secondary">Time:</span>
                                            <span className="font-bold">{confirmModal.reservation.pickupTime}</span>
                                        </div>
                                        <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className="text-secondary">Vehicle:</span>
                                            <span className="font-bold">{confirmModal.reservation.vehicleType}</span>
                                        </div>
                                        <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className="text-secondary">Passenger:</span>
                                            <span className="font-bold">{confirmModal.reservation.passenger}</span>
                                        </div>
                                        <div className="summary-divider" style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                                        <div className="summary-row">
                                            <span className="text-secondary" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem' }}>PICKUP</span>
                                            <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{confirmModal.reservation.pickupLocation}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span className="text-secondary" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem' }}>DROPOFF</span>
                                            <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{confirmModal.reservation.dropoffLocation}</span>
                                        </div>
                                        <div className="summary-divider" style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                                        <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                                            <span>Total Estimate:</span>
                                            <span className="font-bold">$1,589.48</span>
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
                                                <input className="dispatch-input" style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }} defaultValue={`${confirmModal.reservation.passenger.split(' ')[0].toLowerCase()}@gmail.com`} />
                                            </div>
                                            {/* Billing */}
                                            <div className="recipient-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <input type="checkbox" style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }} />
                                                <span className="status-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', width: '40px', textAlign: 'center', flexShrink: 0 }}>BIL</span>
                                                <input className="dispatch-input" style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }} defaultValue="billing@corporate-account.com" />
                                            </div>
                                            {/* Driver */}
                                            {confirmModal.reservation.driver && (
                                                <div className="recipient-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <input type="checkbox" style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }} />
                                                    <span className="status-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', width: '40px', textAlign: 'center', flexShrink: 0 }}>DRV</span>
                                                    <input className="dispatch-input" style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }} defaultValue={`${confirmModal.reservation.driver.split(' ')[0].toLowerCase()}@velocity-drivers.com`} />
                                                </div>
                                            )}
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

                                    <div className="form-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '1.5rem' }}>
                                        <label className="checkbox-label" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                            <input type="checkbox" style={{ marginRight: '0.5rem' }} /> Hide Rates & Charges
                                        </label>
                                        <label className="checkbox-label" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                            <input type="checkbox" defaultChecked style={{ marginRight: '0.5rem' }} /> Attach PDF
                                        </label>
                                    </div>

                                    <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmModal({ ...confirmModal, visible: false, reservation: null })}>
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
            )}

            {/* Assign Driver Modal */}
            {assignModal.visible && (
                <div className="modal-overlay" onClick={() => setAssignModal({ visible: false, reservationId: null })}>
                    <div className="modal glass-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="title-gradient">Assign Driver</h3>
                            <button className="modal-close" onClick={() => setAssignModal({ visible: false, reservationId: null })}>&times;</button>
                        </div>
                        <div className="driver-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                            {driversList.map(driver => (
                                <div
                                    key={driver.id}
                                    className="driver-select-item"
                                    style={{
                                        padding: '0.8rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onClick={() => handleAssignDriver(driver.name)}
                                >
                                    <span style={{ fontWeight: 600 }}>{driver.name}</span>
                                    <span className={`status-badge ${driver.status === 'available' ? 'status-dispatched' : 'status-done'}`} style={{ fontSize: '0.7rem' }}>
                                        {driver.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer / Summary Strip */}
            <div className="dispatch-footer">
                <div className="status-legend">
                    <span className="legend-item"><span className="dot dot-dispatched"></span> Dispatched ({dispatchData.filter(d => d.status === 'Dispatched').length})</span>
                    <span className="legend-item"><span className="dot dot-live"></span> Live ({dispatchData.filter(d => d.status === 'Customer In').length})</span>
                    <span className="legend-item"><span className="dot dot-done"></span> Done ({dispatchData.filter(d => d.status === 'Done').length})</span>
                    <span className="legend-item"><span className="dot dot-cancelled"></span> Cancelled ({dispatchData.filter(d => d.status === 'Cancelled').length})</span>
                </div>
                <div className="records-count">
                    Showing {dispatchData.length} Records
                </div>
            </div>
        </div>
    );
}

export default Dispatch;
