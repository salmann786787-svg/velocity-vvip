import './Dashboard.css';

interface DashboardProps {
    onNavigate: (view: any) => void;
}

function Dashboard({ onNavigate }: DashboardProps) {
    const stats = [
        {
            label: 'Trips This Week',
            value: '24',
            change: '+12%',
            trend: 'up',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                </svg>
            )
        },
        {
            label: 'Fleet Availability',
            value: '18/32',
            change: '56%',
            trend: 'neutral',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0m-10 0a2 2 0 1 1-4 0a2 2 0 1 1-4 0" strokeWidth="2" />
                </svg>
            )
        },
        {
            label: 'Revenue Today',
            value: '$12,450',
            change: '+23%',
            trend: 'up',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="1" x2="12" y2="23" strokeWidth="2" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" />
                </svg>
            )
        },
        {
            label: 'Pending Invoices',
            value: '7',
            change: '-4%',
            trend: 'down',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <polyline points="12 6 12 12 16 14" strokeWidth="2" />
                </svg>
            )
        },
    ];

    const todaySchedule = [
        { id: 1, time: '09:00', customer: 'John Smith', vehicle: 'Mercedes S-Class', destination: 'Airport', status: 'confirmed' },
        { id: 2, time: '10:30', customer: 'Sarah Johnson', vehicle: 'Cadillac Escalade', destination: 'Corporate Event', status: 'in-progress' },
        { id: 3, time: '14:00', customer: 'Michael Brown', vehicle: 'BMW 7 Series', destination: 'City Tour', status: 'confirmed' },
        { id: 4, time: '16:30', customer: 'Emily Davis', vehicle: 'Lincoln Navigator', destination: 'Private Booking', status: 'pending' },
        { id: 5, time: '19:00', customer: 'Robert Wilson', vehicle: 'Mercedes Sprinter', destination: 'Special Event', status: 'confirmed' },
    ];

    const fleetStatus = [
        { vehicle: 'Mercedes S-Class', plate: 'VV-001', status: 'Active', driver: 'James Miller', location: 'Downtown' },
        { vehicle: 'Cadillac Escalade', plate: 'VV-002', status: 'Active', driver: 'Maria Garcia', location: 'Airport' },
        { vehicle: 'BMW 7 Series', plate: 'VV-003', status: 'Ready', driver: '-', location: 'Main Garage' },
        { vehicle: 'Lincoln Navigator', plate: 'VV-004', status: 'Service', driver: '-', location: 'Service Center' },
        { vehicle: 'Mercedes Sprinter', plate: 'VV-005', status: 'Ready', driver: '-', location: 'Main Garage' },
    ];

    return (
        <div className="dashboard fade-in">
            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card glass-card">
                        <div className="stat-icon">
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">{stat.label}</p>
                            <div className="stat-value-group">
                                <h3 className="stat-value title-gradient">{stat.value}</h3>
                                {stat.trend !== 'neutral' && (
                                    <div className={`stat-change ${stat.trend}`}>
                                        {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Today's Schedule */}
                <div className="dashboard-section glass-card">
                    <div className="section-header">
                        <h4 className="title-gradient">Today's Schedule</h4>
                        <button className="btn btn-sm btn-outline" onClick={() => onNavigate('reservations')}>View All</button>
                    </div>
                    <div className="schedule-list">
                        {todaySchedule.map((booking) => (
                            <div key={booking.id} className="schedule-item">
                                <div className="schedule-time">
                                    {booking.time}
                                </div>
                                <div className="schedule-details">
                                    <p className="customer-name">{booking.customer}</p>
                                    <p className="item-meta">{booking.vehicle} · {booking.destination}</p>
                                </div>
                                <span className={`badge badge-${booking.status === 'confirmed' ? 'success' :
                                    booking.status === 'in-progress' ? 'primary' :
                                        'warning'
                                    }`}>
                                    <div className="glow-point"></div>
                                    {booking.status.toUpperCase()}
                                </span >
                            </div >
                        ))}
                    </div >
                </div >

                {/* Fleet Status */}
                <div className="dashboard-section glass-card">
                    <div className="section-header">
                        <h4 className="title-gradient">Fleet Status</h4>
                        <button className="btn btn-sm btn-outline" onClick={() => onNavigate('fleet')}>Manage Fleet</button>
                    </div>
                    <div className="fleet-list">
                        {fleetStatus.map((vehicle, index) => (
                            <div key={index} className="fleet-item">
                                <div className="fleet-details">
                                    <p className="vehicle-name">{vehicle.vehicle} <span className="text-muted" style={{ fontSize: '0.8rem', opacity: 0.5 }}>[{vehicle.plate}]</span></p>
                                    <p className="item-meta">
                                        {vehicle.driver !== '-' ? `Driver: ${vehicle.driver}` : 'No Driver'} · {vehicle.location}
                                    </p>
                                </div>
                                <span className={`badge badge-${vehicle.status === 'Active' ? 'primary' :
                                    vehicle.status === 'Ready' ? 'success' :
                                        'warning'
                                    }`}>
                                    {vehicle.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div >

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <div className="section-header">
                    <h4 className="title-gradient">Quick Actions</h4>
                </div>
                <div className="actions-grid">
                    <div className="action-card glass-card" onClick={() => onNavigate('reservations')} role="button" style={{ cursor: 'pointer' }}>
                        <div className="action-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
                                <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
                            </svg>
                        </div>
                        <span>New Trip</span>
                    </div>
                    <div className="action-card glass-card" onClick={() => onNavigate('accounts')} role="button" style={{ cursor: 'pointer' }}>
                        <div className="action-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                                <circle cx="12" cy="7" r="4" strokeWidth="2" />
                            </svg>
                        </div>
                        <span>Add Customer</span>
                    </div>
                    <div className="action-card glass-card" onClick={() => onNavigate('fleet')} role="button" style={{ cursor: 'pointer' }}>
                        <div className="action-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0m-10 0a2 2 0 1 1-4 0m-10 0a2 2 0 1 1-4 0" strokeWidth="2" />
                            </svg>
                        </div>
                        <span>Add Vehicle</span>
                    </div>
                    <div className="action-card glass-card" onClick={() => alert('Generating Operational Report...')} role="button" style={{ cursor: 'pointer' }}>
                        <div className="action-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" />
                                <polyline points="7 10 12 15 17 10" strokeWidth="2" />
                                <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" />
                            </svg>
                        </div>
                        <span>Export Report</span>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default Dashboard;
