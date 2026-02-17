import { useState, useMemo } from 'react';
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

type ViewMode = 'Grid' | 'Map' | 'Graph' | 'GPS';

function Dispatch() {
    const [viewMode, setViewMode] = useState<ViewMode>('Grid');
    const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-02-16T12:00:00')); // Default to match screenshot date for context
    const [filterStatus, setFilterStatus] = useState<string>('All');
    
    // Mock Data based on the reference image + extra testing data
    const [dispatchData, setDispatchData] = useState<DispatchRow[]>([
        { id: 1, passenger: 'Charles Rinehart', serviceType: 'To Airport', confNumber: '48345', status: 'Dispatched', pickupDate: '02/16/2026', pickupTime: '06:15 AM', type: 'INH', pickupLocation: 'Park Hyatt New York 153 W 57th St New', dropoffLocation: 'JFK DL 4985', driver: 'ANIK', vehicleType: 'LUXSUV', carId: 'LUXSUV8', pax: 4, lug: 3 },
        { id: 2, passenger: 'Emilie Beagle', serviceType: 'To Airport', confNumber: '48195', status: 'Done', pickupDate: '02/16/2026', pickupTime: '08:00 AM', type: 'INH', pickupLocation: '419 West 50th Street 419 W 50th St', dropoffLocation: 'LGA WN 2377', driver: 'Yovanky', vehicleType: 'LUXSUV', carId: 'SUV5', pax: 4, lug: 4 },
        { id: 3, passenger: 'Michael Best', serviceType: 'To Airport', confNumber: '48327', status: 'Dispatched', pickupDate: '02/16/2026', pickupTime: '08:00 AM', type: 'INH', pickupLocation: '396 15th Street 396 15th St Brooklyn NY', dropoffLocation: 'JFK B6 53', driver: 'ANIK', vehicleType: 'LUXSUV', carId: 'LUXSUV8', pax: 5, lug: 3 },
        { id: 4, passenger: 'Alexandra Kyger', serviceType: 'To Airport', confNumber: '48224', status: 'Done', pickupDate: '02/16/2026', pickupTime: '11:00 AM', type: 'FOT', pickupLocation: 'Lotte New York Palace 455 Madison Ave', dropoffLocation: 'LGA DL 2930', driver: '', vehicleType: 'SPR14', carId: '', pax: 7, lug: 5 },
        { id: 5, passenger: 'Lora Lorincz', serviceType: 'Hourly/As Directed', confNumber: '48349', status: 'Done', notes: 'msg', pickupDate: '02/16/2026', pickupTime: '11:00 AM', type: 'INH', pickupLocation: 'at Grand Central Terminal 109 E 42nd St', dropoffLocation: 'LGA DL 5636', driver: 'KARIM', vehicleType: 'LUXSUV', carId: 'SUV26', pax: 4, lug: 6 },
        { id: 6, passenger: 'Brieane Olson', serviceType: 'Hourly/As Directed', confNumber: '48311', status: 'Cancelled', pickupDate: '02/16/2026', pickupTime: '12:00 PM', type: 'INH', pickupLocation: 'The St. Regis New York Two E 55th St,', dropoffLocation: 'The St. Regis New York Two E 55th St,', driver: '', vehicleType: 'LUXSED', carId: '', pax: 2, lug: 0 },
        { id: 7, passenger: 'Sarah Miley', serviceType: 'To Airport', confNumber: '48246', status: 'Dispatched', pickupDate: '02/16/2026', pickupTime: '02:00 PM', type: 'INH', pickupLocation: 'The Lucerne Hotel 201 W 79th St New', dropoffLocation: 'JFK AA 4611', driver: 'ANIK', vehicleType: 'LUXSUV', carId: '', pax: 4, lug: 3 },
        { id: 8, passenger: 'Brittany Wood', serviceType: 'To Airport', confNumber: '47911', status: 'Done', pickupDate: '02/16/2026', pickupTime: '02:00 PM', type: 'INH', pickupLocation: 'The Empire Hotel 44 W 63rd St New', dropoffLocation: 'LGA DL 4902', driver: 'HASAN', vehicleType: 'LUXSUV7', carId: 'SUV62', pax: 5, lug: 5 },
        { id: 9, passenger: 'Elizabeth Foraker', serviceType: 'To Airport', confNumber: '48065', status: 'Done', pickupDate: '02/16/2026', pickupTime: '02:30 PM', type: 'INH', pickupLocation: 'Loews Regency New York 540 Park Ave', dropoffLocation: 'LGA DL 4952', driver: 'ANIK', vehicleType: 'VIPSUV', carId: 'LUXSUV8', pax: 3, lug: 3 },
        { id: 10, passenger: 'Phillip Clark', serviceType: 'To Airport', confNumber: '48251', status: 'Done', pickupDate: '02/16/2026', pickupTime: '03:30 PM', type: 'INH', pickupLocation: 'St. Regis Hotel Two E 55th St New York', dropoffLocation: 'LGA DL 5636', driver: 'Gurpreet', vehicleType: 'LUXSUV', carId: 'SUV53', pax: 2, lug: 4 },
        { id: 11, passenger: 'Irene Dociu', serviceType: 'Point-to-Point', confNumber: '48350', status: 'Cancelled', notes: 'msg', pickupDate: '02/16/2026', pickupTime: '04:30 PM', type: 'INH', pickupLocation: 'Arlo Soho 231 Hudson St New York NY', dropoffLocation: 'BABSON College 4 Pk Mnr Wy', driver: '', vehicleType: 'LUXSUV', carId: '', pax: 3, lug: 5 },
        { id: 12, passenger: 'Denise Morris', serviceType: 'From Airport', confNumber: '48239', status: 'Customer In', notes: 'msg', pickupDate: '02/16/2026', pickupTime: '08:15 PM', type: 'INH', pickupLocation: 'LGA PD 607', dropoffLocation: 'The Westin New York Grand Central 212', driver: 'ANIK', vehicleType: 'LUXSUV', carId: 'LUXSUV8', pax: 1, lug: 1 },
    ]);

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

    return (
        <div className="dispatch-container fade-in">
            {/* Header Controls */}
            <div className="dispatch-controls glass-panel">
                <div className="control-group left">
                    <div className="view-toggle">
                        {['Grid', 'Map', 'Graph', 'GPS'].map((mode) => (
                            <button 
                                key={mode}
                                className={`toggle-btn ${viewMode === mode ? 'active' : ''}`}
                                onClick={() => setViewMode(mode as ViewMode)}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-group center">
                    <button className="icon-btn" onClick={() => changeDate(-1)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <div className="date-display">
                        <span className="icon-calendar">📅</span>
                        {formatDate(currentDate)}
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
                        <label className="checkbox-label">
                            <input type="checkbox" /> Settled
                        </label>
                    </div>
                     <div className="search-bar">
                        <input type="text" placeholder="Quick Search..." />
                        <button className="btn-go">GO</button>
                    </div>
                    <button className="btn-dispatch-action">
                        <span className="plus">+</span> New Dispatch
                    </button>
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
                            <tr key={row.id} className={`dispatch-row ${getStatusColor(row.status)}`}>
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
