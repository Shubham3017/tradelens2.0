import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import WinRateByDay from '../components/charts/WinRateByDay';
import WinRateByHour from '../components/charts/WinRateByHour';
import PnlByStrategy from '../components/charts/PnlByStrategy';
import API from '../api/axios';

const StatCard = ({ label, value, valueColor }) => (
    <div className="stat-card">
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={valueColor ? { color: valueColor } : undefined}>
            {value ?? '—'}
        </div>
    </div>
);

const ScoreBar = ({ label, score }) => (
    <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</span>
            <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>
                {score ?? 0}/100
            </span>
        </div>
        <div className="progress-custom">
            <div className="progress-bar-custom" style={{ width: `${score ?? 0}%` }} />
        </div>
    </div>
);

const TraitList = ({ traits, icon, emptyMsg, emptyColor }) => (
    <div>
        {traits?.length === 0
            ? <div style={{ color: emptyColor, fontSize: '14px', padding: '8px 0' }}>{emptyMsg}</div>
            : traits?.map((trait, i) => (
                <div key={i} className="insight-item">{icon} {trait}</div>
            ))
        }
    </div>
);

const InsightsPage = () => {
    const [data, setData] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([API.get('/insights'), API.get('/analytics/basic')])
            .then(([insRes, anRes]) => {
                setData(insRes.data);
                setAnalytics(anRes.data);
            })
            .catch(() => setError('Failed to load insights. Please refresh.'))
            .finally(() => setLoading(false));
    }, []);

    const profile = data?.profile;

    const scores = [
        { label: 'Win Rate',      score: profile?.winRateScore },
        { label: 'R:R Ratio',     score: profile?.rrScore },
        { label: 'Discipline',    score: profile?.disciplineScore },
        { label: 'Profitability', score: profile?.profitabilityScore },
    ];

    return (
        <>
            <Sidebar />
            <div className="main-content">

                {loading && (
                    <div style={{ color: '#4a5568', padding: '60px 0', textAlign: 'center' }}>
                        Loading insights…
                    </div>
                )}

                {error && (
                    <div style={{
                        background: '#450a0a40', border: '0.5px solid #f8717160',
                        borderRadius: '8px', padding: '12px 16px',
                        color: '#f87171', marginBottom: '20px', fontSize: '13px',
                    }}>
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <h1 className="page-title">Insights</h1>

                        {/* Stat Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '25px' }}>
                            <StatCard
                                label="Win Rate"
                                value={`${analytics?.winRate ?? 0}%`}
                            />
                            <StatCard
                                label="Best Trade"
                                value={analytics?.bestTrade?.pnl != null ? `+₹${Number(analytics.bestTrade.pnl).toLocaleString('en-IN')}` : '—'}
                                valueColor="#34d399"
                            />
                            <StatCard
                                label="Worst Trade"
                                value={analytics?.worstTrade?.pnl != null ? `-₹${Math.abs(analytics.worstTrade.pnl).toLocaleString('en-IN')}` : '—'}
                                valueColor="#f87171"
                            />
                            <StatCard
                                label="Avg R:R"
                                value={analytics?.avgRR ?? '—'}
                                valueColor="#818cf8"
                            />
                        </div>

                        {/* Behavioral Insights */}
                        <div className="insight-box" style={{ marginBottom: '25px' }}>
                            <div className="section-title">🧠 Behavioral Insights</div>
                            {data?.insights?.length > 0
                                ? data.insights.map((insight, i) => (
                                    <div key={i} className="insight-item">{insight}</div>
                                ))
                                : <div style={{ color: '#4a5568', fontSize: '13px', paddingTop: '8px' }}>
                                    No insights yet. Add more trades to unlock analysis.
                                  </div>
                            }
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                            <div className="chart-container">
                                <div className="section-title">📅 Win Rate by Day</div>
                                {data?.winRateByDay
                                    ? <WinRateByDay data={data.winRateByDay} />
                                    : <p style={{ color: '#4a5568', fontSize: '13px', marginTop: '12px' }}>No data yet.</p>
                                }
                            </div>
                            <div className="chart-container">
                                <div className="section-title">⏰ Win Rate by Hour</div>
                                {data?.winRateByHour
                                    ? <WinRateByHour data={data.winRateByHour} />
                                    : <p style={{ color: '#4a5568', fontSize: '13px', marginTop: '12px' }}>No data yet.</p>
                                }
                            </div>
                        </div>

                        {/* P&L by Strategy */}
                        <div className="chart-container" style={{ marginBottom: '25px' }}>
                            <div className="section-title">🏆 P&L by Strategy</div>
                            {data?.pnlByStrategy
                                ? <PnlByStrategy data={data.pnlByStrategy} />
                                : <p style={{ color: '#4a5568', fontSize: '13px', marginTop: '12px' }}>No strategy data yet.</p>
                            }
                        </div>

                        {/* Trader Profile */}
                        {profile && (
                            <div className="insight-box" style={{ marginBottom: '25px' }}>
                                <div className="section-title">👤 Trader Profile</div>

                                {/* Profile Header */}
                                <div style={{
                                    background: '#0d1117', borderRadius: '8px',
                                    padding: '16px 20px', marginBottom: '24px',
                                    border: '0.5px solid #1e2433',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <div>
                                        <h3 style={{ color: '#818cf8', marginBottom: '4px', fontSize: '16px' }}>
                                            🏆 {profile.label}
                                        </h3>
                                        <p style={{ color: '#4a5568', fontSize: '13px', margin: 0 }}>
                                            Overall Score
                                        </p>
                                    </div>
                                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#e2e8f0' }}>
                                        {profile.overallScore}
                                        <span style={{ fontSize: '14px', color: '#4a5568', fontWeight: 400 }}>/100</span>
                                    </div>
                                </div>

                                {/* Score Bars */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div className="section-title" style={{ fontSize: '13px', color: '#4a5568', marginBottom: '14px' }}>
                                        SCORE BREAKDOWN
                                    </div>
                                    {scores.map(s => <ScoreBar key={s.label} {...s} />)}
                                </div>

                                {/* Traits */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                    <div>
                                        <div className="section-title" style={{ fontSize: '13px', color: '#34d399', marginBottom: '10px' }}>
                                            ➕ Positive Traits
                                        </div>
                                        <TraitList
                                            traits={profile.positiveTraits}
                                            icon="✅"
                                            emptyMsg="None recorded yet."
                                            emptyColor="#4a5568"
                                        />
                                    </div>
                                    <div>
                                        <div className="section-title" style={{ fontSize: '13px', color: '#f87171', marginBottom: '10px' }}>
                                            ⚠️ Areas to Improve
                                        </div>
                                        <TraitList
                                            traits={profile.negativeTraits}
                                            icon="⚠️"
                                            emptyMsg="All green! Keep it up."
                                            emptyColor="#34d399"
                                        />
                                    </div>
                                </div>

                                {/* Recommendation */}
                                {profile.recommendation && (
                                    <div style={{
                                        background: '#0d1117', border: '0.5px solid #1e2433',
                                        borderLeft: '3px solid #818cf8',
                                        borderRadius: '8px', padding: '15px 18px',
                                    }}>
                                        <div style={{ fontWeight: 600, color: '#818cf8', marginBottom: '6px', fontSize: '13px' }}>
                                            💡 Recommendation
                                        </div>
                                        <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                                            {profile.recommendation}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default InsightsPage;