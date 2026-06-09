import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import EquityCurve from '../components/charts/EquityCurve';
import WinLossPie from '../components/charts/WinLossPie';
import API from '../api/axios';

const StatCard = ({ label, value, sub, valueColor }) => (
    <div className="stat-card">
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={valueColor ? { color: valueColor } : undefined}>
            {value ?? '—'}
        </div>
        {sub && <div className="stat-sub">{sub}</div>}
    </div>
);

const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([API.get('/analytics/basic'), API.get('/insights')])
            .then(([analyticsRes, insightsRes]) => {
                setData(analyticsRes.data);
                setInsights(insightsRes.data.insights || []);
            })
            .catch(() => setError('Failed to load dashboard data. Please refresh.'))
            .finally(() => setLoading(false));
    }, []);

    const pnl = data?.totalPnl ?? 0;
    const streak = data?.currentStreak ?? 0;
    const isWinStreak = streak > 0;

    return (
        <>
            <Sidebar />
            <div className="main-content">

                {loading && (
                    <div style={{ color: '#4a5568', padding: '60px 0', textAlign: 'center' }}>
                        Loading dashboard…
                    </div>
                )}

                {error && (
                    <div style={{
                        background: '#450a0a40', border: '0.5px solid #f8717160',
                        borderRadius: '8px', padding: '12px 16px',
                        color: '#f87171', marginBottom: '20px',
                    }}>
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <h1 className="page-title">Dashboard</h1>

                        {/* Stat Cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '20px',
                            marginBottom: '25px',
                        }}>
                            <StatCard
                                label="Total P&L"
                                value={`${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString('en-IN')}`}
                                valueColor={pnl >= 0 ? '#34d399' : '#f87171'}
                            />
                            <StatCard
                                label="Win Rate"
                                value={`${data?.winRate ?? 0}%`}
                                sub={`${data?.totalTrades ?? 0} trades`}
                            />
                            <StatCard
                                label="Total Trades"
                                value={data?.totalTrades ?? 0}
                            />
                            <StatCard
                                label="Avg R:R"
                                value={data?.avgRR ?? '—'}
                                valueColor="#818cf8"
                                sub={`Max Drawdown: ₹${data?.maxDrawdown?.toLocaleString('en-IN') ?? 0}`}
                            />
                        </div>

                        {/* Charts */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '20px',
                            marginBottom: '25px',
                        }}>
                            <div className="chart-container">
                                <div className="section-title">Equity Curve</div>
                                {data?.equityCurve?.length > 0
                                    ? <EquityCurve data={data.equityCurve} />
                                    : <p style={{ color: '#4a5568', fontSize: '13px', marginTop: '12px' }}>No equity data yet.</p>
                                }
                            </div>
                            <div className="chart-container">
                                <div className="section-title">Win / Loss</div>
                                <WinLossPie winRate={data?.winRate ?? 0} />
                            </div>
                        </div>

                        {/* Streak */}
                        <div className="streak-box" style={{ marginBottom: '20px' }}>
                            {isWinStreak
                                ? `🔥 Win streak: ${streak} trade${streak !== 1 ? 's' : ''}`
                                : `⚠️ Loss streak: ${Math.abs(streak)} trade${Math.abs(streak) !== 1 ? 's' : ''} — consider reducing size`
                            }
                        </div>

                        {/* Insights */}
                        <div className="insight-box">
                            <div className="section-title">💡 Behavioral Insights</div>
                            {insights.length > 0
                                ? insights.map((insight, i) => (
                                    <div key={i} className="insight-item">{insight}</div>
                                ))
                                : <div style={{ color: '#4a5568', fontSize: '13px', paddingTop: '8px' }}>
                                    No insights yet. Add more trades to unlock analysis.
                                  </div>
                            }
                        </div>
                    </>
                )}

            </div>
        </>
    );
};

export default DashboardPage;