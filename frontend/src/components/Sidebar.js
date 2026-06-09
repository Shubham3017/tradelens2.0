import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-brand">TradeLens</div>
            <span className="sidebar-brand-sub">Analytics Platform</span>

            <NavLink to="/dashboard" className="sidebar-link">
                📊 Dashboard
            </NavLink>
            <NavLink to="/trades" className="sidebar-link">
                📋 Trade History
            </NavLink>
            <NavLink to="/add-trade" className="sidebar-link">
                ➕ Add Trade
            </NavLink>
            <NavLink to="/insights" className="sidebar-link">
                🧠 Insights
            </NavLink>
            <NavLink to="/profile" className="sidebar-link">
                👤 Profile
            </NavLink>

            <button className="sidebar-logout" onClick={handleLogout}>
                🚪 Logout
            </button>
        </div>
    );
};

export default Sidebar;