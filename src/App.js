import React, { useEffect, useContext } from 'react';
import './App.css';
import './Components.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { InventaryManagementContext } from './components/Context/InventaryManagementProvider';
import { Button } from 'primereact/button';

function App({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isBackendUp } = useContext(InventaryManagementContext);

  useEffect(() => {
    if (!isBackendUp) {
      navigate('/serverdown');
    }
  }, [isBackendUp, navigate]);

  return (
    <div>
      <body>
        <header className='navbar-light bg-light'>
          <div className='inventary-management-header'>
            <nav className="navbar navbar-expand-lg">
              <Link className="navbar-brand" to="/currentstocks">
                {/* <img src="./components/assets/sevgrandson-logo.jpeg" width="30" height="30" class="d-inline-block align-top" alt="sev-grandson-logo" /> */}
                <span className='h1 orange-font'>S.E.V GRANDSON</span>
              </Link>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className={`${location.pathname === '/currentstocks' ? 'active bold-underline' : ''} nav-item`}>
                    <Link className={`${location.pathname === '/currentstocks' ? 'orange-font' : ''} nav-link`} to="/currentstocks"><span className='h5'>Current Stock</span></Link>
                  </li>
                  <li className={`${location.pathname === "/stockinflow" ? 'active bold-underline' : ''} nav-item`}>
                    <Link className={`${location.pathname === '/stockinflow' ? 'orange-font' : ''} nav-link`} to="/stockinflow"><span className='h5'>Purchase</span></Link>
                  </li>
                  <li className={`${location.pathname === "/stockoutflow" ? 'active bold-underline' : ''} nav-item`}>
                    <Link className={`${location.pathname === '/stockoutflow' ? 'orange-font' : ''} nav-link`} to="/stockoutflow"><span className='h5'>Delivery</span></Link>
                  </li>
                  <li className={`${location.pathname === '/addnewproduct' ? 'active bold-underline' : ''} nav-item`}>
                    <Link className={`${location.pathname === '/addnewproduct' ? 'orange-font' : ''} nav-link`} to="/addnewproduct"><span className='h5'>Add Product</span></Link>
                  </li>
                  <li className={`${location.pathname === '/transactions' ? 'active bold-underline' : ''} nav-item`}>
                    <Link className={`${location.pathname === '/transactions' ? 'orange-font' : ''} nav-link`} to="/transactions"><span className='h5'>Transactions</span></Link>
                  </li>
                </ul>
              </div>
              <Button onClick={logout} label="Logout" severity="secondary" raised />
            </nav>
          </div>
        </header>
        {children}
      </body>
    </div>
  );
}

export default App;
