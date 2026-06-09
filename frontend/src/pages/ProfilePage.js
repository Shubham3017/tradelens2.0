import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const InfoField = ({ label, value }) => (
    <div style={{ marginBottom: '16px' }}>
        <div className="form-label">{label}</div>
        <div style={{
            padding: '10px 15px',
            background: '#0d1117',
            borderRadius: '6px',
            color: '#e2e8f0',
            fontSize: '14px',
            border: '0.5px solid #1e2433',
        }}>
            {value || '—'}
        </div>
    </div>
);

const ProfilePage = () => {
    const { user } = useAuth();

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : '?';

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <h1 className="page-title">Profile</h1>

                <div className="form-container" style={{ maxWidth: '560px' }}>

                    {/* Avatar + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
                        <div style={{
                            width: '72px', height: '72px',
                            borderRadius: '50%',
                            background: '#6366f120',
                            border: '2px solid #6366f1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '24px', color: '#818cf8', fontWeight: 700,
                            flexShrink: 0,
                        }}>
                            {initials}
                        </div>
                        <div>
                            <h2 style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                                {user?.username || 'Unknown User'}
                            </h2>
                            <p style={{ color: '#4a5568', fontSize: '13px', margin: 0 }}>
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: '0.5px solid #1e2433', marginBottom: '24px' }} />

                    {/* Fields */}
                    <InfoField label="Username" value={user?.username} />
                    <InfoField label="Email" value={user?.email} />
                    <InfoField label="Member Since" value={memberSince} />

                </div>
            </div>
        </>
    );
};

export default ProfilePage;