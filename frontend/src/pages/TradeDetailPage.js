import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

const TradeDetailPage = () => {
    const { id } = useParams();
    const [trade, setTrade] = useState(null);
    const [avgPnl, setAvgPnl] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        API.get(`/trades/${id}`).then(res => setTrade(res.data));
        API.get('/analytics/basic').then(res => {
            const total = res.data.totalPnl;
            const count = res.data.totalTrades;
            setAvgPnl(count > 0 ? (total / count).toFixed(2) : 0);
        });
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Delete this trade?')) {
            await API.delete(`/trades/${id}`);
            navigate('/trades');
        }
    };

    if (!trade) return <div style={{ display: 'flex' }}><Sidebar /><div className="main-content">Loading...</div></div>;

    const perfVsAvg = avgPnl > 0
        ? (((trade.pnl - avgPnl) / Math.abs(avgPnl)) * 100).toFixed(1)
        : 0;

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div className="main-content">
                <div className="page-title">Trade Detail — {trade.symbol} {trade.tradeType}</div>

                <div className="form-container" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div><span style={{ color: '#aaaaaa' }}>Entry: </span>₹{trade.entryPrice}</div>
                        <div><span style={{ color: '#aaaaaa' }}>Exit: </span>₹{trade.exitPrice}</div>
                        <div><span style={{ color: '#aaaaaa' }}>P&L: </span>
                            <span className={trade.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>₹{trade.pnl}</span>
                        </div>
                        <div><span style={{ color: '#aaaaaa' }}>Result: </span>
                            <span className={trade.result === 'WIN' ? 'badge-win' : 'badge-loss'}>{trade.result}</span>
                        </div>
                        <div><span style={{ color: '#aaaaaa' }}>Strategy: </span>{trade.strategy}</div>
                        <div><span style={{ color: '#aaaaaa' }}>Quantity: </span>{trade.quantity}</div>
                        <div><span style={{ color: '#aaaaaa' }}>Stop Loss: </span>₹{trade.stopLoss}</div>
                        <div><span style={{ color: '#aaaaaa' }}>Target: </span>₹{trade.target}</div>
                    </div>
                    {trade.notes && (
                        <div style={{ marginTop: '15px' }}>
                            <span style={{ color: '#aaaaaa' }}>Notes: </span>{trade.notes}
                        </div>
                    )}
                </div>

                {/* Comparison */}
                <div className="form-container" style={{ marginBottom: '20px' }}>
                    <h6 style={{ color: '#aaaaaa', marginBottom: '15px' }}>Compared to your average</h6>
                    <div>This trade P&L: <span className="pnl-positive">₹{trade.pnl}</span></div>
                    <div>Your avg P&L: <span style={{ color: '#eaeaea' }}>₹{avgPnl}</span></div>
                    <div>Performance: <span className={perfVsAvg >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                        {perfVsAvg >= 0 ? '+' : ''}{perfVsAvg}% vs avg
                    </span></div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary-custom"
                        onClick={() => navigate(`/edit-trade/${id}`)}>
                        Edit Trade
                    </button>
                    <button onClick={handleDelete}
                        style={{
                            padding: '10px 25px', backgroundColor: 'transparent',
                            border: '1px solid #e94560', color: '#e94560',
                            borderRadius: '6px', cursor: 'pointer'
                        }}>
                        Delete Trade
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TradeDetailPage;