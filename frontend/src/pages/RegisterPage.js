import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

const RegisterPage = () => {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.post('/auth/register', form);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-title">TradeLens</div>
                <div className="auth-subtitle">Create your account</div>
                {error && <div style={{ color: '#e94560', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <div className="form-label">Username</div>
                        <input type="text" name="username" className="form-control"
                            value={form.username} onChange={handleChange}
                            required style={{ width: '100%', padding: '10px' }} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <div className="form-label">Email</div>
                        <input type="email" name="email" className="form-control"
                            value={form.email} onChange={handleChange}
                            required style={{ width: '100%', padding: '10px' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <div className="form-label">Password</div>
                        <input type="password" name="password" className="form-control"
                            value={form.password} onChange={handleChange}
                            required style={{ width: '100%', padding: '10px' }} />
                    </div>
                    <button type="submit" className="btn-primary-custom"
                        style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#aaaaaa', fontSize: '14px' }}>
                    Have an account? <Link to="/login" style={{ color: '#e94560' }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;