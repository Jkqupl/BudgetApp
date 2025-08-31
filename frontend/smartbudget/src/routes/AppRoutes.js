import React from 'react';
import { Routes, Route } from 'react-router-dom';
import '../index.css';


import HomePage from '../pages/HomePage';
import SignUp from '../pages/SignUpPage';
import SignIn from '../pages/LoginPage';
import MainLayout from '../layouts/MainLayout'; // includes Sidebar

import IncomePage from '../pages/IncomePage';
import ExpensesPage from '../pages/SpendingPage';
import GoalsPage from '../pages/GoalsPage';
import HistoryPage from '../pages/HistoryPage';
import DashboardPage from '../pages/DashboardPage';
import Profile from '../pages/ProfilePage'; // 

import PrivateRoute from '../components/PrivateRoute'; // for protecting routes

const AppRoutes = () => (
  <Routes>
    {/* Public routes (no sidebar) */}
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<SignIn />} />
    <Route path="/signup" element={<SignUp />} />

    {/* Protected/main routes (with sidebar via MainLayout) */}
    <Route element={<MainLayout />}>
      <Route path="/profile" element={ <PrivateRoute> <Profile/> </PrivateRoute> } />
      <Route path="/dashboard" element={ <PrivateRoute> <DashboardPage/> </PrivateRoute> } />
      <Route path="/income" element={<PrivateRoute> <IncomePage /> </PrivateRoute> } />
      <Route path="/expenses" element={<PrivateRoute>  <ExpensesPage />  </PrivateRoute>} />
      <Route path="/goals" element={<PrivateRoute>  <GoalsPage />  </PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute>  <HistoryPage />   </PrivateRoute>} />
    </Route>
  </Routes>
);

export default AppRoutes;
