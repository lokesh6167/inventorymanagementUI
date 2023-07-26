import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventaryManagementProvider from './components/Context/InventaryManagementProvider';
import CurrentStocks from './components/CurrentStocks';
import StockInflow from './components/StockInflow';
import StockOutflow from './components/StockOutflow';
import Transactions from './components/Transactions';
import PageNotFound from './components/PageNotFound';
import AddNewProduct from './components/AddNewProduct';
import ServerDownMessage from './components/ServerDownMessage';
import App from './App'
import UserLogin from './components/UserLogin';
import AuthGuard from './components/AuthGuard';

const AppRoutes = () => (
  <Routes>
    {/* No need to wrap UserLogin with App */}
    <Route path="/" element={<UserLogin />} />
    {/* Wrap these components with App */}
    <Route path="/currentstocks" element={<AuthGuard><App><CurrentStocks /></App></AuthGuard>} />
    <Route path="/stockoutflow" element={<AuthGuard><App><StockOutflow /></App></AuthGuard>} />
    <Route path="/stockinflow" element={<AuthGuard><App><StockInflow /></App></AuthGuard>} />
    <Route path="/addnewproduct" element={<AuthGuard><App><AddNewProduct /></App></AuthGuard>} />
    <Route path="/transactions" element={<AuthGuard><App><Transactions /></App></AuthGuard>} />
    <Route path="/serverdown" element={<AuthGuard><App><ServerDownMessage /></App></AuthGuard>} />
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <InventaryManagementProvider>
        <AppRoutes />
      </InventaryManagementProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
