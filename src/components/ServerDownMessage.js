import React from 'react';
import { useNavigate } from 'react-router-dom';
import serverDownImage from './assets/server-down.webp';
import { Button } from 'primereact/button';

const ServerDownMessage = () => {
    const navigate = useNavigate();
    const handleTryAgain = () => {
        navigate('/');
    }
    return (
        <div className="server-down-container">
            <img src={serverDownImage} alt="Server Down" className="server-down-image" />
            <h2 className="server-down-heading">Oops! Something went wrong.</h2>
            <p className="server-down-text">
                We apologize for the inconvenience. Our server is currently down. Please try again later or reach support team.
            </p>
            <Button onClick={handleTryAgain}> Try again</Button>
        </div>
    );
};

export default ServerDownMessage;
