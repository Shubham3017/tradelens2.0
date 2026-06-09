import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await API.post('/auth/login', { email, password });
            login({ username: res.data.username, email: res.data.email }, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-title">TradeLens</div>
                <div className="auth-subtitle">Sign in to your account</div>
                {error && <div style={{ color: '#e94560', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <div className="form-label">Email</div>
                        <input type="email" className="form-control"
                            value={email} onChange={e => setEmail(e.target.value)}
                            required style={{ width: '100%', padding: '10px' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <div className="form-label">Password</div>
                        <input type="password" className="form-control"
                            value={password} onChange={e => setPassword(e.target.value)}
                            required style={{ width: '100%', padding: '10px' }} />
                    </div>
                    <button type="submit" className="btn-primary-custom"
                        style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#aaaaaa', fontSize: '14px' }}>
                    No account? <Link to="/register" style={{ color: '#e94560' }}>Register</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;