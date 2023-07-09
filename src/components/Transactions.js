import React, { useEffect, useContext, useState } from 'react';
import { InventaryManagementContext } from './Context/InventaryManagementProvider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';

function Transactions() {

    const { transactions, fetchTransactions, takePrint } = useContext(InventaryManagementContext);
    const [filteredTransactions, setFilteredTransactions] = useState(null);
    const [showFilterOptionsDialog, setShowFilterOptionsDialog] = useState(false);
    const [filterWareHouseCode, setFilterWareHouseCode] = useState([]);
    const [filterProductGroup, setFilterProductGroup] = useState("");
    const [filterProductName, setFilterProductName] = useState("");
    const [filterFromDate, setFilterFromDate] = useState(null);
    const [filterTillDate, setFilterTillDate] = useState(null);
    const [filterTransactionType, setFilterTransactionType] = useState(null);
    const [filteredTransactionsFlag, setFilteredTransactionsFlag] = useState(false);

    const dialogFuncMap = {
        'filterTransactions': setShowFilterOptionsDialog
    }

    const onClick = (name, position) => {
        dialogFuncMap[`${name}`](true);

    }

    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
    }
    const submitFilterTransactions = (name) => {
        const filteredTransactions = transactions.filter((transaction) => {
            const transactionDateParts = transaction && transaction.dateOfTransaction.split('/');
            let formattedTransactionDate = null;
            if (transactionDateParts[2] && transactionDateParts[1] && transactionDateParts[0]) {
                formattedTransactionDate = new Date(transactionDateParts[2], transactionDateParts[0] - 1, transactionDateParts[1]);
            }
            if (filterWareHouseCode) {
                filterWareHouseCode.forEach(wareHouseCodeFiltered => {
                    if (wareHouseCodeFiltered.code && transaction.wareHouseCode !== wareHouseCodeFiltered.code) {
                        return false;
                    }
                })
            }
            if (filterProductGroup && filterProductGroup.code && transaction.productGroup !== filterProductGroup.code) {
                return false;
            }
            if (filterProductName) {
                filterProductName.forEach(productNameFiltered => {
                    if (productNameFiltered.code && transaction.productName !== productNameFiltered.code) {
                        return false;
                    }
                })
            }
            if (filterTransactionType && filterTransactionType.code && transaction.transactionType !== filterTransactionType.code) {
                return false;
            }
            if (filterFromDate && formattedTransactionDate > filterFromDate) {
                return false;
            }
            if (filterTillDate && formattedTransactionDate < filterTillDate) {
                return false;
            }
            return true;
        });
        setFilteredTransactions(filteredTransactions);
        setFilteredTransactionsFlag(true);
        onHide(name);
    }
    const renderFooter = (name) => {
        return (
            <div>
                <Button label="Cancel" icon="pi pi-times" onClick={() => onHide(name)} className="p-button-text" />
                <Button label="Submit" icon="pi pi-check" onClick={() => submitFilterTransactions(name)} autoFocus />
            </div>
        );
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    const transactionTypes = [
        { name: "Inflow", code: "Inflow" },
        { name: "Outflow", code: "Outflow" }
    ]
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
            if (wareHouse.code === product.wareHouseCode && filterProductGroup.code === product.productGroup)
                flag = true;
        });
        return flag;
    }
    const warehouses = [...new Set(transactions.map(transaction => transaction.wareHouseCode))].map(wareHouseCode => { return { name: wareHouseCode, code: wareHouseCode } });
    const productGroups = [...new Set(transactions.filter(matchedProductGroups))].map(transaction => transaction.productGroup).map(productGroup => { return { name: productGroup, code: productGroup } });
    const productNames = [...new Set(transactions.filter(matchedProductNames).map(transaction => transaction.productItem))].map(productItem => { return { name: productItem, code: productItem } });

    transactions.forEach(transaction => {
        transaction.dateOfTransaction = new Date(transaction.dateOfTransaction).toLocaleDateString();
    });

    return (
        <div className='transactions-container'>
            <div className='transaction-headers'>
                <p class="h2">Transactions</p>
                <div className='transactions_filter_and_print_buttons'>
                    <div className="p-jc-center p-mt-5">
                        <Button label="Filter Transactions" icon="pi pi-external-link" onClick={() => onClick('filterTransactions')} />
                    </div>
                    <div className="p-jc-center p-mt-5">
                        <Button label="Take Print" onClick={takePrint} />
                    </div>
                </div>
            </div>
            <Dialog header="Filter Transactions" visible={showFilterOptionsDialog} style={{ width: '50vw' }} footer={renderFooter('filterTransactions')} onHide={() => onHide('filterTransactions')}>
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
                <div class="form-group row m-3 ">
                    <label for="transactiontype" class="col-sm-4 col-form-label">Transaction Type</label>
                    <div class="col-sm-8">
                        <Dropdown value={filterTransactionType} onChange={(e) => setFilterTransactionType(e.value)} options={transactionTypes} optionLabel="name"
                            placeholder="Select a Transaction Type" className="w-full md:w-14rem form-field-generic-size" />
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="filterfromdate" class="col-sm-4 col-form-label">From Date</label>
                    <div class="col-sm-8">
                        <Calendar id="filterfromdate" value={filterFromDate} onChange={(e) => setFilterFromDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full md:w-14rem form-field-generic-size" />
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="filtertilldate" class="col-sm-4 col-form-label">Till Date</label>
                    <div class="col-sm-8">
                        <Calendar id="filtertilldate" value={filterTillDate} onChange={(e) => setFilterTillDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full md:w-14rem form-field-generic-size" />
                    </div>
                </div>
            </Dialog>
            {filteredTransactionsFlag && <h4>Filtered Transactions : </h4>}
            <Divider />
            <div className="card">
                <DataTable value={filteredTransactionsFlag ? filteredTransactions : transactions} tableStyle={{ minWidth: '50rem' }}>
                    <Column field="id" header="Id"></Column>
                    <Column field="wareHouseCode" header="WareHouse Code"></Column>
                    <Column field="productGroup" header="Product Group"></Column>
                    <Column field="productItem" header="Product Name"></Column>
                    <Column field="invoiceNumber" header="Invoice Number"></Column>
                    <Column field="transactionType" header="Transaction Type"></Column>
                    <Column field="dateOfTransaction" header="Date of Transaction"></Column>
                    <Column field="transactionQuantity" header="Transaction Quantity"></Column>
                </DataTable>
            </div>
        </div>
    );
}

export default Transactions;
