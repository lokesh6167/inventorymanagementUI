import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
    const navigate = useNavigate();
    return localStorage.getItem("validUser") ? children : navigate('/');
};

export default AuthGuard;
