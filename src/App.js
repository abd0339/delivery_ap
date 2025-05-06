import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ShopOwnerDashboard from './pages/ShopOwnerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import CreateOrder from './pages/CreateOrder';
import Wallet from './pages/Wallet';
import AddFunds from './pages/AddFunds';
import WithdrawFunds from './pages/WithdrawFunds';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import IDVerification from './pages/IDVerification';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Shop Owner Routes */}
        <Route path="/shop-owner-dashboard" element={<ShopOwnerDashboard />} />
        <Route path="/create-order" element={<CreateOrder />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/add-funds" element={<AddFunds />} />
        <Route path="/withdraw-funds" element={<WithdrawFunds />} />
        <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
        <Route path="/profile" element={<Profile />} />

        {/* Driver Routes */}
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/id-verification" element={<IDVerification />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Add more routes here as we create more pages */}
      </Routes>
    </Router>
  );
};

export default App;