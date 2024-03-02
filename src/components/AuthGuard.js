import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
    const navigate = useNavigate();
    return sessionStorage.getItem("validUser") ? children : navigate('/');
};

export default AuthGuard;
