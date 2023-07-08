import React, { useEffect,useContext} from 'react';
import {InventaryManagementContext} from './Context/InventaryManagementProvider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';

function CurrentStocks() {
    // const [productsData,setProductsData]=useState([]);
    const {products,fetchProducts}=useContext(InventaryManagementContext);
    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className='current-stocks-container'>
            <p class="h2">Current Stock</p>
            <Divider />
            <div className="card">
                <DataTable value={products} tableStyle={{ minWidth: '50rem' }}>
                    <Column field="id" header="Id"></Column>
                    <Column field="wareHouseCode" header="WareHouse Code"></Column>
                    <Column field="productGroup" header="Product Group"></Column>
                    <Column field="productItem" header="Product Name"></Column>
                    <Column field="stockQuantity" header="Stock Quantity"></Column>
                </DataTable>
            </div>
        </div>
    );
}

export default CurrentStocks;
