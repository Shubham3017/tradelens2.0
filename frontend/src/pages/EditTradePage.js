import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditTradePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        API.get(`/trades/${id}`).then(res => {
            const t = res.data;
            setForm({
                symbol: t.symbol, tradeType: t.tradeType,
                entryPrice: t.entryPrice, exitPrice: t.exitPrice,
                stopLoss: t.stopLoss, target: t.target, quantity: t.quantity,
                entryTime: t.entryTime?.slice(0, 16),
                exitTime: t.exitTime?.slice(0, 16),
                strategy: t.strategy, notes: t.notes
            });
        });
    }, [id]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await API.put(`/trades/${id}`, {
                ...form,
                entryPrice: parseFloat(form.entryPrice),
                exitPrice: parseFloat(form.exitPrice),
                stopLoss: parseFloat(form.stopLoss),
                target: parseFloat(form.target),
                quantity: parseInt(form.quantity),
                entryTime: form.entryTime + ':00',
                exitTime: form.exitTime + ':00'
            });
            navigate(`/trades/${id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update trade');
        }
    };

    if (!form) return <div style={{ display: 'flex' }}><Sidebar /><div className="main-content">Loading...</div></div>;

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div className="main-content">
                <div className="page-title">Edit Trade</div>
                {error && <div style={{ color: '#e94560', marginBottom: '15px' }}>{error}</div>}
                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {[
                                { label: 'Symbol', name: 'symbol', type: 'text' },
                                { label: 'Entry Price', name: 'entryPrice', type: 'number' },
                                { label: 'Exit Price', name: 'exitPrice', type: 'number' },
                                { label: 'Stop Loss', name: 'stopLoss', type: 'number' },
                                { label: 'Target', name: 'target', type: 'number' },
                                { label: 'Quantity', name: 'quantity', type: 'number' },
                                { label: 'Entry Time', name: 'entryTime', type: 'datetime-local' },
                                { label: 'Exit Time', name: 'exitTime', type: 'datetime-local' },
                            ].map(field => (
                                <div key={field.name}>
                                    <div className="form-label">{field.label}</div>
                                    <input name={field.name} type={field.type}
                                        className="form-control"
                                        value={form[field.name] || ''}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '10px' }} />
                                </div>
                            ))}
                            <div>
                                <div className="form-label">Trade Type</div>
                                <select name="tradeType" className="form-control"
                                    value={form.tradeType} onChange={handleChange}
                                    style={{ width: '100%', padding: '10px' }}>
                                    <option value="LONG">LONG</option>
                                    <option value="SHORT">SHORT</option>
                                </select>
                            </div>
                            <div>
                                <div className="form-label">Strategy</div>
                                <select name="strategy" className="form-control"
                                    value={form.strategy} onChange={handleChange}
                                    style={{ width: '100%', padding: '10px' }}>
                                    <option value="Breakout">Breakout</option>
                                    <option value="Reversal">Reversal</option>
                                    <option value="Scalping">Scalping</option>
                                    <option value="Swing">Swing</option>
                                    <option value="Momentum">Momentum</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: '15px' }}>
                            <div className="form-label">Notes</div>
                            <textarea name="notes" className="form-control"
                                value={form.notes || ''} onChange={handleChange}
                                rows={3} style={{ width: '100%', padding: '10px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="button" onClick={() => navigate(`/trades/${id}`)}
                                style={{
                                    padding: '10px 25px', backgroundColor: 'transparent',
                                    border: '1px solid #0f3460', color: '#eaeaea',
                                    borderRadius: '6px', cursor: 'pointer'
                                }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary-custom">
                                Update Trade
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTradePage;