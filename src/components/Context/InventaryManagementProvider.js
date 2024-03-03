import React, { useState, useRef, createContext } from 'react';
import { BASE_PROD_URL, BASE_LOCAL_URL } from '../Constants';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast'
export const InventaryManagementContext = createContext();

function InventaryManagementProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isBackendUp, setIsBackendUp] = useState(true);
    const navigate = useNavigate();
    const toastRef = useRef(null);
    const fetchProducts = async () => {
        try {
            const response = await fetch(`${BASE_LOCAL_URL}getProducts`);
            const productsData = await response.json();
            setProducts(productsData);
        } catch (error) {
            setIsBackendUp(false);
        }
    }
    const showToast = (severity, message) => {
        toastRef.current.show({ severity: severity, summary: severity.toUpperCase(), detail: message, life: 2000 });
    }
    const validateUser = (credentials) => {
        if (credentials.username === "sevgrandson" && credentials.password === "grandson123") {
            sessionStorage.setItem("validUser", true);
            sessionStorage.setItem("adminUser", false);
            showToast("success", "Login success!!");
        } else if (credentials.username === "varusai" && credentials.password === "varusai123") {
            sessionStorage.setItem("validUser", true);
            sessionStorage.setItem("adminUser", true);
            showToast("success", "Login success!!");
        } else {
            sessionStorage.setItem("validUser", false);
            showToast("error", "Login failed. Please enter correct username & password.");
        }
    }

    const addProducts = async (product) => {
        try {
            const response = await fetch(`${BASE_LOCAL_URL}addNewProducts`, {
                method: "POST",
                body: JSON.stringify(product),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            });
            const addProductData = await response.json();
            showToast("success", "New product has been successfully added.");
            // console.log(addProductData);
            return addProductData;
        } catch (error) {
            setIsBackendUp(false);
            showToast("error", "Oops..Something went wrong. Please try again or reach support team.");
        }
    }
    const updateProducts = async (id, transaction) => {
        try {
            const updateURL = new URL(`${BASE_LOCAL_URL}updateProducts`);
            updateURL.searchParams.append("id", id);
            const response = await fetch(updateURL, {
                method: "PUT",
                body: JSON.stringify(transaction),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            });
            if (response.status === 200) {
                showToast("success", "Transaction successful.");
            }
            const updateProductData = await response.json();
            // console.log(updateProductData);
            return updateProductData;
        } catch (error) {
            setIsBackendUp(false);
            showToast("error", "Oops..Something went wrong. Please try again or reach support team.");
        }
    }
    const updateTransaction = async (product_id, current_stock, transaction) => {
        try {
            const updateURL = new URL(`${BASE_LOCAL_URL}updateTransaction`);
            updateURL.searchParams.append("product_id", product_id);
            updateURL.searchParams.append("current_stock", current_stock);
            const response = await fetch(updateURL, {
                method: "PUT",
                body: JSON.stringify(transaction),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            });
            if (response.status === 200) {
                fetchTransactions();
                showToast("success", "Transaction has been edited successfully.");
            }
            const updatedTransaction = await response.json();
            // console.log("Updated Transaction info", updatedTransaction);
        } catch (error) {
            setIsBackendUp(false);
            showToast("error", "Oops..Something went wrong. Please try again or reach support team.");
        }
    }

    const deleteTransaction = async (product_id, current_stock, transaction) => {
        try {
            const deleteURL = new URL(`${BASE_LOCAL_URL}deleteTransaction`);
            deleteURL.searchParams.append("product_id", product_id);
            deleteURL.searchParams.append("current_stock", current_stock);
            const response = await fetch(deleteURL, {
                method: "DELETE",
                body: JSON.stringify(transaction),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            });
            if (response.status === 200) {
                fetchTransactions();
                showToast("success", "Transaction has been deleted successfully.");
                // console.log("Transaction has been deleted..");
            }
        } catch (error) {
            setIsBackendUp(false);
            showToast("error", "Oops..Something went wrong. Please try again or reach support team.");
        }
    }

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`${BASE_LOCAL_URL}getTransactions`);
            const transactionsData = await response.json();
            setTransactions(transactionsData);
        } catch (error) {
            setIsBackendUp(false);
            showToast("error", "Oops..Something went wrong. Please try again or reach support team.");
        }
    }

    const takePrint = () => {
        // console.log("Print screen opened.");
        window.print();
    }
    const logout = () => {
        sessionStorage.setItem("validUser", false);
        navigate('/');
    }

    return (
        <InventaryManagementContext.Provider value={{ toastRef, showToast, products, transactions, fetchProducts, addProducts, updateProducts, fetchTransactions, updateTransaction, deleteTransaction, takePrint, isBackendUp, validateUser, logout }}>
            {children}
            <Toast ref={toastRef} />
        </InventaryManagementContext.Provider>
    );
}

export default InventaryManagementProvider;
