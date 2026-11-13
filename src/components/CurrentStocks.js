import React, { useEffect, useContext, useState } from 'react';
import * as XLSX from 'xlsx'; // Import XLSX for Excel export
import { InventaryManagementContext } from './Context/InventaryManagementProvider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import ServerDownMessage from './ServerDownMessage';

function CurrentStocks() {
    const { products, fetchProducts, takePrint, isBackendUp } = useContext(InventaryManagementContext);
    const [filteredStocksFlag, setFilteredStocksFlag] = useState(false);
    const [filteredStocks, setFilteredStocks] = useState(null);
    const [showFilterOptionsDialog, setShowFilterOptionsDialog] = useState(false);
    const [filterWareHouseCode, setFilterWareHouseCode] = useState([]);
    const [filterProductGroup, setFilterProductGroup] = useState([]);
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
            if (filterWareHouseCode.length !== 0 && !filterWareHouseCode.some(wareHouseCodeFiltered => product.wareHouseCode === wareHouseCodeFiltered.code)) {
                return false;
            }
            if (filterProductGroup.length !== 0 && !filterProductGroup.some(productGroupFiltered => product.productGroup === productGroupFiltered.code)) {
                return false;
            }
            if (filterProductName.length !== 0 && !filterProductName.some(productNameFiltered => product.productItem === productNameFiltered.code)) {
                return false;
            }
            return true;
        });
        setFilteredStocks(filteredStocks);
        setFilteredStocksFlag(true);
        onHide(name);
    }
    const resetFilter = (name) => {
        setFilterWareHouseCode([]);
        setFilterProductGroup([]);
        setFilterProductName([]);
        setFilteredStocksFlag(false);
    }
    const renderFooter = (name) => {
        return (
            <div>
                <Button label="Reset" icon="pi pi-times" onClick={() => resetFilter(name)} className="p-button-text" />
                <Button label="Cancel" icon="pi pi-times" onClick={() => onHide(name)} className="p-button-text" />
                <Button label="Submit" icon="pi pi-check" onClick={() => submitFilterStocks(name)} autoFocus />
            </div>
        );
    }
    const matchedProductGroups = (product) => {
        let flag = false;
        filterWareHouseCode.forEach(wareHouse => {
            if (wareHouse.code === product.wareHouseCode)
                flag = true;
        });
        return flag;
    }
    const matchedProductNames = (product) => {
        let flag = false;
        filterWareHouseCode.forEach(wareHouse => {
            if (wareHouse.code === product.wareHouseCode && filterProductGroup.some(selectedProductGroup => selectedProductGroup.code === product.productGroup))
                flag = true;
        });
        return flag;
    }
    const warehouses = [...new Set(products.map(product => product.wareHouseCode))].map(wareHouseCode => { return { name: wareHouseCode, code: wareHouseCode } });
    const productGroups = [...new Set(products.filter(matchedProductGroups).map(product => product.productGroup))].map(productGroup => { return { name: productGroup, code: productGroup } });
    const productNames = [...new Set(products.filter(matchedProductNames).map(product => product.productItem))].map(productItem => { return { name: productItem, code: productItem } });

    if (!isBackendUp) {
        return <ServerDownMessage />;
    }

    const exportToExcel = () => {
        const data = filteredStocksFlag ? filteredStocks : products;

        // Map 'id' field to 'Serial No.' and remove 'id' column
        const dataWithSerialNumber = data.map((item) => ({
            "Serial No.": item.id, // Map id to Serial No.
            "WareHouse Code": item.wareHouseCode,
            "Product Group": item.productGroup,
            "Product Name": item.productItem,
            "Current Stock Quantity": item.stockQuantity,
        }));

        // Create worksheet from data with Serial No. column
        const worksheet = XLSX.utils.json_to_sheet(dataWithSerialNumber);

        // Define column widths
        const columnWidths = [
            { wch: 10 }, // Serial No.
            { wch: 30 }, // Warehouse Code
            { wch: 30 }, // Product Group
            { wch: 30 }, // Product Name
            { wch: 15 }  // Stock Quantity
        ];

        // Apply column widths to the worksheet
        worksheet["!cols"] = columnWidths;

        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();

        // Format the filename to include today's date
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        XLSX.utils.book_append_sheet(workbook, worksheet, `Current Stocks on ${dateStr}`);
        const fileName = `Current Stocks information on ${dateStr}.xlsx`;

        // Export the workbook as an Excel file
        XLSX.writeFile(workbook, fileName);
    };



    return (
        <div className='current-stocks-container table-fit-content'>
            <div className='transaction-headers'>
                <p className="h2">Current Stocks</p>
                <div className='transactions_filter_and_print_buttons'>
                    <div className="p-jc-center p-mt-5 exclude-from-print">
                        <Button label="Filter Stocks" icon="pi pi-external-link" onClick={() => onClick('filterStocks')} />
                    </div>
                    <div className="p-jc-center p-mt-5 exclude-from-print">
                        <Button label="Take Print" onClick={takePrint} />
                    </div>
                    <div className="p-jc-center p-mt-5 exclude-from-print">
                        <Button label="Export to Excel" icon="pi pi-file-excel" disabled={!(filteredStocksFlag ? filteredStocks?.length : products?.length)} onClick={exportToExcel} />
                    </div>
                </div>
            </div>
            <Dialog header="Filter Stocks" visible={showFilterOptionsDialog} style={{ width: '50vw' }} footer={renderFooter('filterStocks')} onHide={() => onHide('filterStocks')}>
                <div className="form-group row m-3 ">
                    <label htmlFor="warehousecode" className="col-sm-4 col-form-label">Warehouse Code</label>
                    <div className="col-sm-8">
                        <MultiSelect value={filterWareHouseCode} onChange={(e) => setFilterWareHouseCode(e.value)} options={warehouses} optionLabel="name" display="chip"
                            placeholder="Select a Warehouse" maxSelectedLabels={3} className="w-full md:w-14rem form-field-generic-size" />
                    </div>
                </div>
                <div className="form-group row m-3 ">
                    <label htmlFor="productGroup" className="col-sm-4 col-form-label">Product Group</label>
                    <div className="col-sm-8">
                        <MultiSelect value={filterProductGroup} onChange={(e) => setFilterProductGroup(e.value)} options={productGroups} optionLabel="name" display="chip"
                            placeholder="Select a Product Group" className="w-full md:w-14rem form-field-generic-size" />
                    </div>
                </div>
                <div className="form-group row m-3 ">
                    <label htmlFor="productName" className="col-sm-4 col-form-label">Product Name</label>
                    <div className="col-sm-8">
                        <MultiSelect value={filterProductName} onChange={(e) => setFilterProductName(e.value)} options={productNames} optionLabel="name" display="chip"
                            placeholder="Select a Product Name" maxSelectedLabels={3} className="w-full md:w-14rem form-field-generic-size" />
                    </div>
                </div>
            </Dialog>
            {filteredStocksFlag && <h4>Filtered Current Stocks : </h4>}
            <Divider className="exclude-from-print" />
            <div className="card">
                <DataTable value={filteredStocksFlag ? filteredStocks : products} tableStyle={{ minWidth: '50rem' }}>
                    <Column field="id" header="Serial No."></Column>
                    <Column field="wareHouseCode" header="WareHouse Code"></Column>
                    <Column field="productGroup" header="Product Group"></Column>
                    <Column field="productItem" header="Product Name"></Column>
                    <Column field="stockQuantity" header="Current Stock Quantity"></Column>
                </DataTable>
            </div>
        </div>
    );
}

export default CurrentStocks;
