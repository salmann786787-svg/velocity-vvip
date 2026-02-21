import { useState } from 'react';
import { AuthAPI } from '../services/api';
import './Login.css';

interface LoginProps {
    onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [registrationSecret, setRegistrationSecret] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                await AuthAPI.register(email, password, name, registrationSecret);
            } else {
                await AuthAPI.login(email, password);
            }
            onLogin();
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-icon">
                        <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" fill="url(#gradient-login)" />
                            <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="gradient-login" x1="0" y1="0" x2="40" y2="40">
                                    <stop offset="0%" stopColor="hsl(280, 90%, 60%)" />
                                    <stop offset="100%" stopColor="hsl(200, 100%, 60%)" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h2>Velocity VVIP</h2>
                    <p>Management Suite</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    {isRegistering && (
                        <>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Registration Secret</label>
                                <input
                                    type="password"
                                    value={registrationSecret}
                                    onChange={(e) => setRegistrationSecret(e.target.value)}
                                    required
                                    placeholder="Ask administrator for key"
                                />
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@velocityvvip.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            className="toggle-auth-btn"
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                            }}
                        >
                            {isRegistering ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
