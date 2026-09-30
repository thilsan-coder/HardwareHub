import React from 'react';
import ReactDOM from 'react-dom/client';
import HardwareHubApp from './HardwareHubApp.jsx';
import '../css/app.css';

const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <HardwareHubApp />
        </React.StrictMode>
    );
}
