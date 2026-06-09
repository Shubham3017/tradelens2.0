import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AddTradePage from './pages/AddTradePage';
import EditTradePage from './pages/EditTradePage';
import TradeHistoryPage from './pages/TradeHistoryPage';
import TradeDetailPage from './pages/TradeDetailPage';
import InsightsPage from './pages/InsightsPage';
import ProfilePage from './pages/ProfilePage';
import './styles/global.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/dashboard" element={
                        <PrivateRoute><DashboardPage /></PrivateRoute>
                    } />
                    <Route path="/trades" element={
                        <PrivateRoute><TradeHistoryPage /></PrivateRoute>
                    } />
                    <Route path="/trades/:id" element={
                        <PrivateRoute><TradeDetailPage /></PrivateRoute>
                    } />
                    <Route path="/add-trade" element={
                        <PrivateRoute><AddTradePage /></PrivateRoute>
                    } />
                    <Route path="/edit-trade/:id" element={
                        <PrivateRoute><EditTradePage /></PrivateRoute>
                    } />
                    <Route path="/insights" element={
                        <PrivateRoute><InsightsPage /></PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute><ProfilePage /></PrivateRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;