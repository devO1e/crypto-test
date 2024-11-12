import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Markets from '../pages/Markets';
import MarketDetailPage from '../pages/MarketDetailPage';
import MainLayout from '../layouts/MainLayout';

const AppRoutes: React.FC = () => (
  <MainLayout>
    <Router>
      <Routes>
        <Route path="/" element={<Markets />} />
        <Route path="/market/:marketId" element={<MarketDetailPage />} />
      </Routes>
    </Router>
  </MainLayout>
);

export default AppRoutes;
