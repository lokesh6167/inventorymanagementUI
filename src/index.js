import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";
//core
import "primereact/resources/primereact.min.css";

import './index.css';
import App from './App';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventaryManagementProvider from './components/Context/InventaryManagementProvider';
import CurrentStocks from './components/CurrentStocks';
import StockInflow from './components/StockInflow';
import StockOutflow from './components/StockOutflow';
import Transactions from './components/Transactions';
import PageNotFound from './components/PageNotFound';
import AddNewProduct from './components/AddNewProduct';
import ServerDownMessage from './components/ServerDownMessage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <InventaryManagementProvider>
      <Router>
        <App />
        <Routes>
          <Route path="/" element={<CurrentStocks />} />
          <Route path="/stockoutflow" element={<StockOutflow />} />
          <Route path="/stockinflow" element={<StockInflow />} />
          <Route path="/addnewproduct" element={<AddNewProduct />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/serverdown" element={<ServerDownMessage />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </InventaryManagementProvider>
  </React.StrictMode>
);
