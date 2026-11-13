import React, { useState, useEffect, useContext } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { InventaryManagementContext } from './Context/InventaryManagementProvider';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { validateUser } = useContext(InventaryManagementContext);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const validUser = sessionStorage.getItem('validUser');
        if (validUser === 'true') {
            // Redirect to the default dashboard or any other protected route
            navigate('/currentstocks');
        }
    }, [navigate]);

    const handleLogin = () => {
        const credentials = {
            username,
            password,
        };
        validateUser(credentials);
        if (sessionStorage.getItem('validUser') === 'true') {
            setError('');
            navigate('/currentstocks');
        } else {
            setError('Incorrect credentials. Please enter correct credentials.');
        }
    };
    const handleReset = () => {
        setUsername("");
        setPassword("");
    }
    // const header = (
    //     <img alt="sev-grandson" src="./assets/sevgrandson-logo.png" />
    // );
    const footer = (
        <div className="flex flex-wrap justify-content-end gap-2">
            <Button className="username-password-btns username-btn" label="Login" icon="pi pi-check" onClick={handleLogin} />
            <Button className="username-password-btns p-button-outlined p-button-secondary" label="Reset" icon="pi pi-times" onClick={handleReset} />
        </div>
    );

    return (
        <>
            <nav class="navbar navbar-light bg-light">
                <div className='inventary-management-header'>
                    <h1>S.E.V Grandson</h1>
                </div>
            </nav>
            <div className="card flex justify-content-center user-login-container">
                <Card title="Login Page" subTitle="Please enter username & password to validate you." footer={footer} className="md:w-25rem">
                    <div className="form-group row m-3">
                        <label htmlFor="Username" className="col-sm-4 col-form-label">
                            Username<span className="required-field">*</span>
                        </label>
                        <div className="col-sm-8">
                            <InputText
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full md:w-14rem form-field-generic-size username-pwd-width"
                                placeholder="Enter username"
                            />
                        </div>
                    </div>
                    <div className="form-group row m-3">
                        <label
                            htmlFor="password"
                            className="col-sm-4 col-form-label"
                        >
                            Password<span className="required-field">*</span>
                        </label>
                        <div className="col-sm-8">
                            <Password
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full md:w-14rem form-field-generic-size username-pwd-width"
                                placeholder="Enter password"
                                feedback={false}
                            />
                        </div>
                    </div>
                    {error && <small className="p-error display-block">{error}</small>}
                </Card>
            </div>
        </>
    );
};

export default UserLogin;
