import React from 'react';
import './App.css';
import './Components.css'
import { Outlet, Link } from 'react-router-dom';

function App() {
  
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
              <li class="nav-item active">
                <Link class="nav-link" to="/"><span className='h5'>Current Stock</span></Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link" to="/stockInflow"><span className='h5'>Stock Inflow</span></Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link" to="/stockOutflow"><span className='h5'>Stock Outflow</span></Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link" to="/addnewproduct"><span className='h5'>Add Product</span></Link>
              </li>
              <li class="nav-item">
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
