import React from 'react';
import './App.css';
import './Components.css'
import { Outlet, Link, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  return (
    <div>
      <header className='navbar-light bg-light'>
        <div className='inventary-management-header'>
          <nav class="navbar navbar-expand-lg">
            <Link class="navbar-brand" to="/"><span className='h1'>S.E.V GRANDSON</span></Link>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav">
                <li className={`${location.pathname === '/' ? 'active bold-underline' : ''} "nav-item"`}>
                  <Link class="nav-link" to="/"><span className='h5'>Current Stock</span></Link>
                </li>
                <li className={`${location.pathname === "/stockinflow" ? 'active bold-underline' : ''} "nav-item"`}>
                  <Link class="nav-link" to="/stockinflow"><span className='h5'>Stock Inflow</span></Link>
                </li>
                <li className={`${location.pathname === "/stockoutflow" ? 'active bold-underline' : ''} "nav-item"`}>
                  <Link class="nav-link" to="/stockoutflow"><span className='h5'>Stock Outflow</span></Link>
                </li>
                <li className={`${location.pathname === '/addnewproduct' ? 'active bold-underline' : ''} "nav-item"`}>
                  <Link class="nav-link" to="/addnewproduct"><span className='h5'>Add Product</span></Link>
                </li>
                <li className={`${location.pathname === '/transactions' ? 'active bold-underline' : ''} "nav-item"`}>
                  <Link class="nav-link" to="/transactions"><span className='h5'>Transactions</span></Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </header>
      <body>
        <Outlet />
      </body>
    </div>
  );
}

export default App;
