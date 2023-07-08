import React, { useState, createContext } from 'react';
import { BASE_URL } from '../Constants';

export const InventaryManagementContext = createContext();

function InventaryManagementProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [transactions,setTransactions]=useState([]);

    const fetchProducts = async () => {
        const response = await fetch(`${BASE_URL}getProducts`);
        const productsData = await response.json();
        setProducts(productsData);
    }
    const addProducts=async (product)=>{
        const response = await fetch(`${BASE_URL}addNewProducts`,{
            method:"POST",
            body:JSON.stringify(product),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        const addProductData = await response.json();
        console.log(addProductData);
        return addProductData;
        // need to check api success scenario
    }
    const updateProducts = async (id,transaction)=>{
        const updateURL= new URL(`${BASE_URL}updateProducts`);
        updateURL.searchParams.append("id",id);
        const response = await fetch(updateURL,{
            method:"PUT",
            body:JSON.stringify(transaction),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        const updateProductData = await response.json();
        console.log(updateProductData);
        return updateProductData;
    }
    const fetchTransactions=async ()=>{
        const response = await fetch(`${BASE_URL}getTransactions`);
        const transactionsData = await response.json();
        setTransactions(transactionsData);
    }
    const takePrint=()=>{
        console.log("Print screen opened.");
        window.print();
    }
    return (
        <InventaryManagementContext.Provider value={{products,transactions,fetchProducts,addProducts,updateProducts,fetchTransactions,takePrint}}>
            {children}
        </InventaryManagementContext.Provider>
    );
}

export default InventaryManagementProvider;
