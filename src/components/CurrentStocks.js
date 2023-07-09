import React, { useEffect, useContext, useState } from 'react';
import { InventaryManagementContext } from './Context/InventaryManagementProvider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';

function CurrentStocks() {
    const { products, fetchProducts, takePrint } = useContext(InventaryManagementContext);
    const [filteredStocksFlag, setFilteredStocksFlag] = useState(false);
    const [filteredStocks, setFilteredStocks] = useState(null);
    const [showFilterOptionsDialog, setShowFilterOptionsDialog] = useState(false);
    const [filterWareHouseCode, setFilterWareHouseCode] = useState([]);
    const [filterProductGroup, setFilterProductGroup] = useState("");
    const [filterProductName, setFilterProductName] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const dialogFuncMap = {
        'filterStocks': setShowFilterOptionsDialog
    }

    const onClick = (name, position) => {
        dialogFuncMap[`${name}`](true);
    }

    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
    }
    const submitFilterStocks = (name) => {
        const filteredStocks = products.filter((product) => {
            if (filterWareHouseCode) {
                filterWareHouseCode.forEach(wareHouseCodeFiltered => {
                    if (wareHouseCodeFiltered.code && product.wareHouseCode != wareHouseCodeFiltered.code) {
                        return false;
                    }
                })
            }
            if (filterProductGroup && filterProductGroup.code && product.productGroup !== filterProductGroup.code) {
                return false;
            }
            if (filterProductName) {
                filterProductName.forEach(productNameFiltered => {
                    if (productNameFiltered.code && product.productName != productNameFiltered.code) {
                        return false;
                    }
                })
            }
            return true;
        });
        setFilteredStocks(filteredStocks);
        setFilteredStocksFlag(true);
        onHide(name);
    }
    const renderFooter = (name) => {
        return (
            <div>
                <Button label="Cancel" icon="pi pi-times" onClick={() => onHide(name)} className="p-button-text" />
                <Button label="Submit" icon="pi pi-check" onClick={() => submitFilterStocks(name)} autoFocus />
            </div>
        );
    }
    const matchedProductGroups = (product) => {
        let flag = false;
        filterWareHouseCode.forEach(wareHouse => {
            if (wareHouse.code == product.wareHouseCode)
                flag = true;
        });
        return flag;
    }
    const matchedProductNames = (product) => {
        let flag = false;
        filterWareHouseCode.forEach(wareHouse => {
            if (wareHouse.code == product.wareHouseCode && filterProductGroup.code == product.productGroup)
                flag = true;
        });
        return flag;
    }
    const warehouses = [...new Set(products.map(product => product.wareHouseCode))].map(wareHouseCode => { return { name: wareHouseCode, code: wareHouseCode } });
    const productGroups = [...new Set(products.filter(matchedProductGroups))].map(product => product.productGroup).map(productGroup => { return { name: productGroup, code: productGroup } });
    const productNames = [...new Set(products.filter(matchedProductNames).map(product => product.productItem))].map(productItem => { return { name: productItem, code: productItem } });


    return (
        <div className='current-stocks-container'>
            <div className='transaction-headers'>
                <p class="h2">Current Stocks :</p>
                <div className='transactions_filter_and_print_buttons'>
                    <div className="p-jc-center p-mt-5">
                        <Button label="Filter Stocks" icon="pi pi-external-link" onClick={() => onClick('filterStocks')} />
                    </div>
                    <div className="p-jc-center p-mt-5">
                        <Button label="Take Print" onClick={takePrint} />
                    </div>
                </div>
            </div>
            <Dialog header="Filter Stocks" visible={showFilterOptionsDialog} style={{ width: '50vw' }} footer={renderFooter('filterStocks')} onHide={() => onHide('filterStocks')}>
                <div class="form-group row m-3 ">
                    <label for="warehousecode" class="col-sm-4 col-form-label">Warehouse Code</label>
                    <div class="col-sm-8">
                        <MultiSelect value={filterWareHouseCode} onChange={(e) => setFilterWareHouseCode(e.value)} options={warehouses} optionLabel="name" display="chip"
                            placeholder="Select a Warehouse" maxSelectedLabels={3} className="w-full md:w-14rem form-field-generic-size" />
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="productGroup" class="col-sm-4 col-form-label">Product Group</label>
                    <div class="col-sm-8">
                        <Dropdown value={filterProductGroup} onChange={(e) => setFilterProductGroup(e.value)} options={productGroups} optionLabel="name"
                            placeholder="Select a Product Group" className="w-full md:w-14rem form-field-generic-size" />
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="productName" class="col-sm-4 col-form-label">Product Name</label>
                    <div class="col-sm-8">
                        <MultiSelect value={filterProductName} onChange={(e) => setFilterProductName(e.value)} options={productNames} optionLabel="name" display="chip"
                            placeholder="Select a Product Name" maxSelectedLabels={3} className="w-full md:w-14rem form-field-generic-size" />
                    </div>
                </div>
            </Dialog>
            {filteredStocksFlag && <h4>Filtered Current Stocks : </h4>}
            <Divider />
            <div className="card">
                <DataTable value={filteredStocksFlag ? filteredStocks : products} tableStyle={{ minWidth: '50rem' }}>
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
