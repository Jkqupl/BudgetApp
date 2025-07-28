import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import MainLayout from '../layouts/MainLayout'; // includes Sidebar

import IncomePage from '../pages/IncomePage';
import ExpensesPage from '../pages/ExpensesPage';
import BudgetPage from '../pages/BudgetPage';
import HistoryPage from '../pages/HistoryPage';
import DashboardPage from '../pages/DashboardPage';

const AppRoutes = () => (
  <Routes>
    {/* Public routes (no sidebar) */}
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />

    {/* Protected/main routes (with sidebar via MainLayout) */}
    <Route element={<MainLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/income" element={<IncomePage />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/budget" element={<BudgetPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;
