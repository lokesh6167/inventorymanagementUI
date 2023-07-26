import React, { useState, createContext } from 'react';
import { BASE_LOCAL_URL, BASE_PROD_URL } from '../Constants';
import { useNavigate } from 'react-router-dom';

export const InventaryManagementContext = createContext();

function InventaryManagementProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isBackendUp, setIsBackendUp] = useState(true);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${BASE_PROD_URL}getProducts`);
            const productsData = await response.json();
            setProducts(productsData);
        } catch (error) {
            setIsBackendUp(false);
        }
    }
    const validateUser = (credentials) => {
        if (credentials.username === "sevgrandson" && credentials.password === "grandson123") {
            return localStorage.setItem("validUser", true);
        }
        return localStorage.setItem("validUser", false);
    }

    const addProducts = async (product) => {
        try {
            const response = await fetch(`${BASE_PROD_URL}addNewProducts`, {
                method: "POST",
                body: JSON.stringify(product),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            });
            const addProductData = await response.json();
            console.log(addProductData);
            return addProductData;
        } catch (error) {
            setIsBackendUp(false);
        }
        // need to check api success scenario
    }
    const updateProducts = async (id, transaction) => {
        try {
            const updateURL = new URL(`${BASE_PROD_URL}updateProducts`);
            updateURL.searchParams.append("id", id);
            const response = await fetch(updateURL, {
                method: "PUT",
                body: JSON.stringify(transaction),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            });
            const updateProductData = await response.json();
            console.log(updateProductData);
            return updateProductData;
        } catch (error) {
            setIsBackendUp(false);
        }
    }
    const fetchTransactions = async () => {
        try {
            const response = await fetch(`${BASE_PROD_URL}getTransactions`);
            const transactionsData = await response.json();
            setTransactions(transactionsData);
        } catch (error) {
            setIsBackendUp(false);
        }
    }
    const takePrint = () => {
        console.log("Print screen opened.");
        window.print();
    }
    const logout = () => {
        localStorage.setItem("validUser", false);
        navigate('/');
    }

    return (
        <InventaryManagementContext.Provider value={{ products, transactions, fetchProducts, addProducts, updateProducts, fetchTransactions, takePrint, isBackendUp, validateUser, logout }}>
            {children}
        </InventaryManagementContext.Provider>
    );
}

export default InventaryManagementProvider;
