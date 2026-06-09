import React, { useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

const INITIAL_FORM = {
    symbol: '', tradeType: 'LONG', entryPrice: '',
    exitPrice: '', stopLoss: '', target: '', quantity: '',
    entryTime: '', exitTime: '', strategy: '', notes: ''
};

const STRATEGIES = ['Breakout', 'Reversal', 'Scalping', 'Swing', 'Momentum'];

const Field = ({ label, children }) => (
    <div>
        <label className="form-label">{label}</label>
        {children}
    </div>
);

const calcPreview = (form) => {
    const entry = parseFloat(form.entryPrice);
    const exit = parseFloat(form.exitPrice);
    const qty = parseInt(form.quantity);
    if (!entry || !exit || !qty) return null;
    const pnl = form.tradeType === 'LONG'
        ? (exit - entry) * qty
        : (entry - exit) * qty;
    return { pnl, result: pnl >= 0 ? 'WIN' : 'LOSS' };
};

const calcRR = (form) => {
    const entry = parseFloat(form.entryPrice);
    const sl = parseFloat(form.stopLoss);
    const target = parseFloat(form.target);
    if (!entry || !sl || !target) return null;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(target - entry);
    return risk > 0 ? (reward / risk).toFixed(2) : null;
};

const AddTradePage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = useCallback((e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await API.post('/trades', {
                ...form,
                symbol: form.symbol.toUpperCase().trim(),
                entryPrice: parseFloat(form.entryPrice),
                exitPrice: parseFloat(form.exitPrice) || null,
                stopLoss: parseFloat(form.stopLoss) || null,
                target: parseFloat(form.target) || null,
                quantity: parseInt(form.quantity),
                entryTime: form.entryTime ? form.entryTime + ':00' : null,
                exitTime: form.exitTime ? form.exitTime + ':00' : null,
            });
            navigate('/trades');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add trade. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const preview = calcPreview(form);
    const rr = calcRR(form);

    const inputStyle = { width: '100%', padding: '10px' };

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Add Trade</h1>
                    <button
                        type="button"
                        onClick={() => navigate('/trades')}
                        style={{
                            padding: '8px 18px', background: 'transparent',
                            border: '0.5px solid #1e2433', color: '#94a3b8',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                        }}
                    >
                        ← Back
                    </button>
                </div>

                {error && (
                    <div style={{
                        background: '#450a0a40', border: '0.5px solid #f8717160',
                        borderRadius: '8px', padding: '12px 16px',
                        color: '#f87171', marginBottom: '20px', fontSize: '13px',
                    }}>
                        {error}
                    </div>
                )}

                <div className="form-container">
                    <form onSubmit={handleSubmit}>

                        {/* Trade Identity */}
                        <div style={{ marginBottom: '20px' }}>
                            <div className="section-title" style={{ marginBottom: '14px', fontSize: '13px', color: '#4a5568' }}>
                                TRADE DETAILS
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <Field label="Symbol *">
                                    <input
                                        name="symbol" className="form-control"
                                        value={form.symbol} onChange={handleChange}
                                        placeholder="e.g. NIFTY50, RELIANCE"
                                        required style={inputStyle}
                                    />
                                </Field>
                                <Field label="Trade Type">
                                    <select name="tradeType" className="form-control"
                                        value={form.tradeType} onChange={handleChange}
                                        style={inputStyle}>
                                        <option value="LONG">LONG</option>
                                        <option value="SHORT">SHORT</option>
                                    </select>
                                </Field>
                                <Field label="Strategy">
                                    <select name="strategy" className="form-control"
                                        value={form.strategy} onChange={handleChange}
                                        style={inputStyle}>
                                        <option value="">Select strategy…</option>
                                        {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </Field>
                                <Field label="Quantity *">
                                    <input
                                        name="quantity" type="number" min="1"
                                        className="form-control"
                                        value={form.quantity} onChange={handleChange}
                                        placeholder="No. of shares / lots"
                                        required style={inputStyle}
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div style={{ borderTop: '0.5px solid #1e2433', paddingTop: '20px', marginBottom: '20px' }}>
                            <div className="section-title" style={{ marginBottom: '14px', fontSize: '13px', color: '#4a5568' }}>
                                PRICING
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <Field label="Entry Price *">
                                    <input name="entryPrice" type="number" step="0.01"
                                        className="form-control" value={form.entryPrice}
                                        onChange={handleChange} placeholder="₹0.00"
                                        required style={inputStyle} />
                                </Field>
                                <Field label="Exit Price">
                                    <input name="exitPrice" type="number" step="0.01"
                                        className="form-control" value={form.exitPrice}
                                        onChange={handleChange} placeholder="₹0.00"
                                        style={inputStyle} />
                                </Field>
                                <Field label="Stop Loss">
                                    <input name="stopLoss" type="number" step="0.01"
                                        className="form-control" value={form.stopLoss}
                                        onChange={handleChange} placeholder="₹0.00"
                                        style={inputStyle} />
                                </Field>
                                <Field label="Target">
                                    <input name="target" type="number" step="0.01"
                                        className="form-control" value={form.target}
                                        onChange={handleChange} placeholder="₹0.00"
                                        style={inputStyle} />
                                </Field>
                            </div>
                        </div>

                        {/* Timing */}
                        <div style={{ borderTop: '0.5px solid #1e2433', paddingTop: '20px', marginBottom: '20px' }}>
                            <div className="section-title" style={{ marginBottom: '14px', fontSize: '13px', color: '#4a5568' }}>
                                TIMING
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <Field label="Entry Time *">
                                    <input name="entryTime" type="datetime-local"
                                        className="form-control" value={form.entryTime}
                                        onChange={handleChange} required style={inputStyle} />
                                </Field>
                                <Field label="Exit Time">
                                    <input name="exitTime" type="datetime-local"
                                        className="form-control" value={form.exitTime}
                                        onChange={handleChange} style={inputStyle} />
                                </Field>
                            </div>
                        </div>

                        {/* Notes */}
                        <div style={{ borderTop: '0.5px solid #1e2433', paddingTop: '20px', marginBottom: '20px' }}>
                            <Field label="Notes">
                                <textarea
                                    name="notes" className="form-control"
                                    value={form.notes} onChange={handleChange}
                                    rows={3} placeholder="What was your reasoning? Any observations…"
                                    style={{ width: '100%', padding: '10px', resize: 'vertical' }}
                                />
                            </Field>
                        </div>

                        {/* Live Preview */}
                        {(preview || rr) && (
                            <div style={{
                                background: '#0d1117', border: '0.5px solid #1e2433',
                                borderRadius: '10px', padding: '16px 20px',
                                marginBottom: '20px', display: 'flex',
                                gap: '28px', alignItems: 'center', flexWrap: 'wrap',
                            }}>
                                <span style={{ fontSize: '12px', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Live Preview
                                </span>
                                {preview && (
                                    <>
                                        <div>
                                            <span style={{ fontSize: '11px', color: '#4a5568' }}>P&L</span>
                                            <div style={{
                                                fontSize: '18px', fontWeight: 700,
                                                color: preview.pnl >= 0 ? '#34d399' : '#f87171',
                                            }}>
                                                {preview.pnl >= 0 ? '+' : ''}₹{preview.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '11px', color: '#4a5568' }}>Result</span>
                                            <div>
                                                <span className={preview.result === 'WIN' ? 'badge-win' : 'badge-loss'}>
                                                    {preview.result}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {rr && (
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#4a5568' }}>R:R Ratio</span>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#818cf8' }}>
                                            1 : {rr}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                className="btn-primary-custom"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving…' : 'Save Trade'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/trades')}
                                style={{
                                    padding: '10px 25px', background: 'transparent',
                                    border: '0.5px solid #1e2433', color: '#94a3b8',
                                    borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddTradePage;