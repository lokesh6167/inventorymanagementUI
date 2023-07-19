import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";
//core
import "primereact/resources/primereact.min.css";

import './index.css';
import ServerDownMessage from './components/ServerDownMessage';

const root = ReactDOM.createRoot(document.getElementById('error'));
root.render(
    <React.StrictMode>
        <InventaryManagementProvider>
            <ServerDownMessage />
        </InventaryManagementProvider>
    </React.StrictMode>
);
