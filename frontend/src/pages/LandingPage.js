import React from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
    {
        icon: '📊',
        title: 'Track Trades',
        desc: 'Log every trade with full details and auto P&L calculation',
    },
    {
        icon: '🧠',
        title: 'Analyze Behavior',
        desc: 'Detect overtrading, revenge trading and bad habits automatically',
    },
    {
        icon: '🏆',
        title: 'Improve Results',
        desc: 'Get personalized recommendations based on your trading data',
    },
];

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0d1117', color: '#e2e8f0' }}>

            {/* Navbar */}
            <nav style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '18px 48px',
                borderBottom: '0.5px solid #1e2433',
                background: '#0a0e17',
                position: 'sticky', top: 0, zIndex: 10,
            }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.3px' }}>
                    Trade<span style={{ color: '#6366f1' }}>Lens</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '8px 20px', background: 'transparent',
                            border: '0.5px solid #1e2433', color: '#94a3b8',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                        }}
                        onMouseEnter={e => { e.target.style.borderColor = '#6366f1'; e.target.style.color = '#a5b4fc'; }}
                        onMouseLeave={e => { e.target.style.borderColor = '#1e2433'; e.target.style.color = '#94a3b8'; }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            padding: '8px 20px', background: '#6366f1',
                            border: 'none', color: '#fff',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                            fontWeight: 600,
                        }}
                    >
                        Register
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <div style={{ textAlign: 'center', padding: '100px 24px 80px' }}>
                <div style={{
                    display: 'inline-block',
                    background: '#6366f115', border: '0.5px solid #6366f140',
                    borderRadius: '20px', padding: '5px 14px',
                    fontSize: '12px', color: '#818cf8', marginBottom: '24px',
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                    Behavioral Analytics for Traders
                </div>
                <h1 style={{
                    fontSize: '48px', fontWeight: 700, lineHeight: 1.15,
                    color: '#e2e8f0', marginBottom: '20px', letterSpacing: '-0.5px',
                }}>
                    Understand Your{' '}
                    <span style={{ color: '#818cf8' }}>Trading Behavior</span>
                </h1>
                <p style={{
                    fontSize: '17px', color: '#4a5568',
                    maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.7,
                }}>
                    Track, analyze and improve your trades with a behavioral analytics engine built for serious traders.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            padding: '13px 36px', background: '#6366f1',
                            border: 'none', color: '#fff', borderRadius: '8px',
                            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        Get Started Free
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '13px 36px', background: 'transparent',
                            border: '0.5px solid #1e2433', color: '#94a3b8',
                            borderRadius: '8px', fontSize: '15px', cursor: 'pointer',
                        }}
                    >
                        Sign In
                    </button>
                </div>
            </div>

            {/* Features */}
            <div style={{
                display: 'flex', justifyContent: 'center',
                gap: '20px', padding: '0 48px 100px', flexWrap: 'wrap',
            }}>
                {FEATURES.map((f, i) => (
                    <div key={i} style={{
                        background: '#111827', borderRadius: '12px',
                        padding: '32px 28px', width: '280px', textAlign: 'center',
                        border: '0.5px solid #1e2433', flexShrink: 0,
                    }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '12px',
                            background: '#6366f115', border: '0.5px solid #6366f130',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '24px', margin: '0 auto 18px',
                        }}>
                            {f.icon}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0', marginBottom: '10px' }}>
                            {f.title}
                        </div>
                        <div style={{ color: '#4a5568', fontSize: '13px', lineHeight: 1.6 }}>
                            {f.desc}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{
                borderTop: '0.5px solid #1e2433', padding: '24px 48px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '12px',
            }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
                    Trade<span style={{ color: '#6366f1' }}>Lens</span>
                </div>
                <div style={{ fontSize: '12px', color: '#374151' }}>
                    © {new Date().getFullYear()} TradeLens. Built for serious traders.
                </div>
            </div>

        </div>
    );
};

export default LandingPage;