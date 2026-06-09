import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';

const PER_PAGE = 10;
const FILTERS = ['ALL', 'WIN', 'LOSS'];

const fmt = (n) => Math.abs(Number(n)).toLocaleString('en-IN', { minimumFractionDigits: 0 });

const TypeBadge = ({ type }) => (
  <span style={{
    fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
    background: type === 'BUY' ? '#064e3b40' : '#7f1d1d40',
    border: `0.5px solid ${type === 'BUY' ? '#34d39940' : '#f8717140'}`,
    color: type === 'BUY' ? '#34d399' : '#f87171',
  }}>{type}</span>
);

const ResultBadge = ({ result }) => (
  <span style={{
    display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.3px',
    background: result === 'WIN' ? '#052e1640' : '#450a0a40',
    border: `0.5px solid ${result === 'WIN' ? '#34d39960' : '#f8717160'}`,
    color: result === 'WIN' ? '#34d399' : '#f87171',
  }}>{result}</span>
);

const PnlCell = ({ value }) => {
  const pos = Number(value) >= 0;
  return (
    <span style={{ color: pos ? '#34d399' : '#f87171', fontWeight: 700 }}>
      {pos ? '+' : '-'}₹{fmt(value)}
    </span>
  );
};

const SortArrow = ({ col, sortKey, sortDir }) => (
  <span style={{ marginLeft: '4px', color: sortKey === col ? '#818cf8' : '#374151', fontSize: '10px' }}>
    {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
  </span>
);

const TradeHistoryPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: 'entryTime', dir: 'desc' });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    API.get('/trades')
      .then(res => setTrades(res.data))
      .catch(() => setError('Failed to load trades. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = useCallback((key) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...trades]
      .filter(t => {
        const matchQ = !q || t.symbol?.toLowerCase().includes(q) || t.strategy?.toLowerCase().includes(q);
        const matchF = filter === 'ALL' || t.result === filter;
        return matchQ && matchF;
      })
      .sort((a, b) => {
        const av = a[sort.key] ?? '', bv = b[sort.key] ?? '';
        if (av < bv) return sort.dir === 'asc' ? -1 : 1;
        if (av > bv) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [trades, search, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const curPage = Math.min(page, totalPages);
  const paginated = filtered.slice((curPage - 1) * PER_PAGE, curPage * PER_PAGE);

  const wins = filtered.filter(t => t.result === 'WIN').length;
  const totalPnl = filtered.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const winRate = filtered.length ? Math.round((wins / filtered.length) * 100) : 0;

  const columns = [
    ['Symbol', 'symbol', 'left'],
    ['Type', null, 'left'],
    ['Entry', 'entryPrice', 'right'],
    ['Exit', 'exitPrice', 'right'],
    ['Qty', 'quantity', 'right'],
    ['P&L', 'pnl', 'right'],
    ['Result', 'result', 'center'],
    ['Strategy', 'strategy', 'left'],
    ['Date', 'entryTime', 'right'],
  ];

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ padding: '28px 32px', minHeight: '100vh', boxSizing: 'border-box' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Trade History</h1>
            <p style={{ fontSize: '12px', color: '#4a5568', marginTop: '3px', marginBottom: 0 }}>
              {filtered.length} trade{filtered.length !== 1 ? 's' : ''} · Win rate: {winRate}%
            </p>
          </div>
          <button
            onClick={() => navigate('/add-trade')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#6366f1', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '9px 16px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            + Add Trade
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total Trades', val: filtered.length, color: '#e2e8f0' },
            { label: 'Wins', val: `${wins} / ${filtered.length}`, color: '#34d399' },
            {
              label: 'Total P&L',
              val: `${totalPnl >= 0 ? '+' : '-'}₹${fmt(totalPnl)}`,
              color: totalPnl >= 0 ? '#34d399' : '#f87171',
            },
          ].map(s => (
            <div key={s.label} style={{ background: '#111827', borderRadius: '10px', padding: '14px 18px', border: '0.5px solid #1e2433' }}>
              <div style={{ fontSize: '11px', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#4a5568', fontSize: '14px', pointerEvents: 'none' }}>🔍</span>
            <input
              placeholder="Search symbol or strategy…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: '100%', background: '#111827', border: '0.5px solid #1e2433',
                borderRadius: '8px', padding: '9px 12px 9px 34px',
                color: '#cbd5e0', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                style={{
                  padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                  border: `0.5px solid ${filter === f ? '#6366f1' : '#1e2433'}`,
                  background: filter === f ? '#6366f120' : 'transparent',
                  color: filter === f ? '#a5b4fc' : '#4a5568',
                  fontSize: '12px', fontWeight: 600,
                }}
              >{f}</button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: '#450a0a40', border: '0.5px solid #f8717160', borderRadius: '8px', padding: '12px 16px', color: '#f87171', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#111827', borderRadius: '12px', border: '0.5px solid #1e2433', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#374151' }}>Loading trades…</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '11%' }} /><col style={{ width: '8%' }} />
                <col style={{ width: '10%' }} /><col style={{ width: '10%' }} />
                <col style={{ width: '7%' }} /><col style={{ width: '12%' }} />
                <col style={{ width: '9%' }} /><col style={{ width: '14%' }} />
                <col style={{ width: '11%' }} />
              </colgroup>
              <thead>
                <tr>
                  {columns.map(([label, col, align]) => (
                    <th
                      key={label}
                      onClick={col ? () => handleSort(col) : undefined}
                      style={{
                        padding: '10px 12px', fontSize: '11px', fontWeight: 500,
                        color: '#4a5568', textAlign: align, letterSpacing: '0.5px',
                        textTransform: 'uppercase', borderBottom: '0.5px solid #1e2433',
                        whiteSpace: 'nowrap', cursor: col ? 'pointer' : 'default', userSelect: 'none',
                      }}
                    >
                      {label}
                      {col && <SortArrow col={col} sortKey={sort.key} sortDir={sort.dir} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '50px', textAlign: 'center', color: '#374151', fontSize: '13px' }}>
                      {search || filter !== 'ALL' ? 'No trades match your filters.' : 'No trades recorded yet.'}
                    </td>
                  </tr>
                ) : paginated.map((t, i) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/trades/${t.id}`)}
                    style={{ cursor: 'pointer', background: i % 2 === 1 ? '#0a0f1a' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#161f30'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 1 ? '#0a0f1a' : 'transparent'}
                  >
                    <td style={{ padding: '13px 12px', fontSize: '13px', fontWeight: 700, color: '#e2e8f0', borderBottom: '0.5px solid #0f1520' }}>{t.symbol}</td>
                    <td style={{ padding: '13px 12px', fontSize: '13px', borderBottom: '0.5px solid #0f1520' }}><TypeBadge type={t.tradeType} /></td>
                    <td style={{ padding: '13px 12px', fontSize: '13px', color: '#94a3b8', textAlign: 'right', borderBottom: '0.5px solid #0f1520' }}>₹{Number(t.entryPrice).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '13px 12px', fontSize: '13px', color: '#94a3b8', textAlign: 'right', borderBottom: '0.5px solid #0f1520' }}>₹{Number(t.exitPrice).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '13px 12px', fontSize: '13px', color: '#94a3b8', textAlign: 'right', borderBottom: '0.5px solid #0f1520' }}>{t.quantity}</td>
                    <td style={{ padding: '13px 12px', textAlign: 'right', borderBottom: '0.5px solid #0f1520' }}><PnlCell value={t.pnl} /></td>
                    <td style={{ padding: '13px 12px', textAlign: 'center', borderBottom: '0.5px solid #0f1520' }}><ResultBadge result={t.result} /></td>
                    <td style={{ padding: '13px 12px', fontSize: '12px', color: '#818cf8', borderBottom: '0.5px solid #0f1520', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.strategy || '—'}</td>
                    <td style={{ padding: '13px 12px', fontSize: '12px', color: '#374151', textAlign: 'right', borderBottom: '0.5px solid #0f1520' }}>{t.entryTime?.split('T')[0] ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: '#4a5568' }}>
              Showing {(curPage - 1) * PER_PAGE + 1}–{Math.min(curPage * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { label: '‹', onClick: () => setPage(p => p - 1), disabled: curPage === 1 },
                ...Array.from({ length: totalPages }, (_, i) => ({ label: i + 1, onClick: () => setPage(i + 1), active: i + 1 === curPage })),
                { label: '›', onClick: () => setPage(p => p + 1), disabled: curPage === totalPages },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.onClick}
                  disabled={btn.disabled}
                  style={{
                    width: '30px', height: '30px', borderRadius: '6px',
                    border: `0.5px solid ${btn.active ? '#6366f1' : '#1e2433'}`,
                    background: btn.active ? '#6366f1' : 'transparent',
                    color: btn.active ? '#fff' : btn.disabled ? '#2d3748' : '#4a5568',
                    fontSize: '13px', cursor: btn.disabled ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >{btn.label}</button>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default TradeHistoryPage;
