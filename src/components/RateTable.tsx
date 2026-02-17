import React, { useState, useEffect } from 'react';
import './RateTable.css';

interface RateTableProps {
    onUpdateTotal: (total: number, balance: number) => void;
    hours: number;
    passengers: number;
    vehicle: string;
}

const RateTable: React.FC<RateTableProps> = ({ onUpdateTotal, hours, passengers, vehicle }) => {
    const [activeTab, setActiveTab] = useState<'primary' | 'secondary' | 'farm-out'>('primary');

    // Primary Rates State
    const [flatRate, setFlatRate] = useState(0);
    const [hourlyRate, setHourlyRate] = useState(150);
    const [hourlyHours, setHourlyHours] = useState(hours);
    const [extraStopRate, setExtraStopRate] = useState(50);
    const [extraStopCount, setExtraStopCount] = useState(0);
    const [sanitizingFee, setSanitizingFee] = useState(10);
    const [otWaitTime, setOtWaitTime] = useState(0);
    const [stdGratPercent, setStdGratPercent] = useState(20);
    const [extraGrat, setExtraGrat] = useState(0);
    const [stcSurchPercent, setStcSurchPercent] = useState(5);
    const [perPassRate, setPerPassRate] = useState(0);
    const [perPassCount, setPerPassCount] = useState(passengers);
    const [perMileRate, setPerMileRate] = useState(0);
    const [perMileCount, setPerMileCount] = useState(0);
    const [stdTaxPercent, setStdTaxPercent] = useState(8.875);
    const [childSeatRate, setChildSeatRate] = useState(20);
    const [childSeatCount, setChildSeatCount] = useState(0);

    // Farm-out Rates State
    const [farmOutBaseRate, setFarmOutBaseRate] = useState(0);
    const [farmOutGratuityPercent, setFarmOutGratuityPercent] = useState(20);

    // Payments
    const [deposit, setDeposit] = useState(0);

    // Dynamic updates when props change
    useEffect(() => {
        setHourlyHours(hours);
    }, [hours]);

    useEffect(() => {
        setPerPassCount(passengers);
    }, [passengers]);

    // Calculations
    const hourlyTotal = hourlyRate * hourlyHours;
    const extraStopsTotal = extraStopRate * extraStopCount;
    const perPassTotal = perPassRate * perPassCount;
    const perMileTotal = perMileRate * perMileCount;
    const childSeatTotal = childSeatRate * childSeatCount;

    const farmOutGratuityTotal = (farmOutBaseRate * farmOutGratuityPercent) / 100;
    const farmOutTotal = farmOutBaseRate + farmOutGratuityTotal;

    // Subtotal logic depends on active tab or combination
    // For now, let's assume Primary tab drives the main "Reservation" total, 
    // unless Farm-out is being used (which might replace Primary).
    // Let's keep it simple: Grand Total is sum of active components.
    // However, usually it's EITHER internal OR farm-out.
    // Let's count them all for now, but usually you'd zero out the other one.

    const primarySubtotal = flatRate + hourlyTotal + extraStopsTotal + sanitizingFee + otWaitTime + extraGrat + perPassTotal + perMileTotal + childSeatTotal;
    const primaryGratTotal = (primarySubtotal * stdGratPercent) / 100;
    const stcSurchTotal = (primarySubtotal * stcSurchPercent) / 100;
    const primaryTaxTotal = (primarySubtotal * stdTaxPercent) / 100;

    const grandTotal = primarySubtotal + primaryGratTotal + stcSurchTotal + primaryTaxTotal + farmOutTotal;
    const totalDue = grandTotal - deposit;

    useEffect(() => {
        onUpdateTotal(grandTotal, totalDue);
    }, [grandTotal, totalDue, onUpdateTotal]);

    const EditableCell = ({ value, onChange, prefix = '', suffix = '', width = '100%' }: { value: number, onChange: (val: number) => void, prefix?: string, suffix?: string, width?: string }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [tempValue, setTempValue] = useState(value.toString());
        const inputRef = React.useRef<HTMLInputElement>(null);

        useEffect(() => {
            setTempValue(value.toString());
        }, [value]);

        useEffect(() => {
            if (isEditing && inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }, [isEditing]);

        const handleBlur = () => {
            setIsEditing(false);
            const num = parseFloat(tempValue);
            onChange(isNaN(num) ? 0 : num);
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleBlur();
            }
        };

        if (isEditing) {
            return (
                <input
                    ref={inputRef}
                    type="number"
                    className="rate-input"
                    style={{ width }}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                />
            );
        }

        return (
            <div
                className="rate-display"
                style={{ width }}
                onDoubleClick={() => setIsEditing(true)}
                title="Double click to edit"
            >
                {prefix}{value}{suffix}
            </div>
        );
    };

    const renderPrimaryTab = () => (
        <div>
            {/* Flat Rate */}
            <div className="rate-grid">
                <span className="rate-label">Flat Rate</span>
                <EditableCell value={flatRate} onChange={setFlatRate} />
                <span></span>
                <span>=</span>
                <span className="rate-calculated">${flatRate.toFixed(2)}</span>
            </div>

            {/* Hourly */}
            <div className="rate-grid">
                <span className="rate-label">Hourly ({hourlyHours} hrs)</span>
                <EditableCell value={hourlyRate} onChange={setHourlyRate} />
                <span className="rate-symbol">x {hourlyHours}</span>
                <span>=</span>
                <span className="rate-calculated">${hourlyTotal.toFixed(2)}</span>
            </div>

            {/* Extra Stops */}
            <div className="rate-grid">
                <span className="rate-label">Extra Stops</span>
                <EditableCell value={extraStopRate} onChange={setExtraStopRate} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="rate-symbol">x</span>
                    <EditableCell value={extraStopCount} onChange={setExtraStopCount} width="60px" />
                </div>
                <span>=</span>
                <span className="rate-calculated">${extraStopsTotal.toFixed(2)}</span>
            </div>

            {/* Sanitizing Fee */}
            <div className="rate-grid">
                <span className="rate-label">Sanitizing Fee</span>
                <EditableCell value={sanitizingFee} onChange={setSanitizingFee} />
                <span></span>
                <span>=</span>
                <span className="rate-calculated">${sanitizingFee.toFixed(2)}</span>
            </div>

            {/* OT/Wait Time */}
            <div className="rate-grid">
                <span className="rate-label">OT/Wait Time</span>
                <EditableCell value={otWaitTime} onChange={setOtWaitTime} />
                <span></span>
                <span>=</span>
                <span className="rate-calculated">${otWaitTime.toFixed(2)}</span>
            </div>

            {/* Standard Gratuity */}
            <div className="rate-grid">
                <span className="rate-label">Std Grat ({stdGratPercent}%)</span>
                <EditableCell value={stdGratPercent} onChange={setStdGratPercent} suffix="%" />
                <span className="rate-symbol">%</span>
                <span>=</span>
                <span className="rate-calculated">${primaryGratTotal.toFixed(2)}</span>
            </div>

            {/* STC Surcharge */}
            <div className="rate-grid">
                <span className="rate-label">STC Surch ({stcSurchPercent}%)</span>
                <EditableCell value={stcSurchPercent} onChange={setStcSurchPercent} suffix="%" />
                <span className="rate-symbol">%</span>
                <span>=</span>
                <span className="rate-calculated">${stcSurchTotal.toFixed(2)}</span>
            </div>

            {/* Standard Tax */}
            <div className="rate-grid">
                <span className="rate-label">Tax ({stdTaxPercent}%)</span>
                <EditableCell value={stdTaxPercent} onChange={setStdTaxPercent} suffix="%" />
                <span className="rate-symbol">%</span>
                <span>=</span>
                <span className="rate-calculated">${primaryTaxTotal.toFixed(2)}</span>
            </div>

        </div>
    );

    return (
        <div className="rate-table-container glass-card">
            <div className="rate-tabs">
                <button
                    className={`rate-tab ${activeTab === 'primary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('primary')}
                >
                    Primary Rates
                </button>
                <button
                    className={`rate-tab ${activeTab === 'secondary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('secondary')}
                >
                    Secondary Charges
                </button>
                <button
                    className={`rate-tab ${activeTab === 'farm-out' ? 'active' : ''}`}
                    onClick={() => setActiveTab('farm-out')}
                >
                    Farm-out Costs
                </button>
            </div>

            {activeTab === 'primary' && renderPrimaryTab()}

            {activeTab === 'secondary' && (
                <div className="p-4 text-muted text-center" style={{ padding: '2rem' }}>
                    Secondary charges configuration options (Tolls, Parking, etc.)
                </div>
            )}

            {activeTab === 'farm-out' && (
                <div style={{ padding: '1rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Affiliate / Farm-out Rates</h4>
                    <div>
                        <div className="rate-grid">
                            <span className="rate-label">Base Rate</span>
                            <EditableCell value={farmOutBaseRate} onChange={setFarmOutBaseRate} />
                            <span></span>
                            <span>=</span>
                            <span className="rate-calculated">${farmOutBaseRate.toFixed(2)}</span>
                        </div>
                        <div className="rate-grid">
                            <span className="rate-label">Gratuity</span>
                            <EditableCell value={farmOutGratuityPercent} onChange={setFarmOutGratuityPercent} suffix="%" />
                            <span className="rate-symbol">%</span>
                            <span>=</span>
                            <span className="rate-calculated">${farmOutGratuityTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="rate-summary">
                <div className="summary-row">
                    <span className="summary-label total">Grand Total</span>
                    <span className="summary-value total">${grandTotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Payments/Deposits</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <EditableCell value={deposit} onChange={setDeposit} width="120px" />
                    </div>
                </div>
                <div className="summary-row" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--glass-border)' }}>
                    <span className="summary-label due">Total Due</span>
                    <span className="summary-value due">${totalDue.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default RateTable;
