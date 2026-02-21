import React, { useState, useEffect } from 'react';
import './RateTable.css';
import type { RateBreakdown } from '../types';

interface RateTableProps {
    onUpdateTotal: (total: number, balance: number, breakdown: RateBreakdown) => void;
    hours: number;
    passengers: number;
    initialBreakdown?: RateBreakdown | null;
}

const RateTable: React.FC<RateTableProps> = ({ onUpdateTotal, hours, passengers, initialBreakdown }) => {
    const [activeTab, setActiveTab] = useState<'primary' | 'secondary' | 'farm-out'>('primary');
    const [isLoadedFromExisting, setIsLoadedFromExisting] = useState(false);

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

    // Label State
    const [flatRateLabel, setFlatRateLabel] = useState('Flat Rate');
    const [hourlyRateLabel, setHourlyRateLabel] = useState('Hourly Rate');
    const [extraStopLabel, setExtraStopLabel] = useState('Extra Stops');
    const [sanitizingFeeLabel, setSanitizingFeeLabel] = useState('Sanitizing Fee');
    const [otWaitTimeLabel, setOtWaitTimeLabel] = useState('OT/Wait Time');
    const [stdGratLabel, setStdGratLabel] = useState('Std Grat');
    const [stcSurchLabel, setStcSurchLabel] = useState('STC Surch');
    const [taxLabel, setTaxLabel] = useState('Tax');

    // Load initial breakdown if provided (for edit mode)
    useEffect(() => {
        if (initialBreakdown && !isLoadedFromExisting) {
            setFlatRate(initialBreakdown.flatRate);
            setHourlyRate(initialBreakdown.hourlyRate);
            setHourlyHours(initialBreakdown.hourlyHours);
            setExtraStopRate(initialBreakdown.extraStopRate);
            setExtraStopCount(initialBreakdown.extraStopCount);
            setSanitizingFee(initialBreakdown.sanitizingFee);
            setOtWaitTime(initialBreakdown.otWaitTime);
            setStdGratPercent(initialBreakdown.stdGratPercent);
            setExtraGrat(initialBreakdown.extraGrat || 0);
            setStcSurchPercent(initialBreakdown.stcSurchPercent);
            setPerPassRate(initialBreakdown.perPassRate || 0);
            setPerPassCount(initialBreakdown.perPassCount || passengers);
            setPerMileRate(initialBreakdown.perMileRate || 0);
            setPerMileCount(initialBreakdown.perMileCount || 0);
            setStdTaxPercent(initialBreakdown.stdTaxPercent);
            setChildSeatRate(initialBreakdown.childSeatRate || 20);
            setChildSeatCount(initialBreakdown.childSeatCount || 0);
            setFarmOutBaseRate(initialBreakdown.farmOutBaseRate || 0);
            setFarmOutGratuityPercent(initialBreakdown.farmOutGratuityPercent || 20);
            setDeposit(initialBreakdown.deposit);

            // Labels
            setFlatRateLabel(initialBreakdown.flatRateLabel);
            setHourlyRateLabel(initialBreakdown.hourlyRateLabel);
            setExtraStopLabel(initialBreakdown.extraStopLabel);
            setSanitizingFeeLabel(initialBreakdown.sanitizingFeeLabel);
            setOtWaitTimeLabel(initialBreakdown.otWaitTimeLabel);
            setStdGratLabel(initialBreakdown.stdGratLabel);
            setStcSurchLabel(initialBreakdown.stcSurchLabel);
            setTaxLabel(initialBreakdown.taxLabel);

            setIsLoadedFromExisting(true);
        }
    }, [initialBreakdown, isLoadedFromExisting, passengers]);

    // Dynamic updates when props change (but not if loaded from existing and not changed by user)
    useEffect(() => {
        if (!isLoadedFromExisting) {
            setHourlyHours(hours);
        }
    }, [hours, isLoadedFromExisting]);

    useEffect(() => {
        if (!isLoadedFromExisting) {
            setPerPassCount(passengers);
        }
    }, [passengers, isLoadedFromExisting]);

    // Calculations
    const hourlyTotal = hourlyRate * hourlyHours;
    const extraStopsTotal = extraStopRate * extraStopCount;
    const perPassTotal = perPassRate * perPassCount;
    const perMileTotal = perMileRate * perMileCount;
    const childSeatTotal = childSeatRate * childSeatCount;

    const farmOutGratuityTotal = (farmOutBaseRate * farmOutGratuityPercent) / 100;
    const farmOutTotal = farmOutBaseRate + farmOutGratuityTotal;

    const primarySubtotal = flatRate + hourlyTotal + extraStopsTotal + sanitizingFee + otWaitTime + extraGrat + perPassTotal + perMileTotal + childSeatTotal;
    const primaryGratTotal = (primarySubtotal * stdGratPercent) / 100;
    const stcSurchTotal = (primarySubtotal * stcSurchPercent) / 100;
    const primaryTaxTotal = (primarySubtotal * stdTaxPercent) / 100;

    const grandTotal = primarySubtotal + primaryGratTotal + stcSurchTotal + primaryTaxTotal + farmOutTotal;
    const totalDue = grandTotal - deposit;

    // Recalculate breakdown object - debounced to avoid excessive re-renders
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const breakdown: RateBreakdown = {
                flatRate,
                hourlyRate,
                hourlyHours,
                hourlyTotal,
                extraStopRate,
                extraStopCount,
                extraStopsTotal,
                sanitizingFee,
                otWaitTime,
                stdGratPercent,
                primaryGratTotal,
                stcSurchPercent,
                stcSurchTotal,
                stdTaxPercent,
                primaryTaxTotal,
                fuelSurcharge: 0,
                swg: 0,
                perPassRate,
                perPassCount,
                perPassTotal,
                perMileRate,
                perMileCount,
                perMileTotal,
                childSeatRate,
                childSeatCount,
                childSeatTotal,
                extraGrat,
                farmOutBaseRate,
                farmOutGratuityPercent,
                farmOutGratuityTotal,
                farmOutTotal,

                flatRateLabel,
                hourlyRateLabel,
                extraStopLabel,
                sanitizingFeeLabel,
                otWaitTimeLabel,
                stdGratLabel,
                stcSurchLabel,
                taxLabel,

                primarySubtotal,
                grandTotal,
                totalDue,
                deposit
            };
            onUpdateTotal(grandTotal, totalDue, breakdown);
        }, 100); // 100ms debounce

        return () => clearTimeout(timeoutId);
    }, [
        grandTotal, totalDue,
        flatRate, hourlyRate, hourlyHours, hourlyTotal,
        extraStopRate, extraStopCount, extraStopsTotal,
        sanitizingFee, otWaitTime,
        stdGratPercent, primaryGratTotal,
        stcSurchPercent, stcSurchTotal,
        stdTaxPercent, primaryTaxTotal,
        perPassRate, perPassCount, perPassTotal,
        perMileRate, perMileCount, perMileTotal,
        childSeatRate, childSeatCount, childSeatTotal,
        extraGrat, farmOutBaseRate, farmOutGratuityPercent,
        farmOutGratuityTotal, farmOutTotal,
        primarySubtotal, deposit,
        onUpdateTotal
    ]);

    const EditableCell = ({ value, onChange, prefix, suffix, width = '100%', min = 0 }: { value: number, onChange: (val: number) => void, prefix?: string, suffix?: string, width?: string, min?: number }) => {
        const [tempValue, setTempValue] = useState(value.toString());

        useEffect(() => {
            setTempValue(value.toString());
        }, [value]);

        const handleBlur = () => {
            const num = parseFloat(tempValue);
            const finalValue = isNaN(num) ? 0 : num;
            if (finalValue !== value) {
                onChange(finalValue);
                // Mark as modified by user
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
            }
        };

        return (
            <div className="rate-input-wrapper" style={{ width, display: 'flex', alignItems: 'center', position: 'relative' }}>
                {prefix && <span className="rate-prefix left" style={{ position: 'absolute', left: '8px', zIndex: 1, color: 'var(--color-text-secondary)', pointerEvents: 'none' }}>{prefix}</span>}
                <input
                    type="number"
                    className="rate-input form-input"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    style={{
                        width: '100%',
                        paddingLeft: prefix ? '1.5rem' : '0.5rem',
                        paddingRight: suffix ? '1.5rem' : '0.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        textAlign: 'right'
                    }}
                    min={min}
                    step="any"
                />
                {suffix && <span className="rate-suffix right" style={{ position: 'absolute', right: '8px', zIndex: 1, color: 'var(--color-text-secondary)', pointerEvents: 'none' }}>{suffix}</span>}
            </div>
        );
    };

    const EditableLabel = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
        return (
            <input
                type="text"
                className="rate-label-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    width: '100%',
                    outline: 'none',
                    padding: '0'
                }}
            />
        );
    };

    const renderPrimaryTab = () => (
        <div>
            {isLoadedFromExisting && (
                <div style={{
                    background: 'rgba(180, 83, 233, 0.1)',
                    border: '1px solid rgba(180, 83, 233, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                        Rates loaded from existing reservation.Edit any value to recalculate.
                    </span>
                </div>
            )}

            {/* Flat Rate */}
            <div className="rate-grid">
                <EditableLabel value={flatRateLabel} onChange={setFlatRateLabel} />
                <EditableCell value={flatRate} onChange={setFlatRate} prefix="$" />
                <span></span>
                <span> = </span>
                <span className="rate-calculated">${flatRate.toFixed(2)}</span>
            </div>

            {/* Hourly */}
            <div className="rate-grid">
                <EditableLabel value={hourlyRateLabel} onChange={setHourlyRateLabel} />
                <EditableCell value={hourlyRate} onChange={setHourlyRate} prefix="$" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="rate-symbol">x</span>
                    <EditableCell value={hourlyHours} onChange={setHourlyHours} suffix="h" width="80px" />
                </div>
                <span> = </span>
                <span className="rate-calculated">${hourlyTotal.toFixed(2)}</span>
            </div>

            {/* Extra Stops */}
            <div className="rate-grid">
                <EditableLabel value={extraStopLabel} onChange={setExtraStopLabel} />
                <EditableCell value={extraStopRate} onChange={setExtraStopRate} prefix="$" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="rate-symbol">x</span>
                    <EditableCell value={extraStopCount} onChange={setExtraStopCount} width="60px" />
                </div>
                <span> = </span>
                <span className="rate-calculated">${extraStopsTotal.toFixed(2)}</span>
            </div>

            {/* Sanitizing Fee */}
            <div className="rate-grid">
                <EditableLabel value={sanitizingFeeLabel} onChange={setSanitizingFeeLabel} />
                <EditableCell value={sanitizingFee} onChange={setSanitizingFee} prefix="$" />
                <span></span>
                <span> = </span>
                <span className="rate-calculated">${sanitizingFee.toFixed(2)}</span>
            </div>

            {/* OT/Wait Time */}
            <div className="rate-grid">
                <EditableLabel value={otWaitTimeLabel} onChange={setOtWaitTimeLabel} />
                <EditableCell value={otWaitTime} onChange={setOtWaitTime} prefix="$" />
                <span></span>
                <span> = </span>
                <span className="rate-calculated">${otWaitTime.toFixed(2)}</span>
            </div>

            {/* Standard Gratuity */}
            <div className="rate-grid">
                <EditableLabel value={stdGratLabel} onChange={setStdGratLabel} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <EditableCell value={stdGratPercent} onChange={setStdGratPercent} suffix="%" width="80px" />
                </div>
                <span className="rate-symbol">%</span>
                <span> = </span>
                <span className="rate-calculated">${primaryGratTotal.toFixed(2)}</span>
            </div>

            {/* STC Surcharge */}
            <div className="rate-grid">
                <EditableLabel value={stcSurchLabel} onChange={setStcSurchLabel} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <EditableCell value={stcSurchPercent} onChange={setStcSurchPercent} suffix="%" width="80px" />
                </div>
                <span className="rate-symbol">%</span>
                <span> = </span>
                <span className="rate-calculated">${stcSurchTotal.toFixed(2)}</span>
            </div>

            {/* Standard Tax */}
            <div className="rate-grid">
                <EditableLabel value={taxLabel} onChange={setTaxLabel} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <EditableCell value={stdTaxPercent} onChange={setStdTaxPercent} suffix="%" width="80px" />
                </div>
                <span className="rate-symbol">%</span>
                <span> = </span>
                <span className="rate-calculated">${primaryTaxTotal.toFixed(2)}</span>
            </div>

        </div>
    );

    return (
        <div className="rate-table-container glass-card">
            <div className="rate-tabs">
                <button
                    type="button"
                    className={`rate-tab ${activeTab === 'primary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('primary')}
                >
                    Primary Rates
                </button>
                <button
                    type="button"
                    className={`rate-tab ${activeTab === 'secondary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('secondary')}
                >
                    Secondary Charges
                </button>
                <button
                    type="button"
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
                            <EditableCell value={farmOutBaseRate} onChange={setFarmOutBaseRate} prefix="$" />
                            <span></span>
                            <span>=</span>
                            <span className="rate-calculated">${farmOutBaseRate.toFixed(2)}</span>
                        </div>
                        <div className="rate-grid">
                            <span className="rate-label">Gratuity</span>
                            <EditableCell value={farmOutGratuityPercent} onChange={setFarmOutGratuityPercent} suffix="%" />
                            <span className="rate-symbol">%</span>
                            <span> = </span>
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
                        <EditableCell value={deposit} onChange={setDeposit} prefix="$" width="120px" />
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
