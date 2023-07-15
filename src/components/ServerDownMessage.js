import React from 'react';
import serverDownImage from './assets/server-down.webp';

const ServerDownMessage = () => {
    return (
        <div className="server-down-container">
            <img src={serverDownImage} alt="Server Down" className="server-down-image" />
            <h2 className="server-down-heading">Oops! Something went wrong.</h2>
            <p className="server-down-text">
                We apologize for the inconvenience. Our server is currently down. Please try again later.
            </p>
        </div>
    );
};

export default ServerDownMessage;
