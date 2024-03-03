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
import ServerDownMessage from './ServerDownMessage';
import { InputNumber } from 'primereact/inputnumber'
import moment from 'moment';

function Transactions() {
    const { products, transactions, fetchProducts, fetchTransactions, updateTransaction, deleteTransaction, takePrint, isBackendUp } = useContext(InventaryManagementContext);
    const [filteredTransactions, setFilteredTransactions] = useState(null);
    const [showFilterOptionsDialog, setShowFilterOptionsDialog] = useState(false);
    const [showEditTransactionDialog, setShowEditTransactionDialog] = useState(false);
    const [showDeleteTransactionDialog, setShowDeleteTransactionDialog] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [deletingTransaction, setDeletingTransaction] = useState(null);
    const [quantityTransferred, setQuantityTransferred] = useState(0);
    const [filterWareHouseCode, setFilterWareHouseCode] = useState([]);
    const [filterProductGroup, setFilterProductGroup] = useState("");
    const [filterProductName, setFilterProductName] = useState([]);
    const [filterFromDate, setFilterFromDate] = useState(null);
    const [filterTillDate, setFilterTillDate] = useState(null);
    const [filterTransactionType, setFilterTransactionType] = useState(null);
    const [filteredTransactionsFlag, setFilteredTransactionsFlag] = useState(false);
    const [descSortedTransactions, setDescSortedTransactions] = useState([]);
    const [editTransError, setEditTransError] = useState("");
    const dialogFuncMap = {
        'filterTransactions': setShowFilterOptionsDialog,
        'editTransaction': setShowEditTransactionDialog,
        'deleteTransaction': setShowDeleteTransactionDialog
    };
    const isAdmin = sessionStorage.getItem("adminUser");

    useEffect(() => {
        fetchTransactions();
        fetchProducts();
    }, []);

    useEffect(() => {
        const sortedTransactions = transactions.sort((a, b) => {
            const dateA = new Date(a.dateOfTransaction);
            const dateB = new Date(b.dateOfTransaction);
            return dateB - dateA;
        });
        setDescSortedTransactions(sortedTransactions);
    }, [transactions]);

    const onClick = (name, position) => {
        dialogFuncMap[`${name}`](true);
    }

    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
    }

    const submitFilterTransactions = (name) => {
        const filterFromDateObj = new Date(filterFromDate);
        const filterTillDateObj = new Date(filterTillDate);
        const filteredTransactions = transactions.filter((transaction) => {
            const formattedTransactionDate = new Date(transaction.dateOfTransaction);
            formattedTransactionDate.setHours(0, 0, 0, 0);

            if (filterWareHouseCode.length !== 0 && !filterWareHouseCode.some(wareHouseCodeFiltered => transaction.wareHouseCode === wareHouseCodeFiltered.code)) {
                return false;
            }
            if (filterProductGroup && filterProductGroup.code && transaction.productGroup !== filterProductGroup.code) {
                return false;
            }
            if (filterProductName.length !== 0 && !filterProductName.some(productNameFiltered => transaction.productItem === productNameFiltered.code)) {
                return false;
            }
            if (filterTransactionType && filterTransactionType.code) {
                let filteredTransactionTypeValue = filterTransactionType.code === "Purchase" ? "Inflow" : "Outflow";
                if (transaction.transactionType !== filteredTransactionTypeValue)
                    return false;
            }
            if (filterFromDate && formattedTransactionDate < filterFromDateObj) {
                return false;
            }
            if (filterTillDate && formattedTransactionDate > filterTillDateObj) {
                return false;
            }
            return true;
        });

        setFilteredTransactions(filteredTransactions);
        setFilteredTransactionsFlag(true);
        onHide(name);
    };

    const submitEditTransaction = (name) => {
        const updatingProduct = products.find(product =>
            product.wareHouseCode === editingTransaction?.wareHouseCode &&
            product.productGroup === editingTransaction?.productGroup &&
            product.productItem === editingTransaction?.productItem
        );
        if ((editingTransaction?.transactionType === "Outflow" && updatingProduct?.stockQuantity + quantityTransferred >= editingTransaction?.transactionQuantity) || (editingTransaction?.transactionType === "Inflow")) {
            const transactionPayload = { ...editingTransaction, dateOfTransaction: new Date(editingTransaction.dateOfTransaction).toISOString() };
            const currentStock = editingTransaction?.transactionType === "Outflow" ? updatingProduct?.stockQuantity + quantityTransferred - editingTransaction?.transactionQuantity : updatingProduct?.stockQuantity - quantityTransferred + editingTransaction?.transactionQuantity;
            updateTransaction(updatingProduct.id, currentStock, transactionPayload);
            onHide(name);
        } else {
            setEditTransError("Entered transaction quantity not available for Delivery --> Editing with this quantity is incorrect as the delivery is more than the available stock");
        }
    };

    const submitDeleteTransaction = (name) => {
        const updatingProduct = products.find(product =>
            product.wareHouseCode === deletingTransaction?.wareHouseCode &&
            product.productGroup === deletingTransaction?.productGroup &&
            product.productItem === deletingTransaction?.productItem
        );

        const transactionPayload = {
            ...deletingTransaction,
            dateOfTransaction: deletingTransaction?.dateOfTransaction ? new Date(deletingTransaction?.dateOfTransaction).toISOString() : undefined
        }
        const currentStock = editingTransaction?.transactionType === "Outflow" ? updatingProduct?.stockQuantity + deletingTransaction?.transactionQuantity : updatingProduct?.stockQuantity - deletingTransaction?.transactionQuantity;
        deleteTransaction(updatingProduct.id, currentStock, transactionPayload);
        onHide(name);
    };

    const resetFilter = (name) => {
        setFilterWareHouseCode([]);
        setFilterProductGroup("");
        setFilterProductName([]);
        setFilterFromDate(null);
        setFilterTillDate(null);
        setFilterTransactionType(null);
        setFilteredTransactionsFlag(false);
    }
    const renderFilterFooter = (name) => {
        return (
            <div>
                <Button label="Reset" icon="pi pi-times" onClick={() => resetFilter(name)} className="p-button-text" />
                <Button label="Cancel" icon="pi pi-times" onClick={() => onHide(name)} className="p-button-text" />
                <Button label="Submit" icon="pi pi-check" onClick={() => submitFilterTransactions(name)} autoFocus />
            </div>
        );
    }

    const renderEditFooter = (name) => {
        return (
            <div>
                <Button label="Cancel" icon="pi pi-times" onClick={() => onHide(name)} className="p-button-text" />
                <Button label="Submit" icon="pi pi-check" onClick={() => submitEditTransaction(name)} autoFocus />
            </div>
        )
    }

    const renderDeleteFooter = (name) => {
        return (
            <div>
                <Button label="No" icon="pi pi-times" onClick={() => onHide(name)} className="p-button-text" />
                <Button label="Yes, delete this transaction" icon="pi pi-check" onClick={() => submitDeleteTransaction(name)} autoFocus />
            </div>
        )
    }

    if (!isBackendUp) {
        return <ServerDownMessage />;
    }
    const transactionTypes = [
        { name: "Purchase", code: "Purchase" },
        { name: "Delivery", code: "Delivery" }
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
    const productGroups = [...new Set(transactions.filter(matchedProductGroups).map(transaction => transaction.productGroup))].map(productGroup => { return { name: productGroup, code: productGroup } });
    const productNames = [...new Set(transactions.filter(matchedProductNames).map(transaction => transaction.productItem))].map(productItem => { return { name: productItem, code: productItem } });

    const dateFormat = (rowData) => {
        const originalDate = rowData?.dateOfTransaction;
        const formattedDate = moment(originalDate).format('DD-MMM-YYYY');
        return <span>{formattedDate}</span>;
    };
    const transactionTypeFormat = (transaction) => {
        if (transaction?.transactionType === "Inflow") {
            return "Purchase"
        } else if (transaction?.transactionType === "Outflow") {
            return "Delivery"
        }
        return transaction?.transactionType;
    }
    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setQuantityTransferred(transaction.transactionQuantity);
        onClick('editTransaction');
    }
    const handleDeleteTransaction = (transaction) => {
        setDeletingTransaction(transaction);
        onClick('deleteTransaction');
    }
    // const editButton = <Button icon="pi pi-file-edit" aria-label="Edit" onClick={handleEditTransaction} />
    const editButton = (transaction) => {
        return <Button icon="pi pi-file-edit" aria-label="Edit" onClick={() => handleEditTransaction(transaction)} />;
    }
    const deleteButton = (transaction) => {
        return <Button icon="pi pi-times" severity="danger" aria-label="Cancel" onClick={() => handleDeleteTransaction(transaction)} />;
    }

    return (
        <div className='transactions-container'>
            <div className='transaction-headers'>
                <p class="h2 landscape-print">Transactions</p>
                <div className='transactions_filter_and_print_buttons'>
                    <div className="p-jc-center p-mt-5 exclude-from-print">
                        <Button label="Filter Transactions" icon="pi pi-external-link" onClick={() => onClick('filterTransactions')} />
                    </div>
                    <div className="p-jc-center p-mt-5 exclude-from-print">
                        <Button label="Take Print" onClick={takePrint} />
                    </div>
                </div>
            </div>
            <Dialog header="Edit Transaction" visible={showEditTransactionDialog} style={{ width: '50vw' }} footer={renderEditFooter('editTransaction')} onHide={() => onHide('editTransaction')}>
                <h6 className='lead'><strong>Note: </strong>Based on the edit in transaction quantity/type with this transaction, the current stock will be adjusted automatically.</h6>
                <div class="form-group row m-3 ">
                    <label for="warehousecode" class="col-sm-4 col-form-label">Warehouse Code</label>
                    <div class="col-sm-8 p-2">
                        <span id="warehousecode">{editingTransaction?.wareHouseCode}</span>
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="productGroup" class="col-sm-4 col-form-label">Product Group</label>
                    <div class="col-sm-8 p-2">
                        <span id="productGroup">{editingTransaction?.productGroup}</span>
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="productName" class="col-sm-4 col-form-label">Product Name</label>
                    <div class="col-sm-8 p-2">
                        <span id="productName">{editingTransaction?.productItem}</span>
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="invoiceNumber" class="col-sm-4 col-form-label">Invoice Number</label>
                    <div class="col-sm-8 p-2">
                        <span id="invoiceNumber">{editingTransaction?.invoiceNumber}</span>
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="transactiontype" class="col-sm-4 col-form-label">Transaction Type</label>
                    <div class="col-sm-8">
                        <Dropdown id="transactionType"
                            value={{ name: transactionTypeFormat(editingTransaction), code: transactionTypeFormat(editingTransaction) }}
                            onChange={(e) => {
                                // console.log(e.value);
                                setEditingTransaction(prevEditingTransaction => ({ ...prevEditingTransaction, transactionType: e.value.code === "Purchase" ? "Inflow" : "Outflow" }));
                            }}
                            options={transactionTypes}
                            optionLabel="name"
                            placeholder="Select a Transaction Type"
                            className="w-full md:w-14rem form-field-generic-size" />
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="dateOfTransaction" class="col-sm-4 col-form-label">Date of Transaction</label>
                    <div class="col-sm-8 p-2">
                        {dateFormat(editingTransaction)}
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="transactionQuantity" class="col-sm-4 col-form-label">Transaction Quantity</label>
                    <div class="col-sm-8">
                        <InputNumber
                            id="transactionQuantity"
                            value={editingTransaction?.transactionQuantity}
                            onValueChange={(e) => setEditingTransaction(prevEditingTransaction => ({ ...prevEditingTransaction, transactionQuantity: e.target.value }))}
                            min={0}
                            mode="decimal"
                            className="w-full md:w-14rem form-field-generic-size"
                            placeholder="Enter transaction quantity"
                        />
                        {editTransError && <small className="p-error display-block">{editTransError}.</small>}
                    </div>
                </div>
            </Dialog>
            <Dialog header="Are you sure want to delete this transaction?" visible={showDeleteTransactionDialog} style={{ width: '50vw' }} footer={renderDeleteFooter('deleteTransaction')} onHide={() => onHide('deleteTransaction')}>
                <h6 className='lead'><strong>Note: </strong>On deletion of this transaction, the current stock will be adjusted automatically.</h6>
            </Dialog>
            <Dialog header="Filter Transactions" visible={showFilterOptionsDialog} style={{ width: '50vw' }} footer={renderFilterFooter('filterTransactions')} onHide={() => onHide('filterTransactions')}>
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
            <Divider className='exclude-from-print' />
            <div className="card table-fit-content">
                <DataTable value={filteredTransactionsFlag ? filteredTransactions : descSortedTransactions} tableStyle={{ minWidth: '50rem' }}>
                    <Column field="id" header="Serial No."></Column>
                    <Column field="wareHouseCode" header="WareHouse Code"></Column>
                    <Column field="productGroup" header="Product Group"></Column>
                    <Column field="productItem" header="Product Name"></Column>
                    <Column field="invoiceNumber" header="Invoice Number"></Column>
                    <Column field="transactionType" header="Transaction Type" body={transactionTypeFormat}></Column>
                    <Column field="dateOfTransaction" header="Date of Transaction" body={dateFormat}></Column>
                    <Column field="transactionQuantity" header="Transaction Quantity"></Column>
                    {isAdmin === "true" && <Column field="editTransaction" header="Edit" body={editButton}></Column>}
                    {isAdmin === "true" && <Column field="deleteTransaction" header="Delete" body={deleteButton}></Column>}
                </DataTable>
            </div>
        </div>
    );
}

export default Transactions;
