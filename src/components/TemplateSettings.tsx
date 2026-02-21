import React, { useState, useEffect } from 'react';
import './TemplateSettings.css';

interface TemplateSettingsData {
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
    policyCustomer: string;
    policyDriver: string;
    policyAffiliate: string;
}

const defaultSettings: TemplateSettingsData = {
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
    policyCustomer: 'CANCELLATION POLICY: Cancellations made less than 24 hours before pickup are subject to a full charge. NO-SHOW POLICY: Full charge applies if passenger is not found within 30 minutes of scheduled time.',
    policyDriver: 'DRESS CODE: Dark Suit, White Shirt, Tie. ARRIVAL: 15 Minutes prior to pickup. GREETING: Open door, offer water, assist with luggage along with a big smile.',
    policyAffiliate: 'COMMISSION: 10% commission on base rate. PAYMENT: Net 30 days. STANDARDS: Driver must be in full suit. Vehicle must be 2023 or newer model.'
};

const TIMEZONES = [
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT) — Los Angeles, Seattle' },
    { value: 'America/Denver', label: 'Mountain Time (MT) — Denver, Phoenix' },
    { value: 'America/Chicago', label: 'Central Time (CT) — Chicago, Dallas, Houston' },
    { value: 'America/New_York', label: 'Eastern Time (ET) — New York, Miami, Atlanta' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
    { value: 'America/Toronto', label: 'Eastern Time — Toronto' },
    { value: 'America/Vancouver', label: 'Pacific Time — Vancouver' },
    { value: 'America/Chicago', label: 'Central Time — Chicago' },
    { value: 'Europe/London', label: 'GMT/BST — London' },
    { value: 'Europe/Paris', label: 'CET — Paris, Berlin, Rome, Madrid' },
    { value: 'Europe/Dubai', label: 'GST — Dubai, Abu Dhabi' },
    { value: 'Asia/Singapore', label: 'SGT — Singapore, Kuala Lumpur' },
    { value: 'Asia/Tokyo', label: 'JST — Tokyo, Osaka' },
    { value: 'Australia/Sydney', label: 'AEDT — Sydney, Melbourne' },
];

const TemplateSettings: React.FC = () => {
    const [settings, setSettings] = useState<TemplateSettingsData>(defaultSettings);
    const [saved, setSaved] = useState(false);
    const [timezone, setTimezone] = useState(
        () => localStorage.getItem('appTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    useEffect(() => {
        const stored = localStorage.getItem('confirmationTemplateSettings');
        if (stored) {
            // merge stored with default to handle new fields if they don't exist in stored
            const parsed = JSON.parse(stored);
            setSettings({ ...defaultSettings, ...parsed });
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
        setSaved(false);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
                setSaved(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        localStorage.setItem('confirmationTemplateSettings', JSON.stringify(settings));
        localStorage.setItem('appTimezone', timezone);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="template-settings fade-in">
            {/* Settings Grid */}
            <div className="settings-grid">
                {/* Branding Section */}
                <div className="settings-section glass-card">
                    <h3>🏷️ Brand Identity</h3>
                    <div className="form-group">
                        <label className="form-label">Business Identifier</label>
                        <input
                            type="text"
                            name="businessName"
                            className="form-input"
                            value={settings.businessName}
                            onChange={handleChange}
                            placeholder="e.g. Velocity VVIP"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Operational Tagline</label>
                        <input
                            type="text"
                            name="tagline"
                            className="form-input"
                            value={settings.tagline}
                            onChange={handleChange}
                            placeholder="e.g. Premium Limousine Services"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Digital Asset (Logo)</label>
                        <div className="logo-upload-area" onClick={() => document.getElementById('logo-input')?.click()}>
                            {settings.logoUrl ? (
                                <div className="logo-preview">
                                    <img src={settings.logoUrl} alt="Logo Preview" />
                                </div>
                            ) : (
                                <div className="logo-placeholder">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>DEPLOY OFFICIAL BRAND ASSET</p>
                            <input
                                id="logo-input"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Operational Config — Timezone */}
                <div className="settings-section glass-card" style={{ gridColumn: 'span 2' }}>
                    <h3>🌐 Operational Config</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Business Timezone</label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Used by Dashboard, Dispatch, and all date/time displays to correctly calculate "Today," "This Week," etc.
                            </p>
                            <select
                                className="form-select"
                                value={timezone}
                                onChange={e => { setTimezone(e.target.value); setSaved(false); }}
                            >
                                {TIMEZONES.map(tz => (
                                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                                Current: {new Date().toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' })}
                            </p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Detected Browser Timezone</label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Your browser reports this timezone automatically.
                            </p>
                            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                                {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={{ marginTop: '0.75rem', fontSize: '0.75rem', padding: '0.4rem 1rem' }}
                                onClick={() => { setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone); setSaved(false); }}
                            >
                                Use Browser Timezone
                            </button>
                        </div>
                    </div>
                </div>

                {/* Design Customization */}
                <div className="settings-section glass-card">
                    <h3>🎨 Design & Colors</h3>
                    <div className="form-group">
                        <label className="form-label">Chroma Gradients (Header)</label>
                        <div className="color-picker-group">
                            <div className="color-input-wrapper">
                                <input
                                    type="color"
                                    name="headerGradientStart"
                                    value={settings.headerGradientStart}
                                    onChange={handleChange}
                                />
                                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>START_VAL</span>
                            </div>
                            <div className="color-input-wrapper">
                                <input
                                    type="color"
                                    name="headerGradientEnd"
                                    value={settings.headerGradientEnd}
                                    onChange={handleChange}
                                />
                                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>END_VAL</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Primary UI Accent</label>
                        <div className="color-input-wrapper" style={{ width: 'fit-content' }}>
                            <input
                                type="color"
                                name="primaryColor"
                                value={settings.primaryColor}
                                onChange={handleChange}
                            />
                            <span className="text-secondary" style={{ fontSize: '0.8rem' }}>ACCENT_HEX</span>
                        </div>
                    </div>

                    <div className="live-preview-box">
                        <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>Real-time Rendering</label>
                        <div className="preview-card-compact">
                            <div
                                className="preview-header-mini"
                                style={{
                                    background: `linear-gradient(135deg, ${settings.headerGradientStart}, ${settings.headerGradientEnd})`
                                }}
                            >
                                {settings.logoUrl ? (
                                    <img src={settings.logoUrl} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ background: 'rgba(255,255,255,0.2)', width: 40, height: 40, borderRadius: 8 }} />
                                )}
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em' }}>{settings.businessName}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: 500 }}>{settings.tagline}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Policies Section - NEW */}
                <div className="settings-section glass-card" style={{ gridColumn: 'span 1' }}>
                    <h3>📜 Operational Policies</h3>
                    <div className="form-group">
                        <label className="form-label">Customer / Client Policy</label>
                        <textarea
                            name="policyCustomer"
                            className="form-input"
                            value={settings.policyCustomer}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Cancellation policy, waiting time charges, etc."
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Driver / Chauffeur Policy</label>
                        <textarea
                            name="policyDriver"
                            className="form-input"
                            value={settings.policyDriver}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Dress code, arrival procedures, greeting protocols..."
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Affiliate / Partner Policy</label>
                        <textarea
                            name="policyAffiliate"
                            className="form-input"
                            value={settings.policyAffiliate}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Commission rates, payment terms, vehicle standards..."
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                </div>

                {/* Contact & Footer */}
                <div className="settings-section glass-card">
                    <h3>📞 Contact & Footer</h3>
                    <div className="form-group">
                        <label className="form-label">Contact Secure Line</label>
                        <input
                            type="text"
                            name="contactPhone"
                            className="form-input"
                            value={settings.contactPhone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Liaison Email</label>
                        <input
                            type="email"
                            name="contactEmail"
                            className="form-input"
                            value={settings.contactEmail}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Global Web Addr</label>
                        <input
                            type="text"
                            name="contactWebsite"
                            className="form-input"
                            value={settings.contactWebsite}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Legal Footer / Policy</label>
                        <textarea
                            name="footerMessage"
                            className="form-input"
                            value={settings.footerMessage}
                            onChange={handleChange}
                            rows={3}
                            style={{ resize: 'none' }}
                        />
                    </div>
                </div>
            </div>

            <div className="save-bar">
                <div className="save-info">
                    {saved ? (
                        <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            PROTOCOLS SYNCED
                        </span>
                    ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>PENDING MODIFICATIONS DETECTED</span>
                    )}
                </div>
                <div className="settings-actions" style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={() => setSettings(defaultSettings)}>
                        RESET_PROTOCOLS
                    </button>
                    <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={handleSave}>
                        AUTHORIZE CHANGES
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateSettings;
