import React, { useEffect, useState, useContext, useRef} from 'react';
import {InventaryManagementContext} from './Context/InventaryManagementProvider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import {InputNumber} from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { useFormik } from 'formik';
import { classNames } from 'primereact/utils';

function StockOutflow() {
    const { products, updateProducts, fetchProducts, takePrint} = useContext(InventaryManagementContext);
    useEffect(() => {
        fetchProducts();
    }, []);

    const [orderCompletionStatus,setOrderCompletionStatus]=useState(false);
    const [orderResponse,setOrderResponse]=useState(null);
    // const [selectedWareHouse, setSelectedWareHouse] = useState("");
    // const [selectedProductGroup, setSelectedProductGroup] = useState("");
    // const [selectedProductName, setSelectedProductName] = useState("");
    // const [invoiceNumber, setInvoiceNumber] = useState("");
    // const [soldQuantity, setSoldQuantity] = useState("");
    // const [soldDate, setSoldDate] = useState("");
    // const [errors, setErrors]=useState({wareHouseCode:"",productGroup:"",productName:"",invoiceNumber:"",soldDate:"",soldQuantity:""});
    const warehouses = [...new Set(products.map(product => product.wareHouseCode))].map(wareHouseCode=>{ return {name:wareHouseCode,code:wareHouseCode}});
    const productGroups = [...new Set(products.map(product => product.productGroup))].map(productGroup=>{return {name:productGroup,code:productGroup}});
    const productNames = [...new Set(products.map(product => product.productItem))].map(productItem=>{return {name:productItem,code:productItem}});
    // const validate =()=>{
    //     if(!(selectedWareHouse && selectedWareHouse.code)){
    //         setErrors({...errors,wareHouseCode:"Please select any ware house"});
    //     }
    //     if(!(selectedProductGroup && selectedProductGroup.code)){
    //         setErrors({...errors,productGroup:"Please select any product group"}); 
    //     }
    //     if(!selectedProductName && selectedProductName.code){
    //         setErrors({...errors,productName:"Please select any product name"}); 
    //     }
    //     if(!invoiceNumber){
    //         setErrors({...errors,invoiceNumber:"Please enter invoice number"});
    //     }
    //     if(!soldDate){
    //         setErrors({...errors,soldDate:"Please select sold date"}); 
    //     }
    //     if(!soldQuantity){
    //         setErrors({...errors,soldQuantity:"Please enter sold quantity"}); 
    //     }
    // }
    const toast = useRef(null);

    const show = () => {
        toast.current.show({ severity: 'success', summary: 'Form Submitted'});
    };

    const formik = useFormik({
        initialValues: {
            selectedwarehouse:"",
            selectedproductgroup:"",
            selectedproductname:"",
            invoicenumber:"",
            solddate:"",
            soldquantity:""
        },
        validate: (data) => {
            let errors = {};

            if (!data.warehousecode) {
                errors.date = 'Ware house code selection is required.';
            }
            if (!data.productgroup) {
                errors.date = 'Product group selection is required.';
            }
            if (!data.productname) {
                errors.date = 'Product name selection is required.';
            }
            if (!data.invoicenumber) {
                errors.date = 'Invoice number is required.';
            }
            if (!data.solddate) {
                errors.dade = 'Sold date selection is required.';
            }
            if (!data.soldquantity) {
                errors.date = 'Sold quantity is required.';
            }
            return errors;
        },
        onSubmit: (data) => {
            if (!formik.errors) {
                handleStockOutflow(data) && show(data);
                formik.resetForm();
            }
        }
    });

    const isFormFieldInvalid = (name) => !!(formik.touched[name] && formik.errors[name]);

    const getFormErrorMessage = (name) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik.errors[name]}</small> : <small className="p-error">&nbsp;</small>;
    };
    const handleStockOutflow = async (data) => {
        // e.preventDefault();
        // if(validate()){
        const updatingProductId = products.find(product =>
            product.wareHouseCode === data.selectedwarehouse &&
            product.productGroup === data.selectedproductgroup &&
            product.productItem === data.selectedproductname
        ).id;
        const outflowTransactionPayload = {
            wareHouseCode:data.selectedwarehouse,
            productGroup:data.selectedproductgroup ,
            productItem:data.selectedproductname,
            invoiceNumber:data.invoicenumber,
            transactionType: "Outflow",
            dateOfTransaction:new Date(data.solddate).toISOString(),
            transactionQuantity:data.soldquantity
        }
        const outFlowOrderData = await updateProducts(updatingProductId, outflowTransactionPayload);
        outFlowOrderData["invoiceNumber"]=data.invoicenumber;
        outFlowOrderData["soldQuantity"]=data.soldquantity;
        outFlowOrderData["soldDate"]=data.solddate;
        setOrderResponse([outFlowOrderData]);
        // setErrors({wareHouseCode:"", productGroup:"",productName:"",soldDate:"",soldQuantity:''});
        // }
    }
    useEffect(() => {
        if (orderResponse) {
          setOrderCompletionStatus(!orderCompletionStatus);
        }
    }, [orderResponse]);

    const handleReset=()=>{
        // setSelectedWareHouse(null);
        // setSelectedProductGroup(null);
        // setSelectedProductName(null);
        // setInvoiceNumber("");
        // setSoldDate(null);
        // setSoldQuantity("");
        formik.resetForm();
      }
    const addAnotherOutflow=()=>{
        setOrderCompletionStatus(!orderCompletionStatus);
    }
    
    return (
        <div className={orderCompletionStatus?"stock-outflow-receipt":"stock-outflow-container"}>
            <p class="h2">Stock Outflow</p>
            <Divider />
            {orderCompletionStatus ?
            <>
            <div className="receipt-headings">
            <p class="h5 text-success">Outflow transaction is successful. Please find the details of current transation here</p>
            <Button label="Add another outflow transaction" onClick={addAnotherOutflow}/>
            </div>
            <div className="card flex justify-content-center">
            <DataTable value={orderResponse} tableStyle={{ minWidth: '75rem' }}>
                <Column field="wareHouseCode" header="WareHouse Code"></Column>
                <Column field="productGroup" header="Product Group"></Column>
                <Column field="productItem" header="Product Name"></Column>
                <Column field="invoiceNumber" header="Invoice Number"></Column>
                <Column field="soldDate" header="Sold Date" body={rowData => rowData.soldDate.toLocaleString()}></Column>
                <Column field="soldQuantity" header="Sold Quantity"></Column>
                <Column field="stockQuantity" header="Current Stock Quantity"></Column>
            </DataTable>
            <div className="p-d-flex p-jc-center p-mt-5">
                <Button label="Take Print" onClick={takePrint}/>
            </div>
        </div>
        </>
            :
            <>
                <Toast ref={toast} />
                <div class="form-group row m-3 ">
                    <label for="warehousecode" class="col-sm-4 col-form-label">Warehouse Code</label>
                    <div class="col-sm-8">
                        <Dropdown
                        inputId="warehousecode"
                        name="warehousecode"
                        value={formik.values.selectedwarehouse}
                        onChange={(e) => {
                            formik.setFieldValue('warehousecode', e.value);
                        }}
                        options={warehouses} 
                        optionLabel="name"
                        placeholder="Select a Warehouse" 
                        className={`"w-full md:w-14rem" ${classNames({ 'p-invalid': isFormFieldInvalid('warehousecode') })})`}/>
                        {getFormErrorMessage('warehousecode')}
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="productGroup" class="col-sm-4 col-form-label">Product Group</label>
                    {/* <div class="col-sm-8">
                        <Dropdown value={selectedProductGroup} onChange={(e) => setSelectedProductGroup(e.value)} options={productGroups} optionLabel="name"
                            placeholder="Select a Product Group" className="w-full md:w-14rem" />
    
                    </div> */}
                    <div class="col-sm-8">
                        <Dropdown
                        inputId="productgroup"
                        value={formik.values.selectedproductgroup}
                        onChange={(e) => {
                            formik.setFieldValue('warehousecode', e.value);
                        }} 
                        options={productGroups} 
                        optionLabel="name"
                        placeholder="Select a Product Group" 
                        className={`"w-full md:w-14rem" ${classNames({ 'p-invalid': isFormFieldInvalid('productgroup') })})`}/>
                        {getFormErrorMessage('productgroup')}
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="productName" class="col-sm-4 col-form-label">Product Name</label>
                    {/* <div class="col-sm-8">
                        <Dropdown value={selectedProductName} onChange={(e) => setSelectedProductName(e.value)} options={productNames} optionLabel="name"
                            placeholder="Select a Product Name" />
                            
                    </div> */}
                    <div class="col-sm-8">
                        <Dropdown
                        inputId="productname"
                        value={formik.values.selectedproductname}
                        onChange={(e) => {
                            formik.setFieldValue('productname', e.value);
                        }} 
                        options={productNames} 
                        optionLabel="name"
                        placeholder="Select a Product Name" 
                        className={`"w-full md:w-14rem" ${classNames({ 'p-invalid': isFormFieldInvalid('productname') })})`}/>
                        {getFormErrorMessage('productname')}
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label htmlFor="invoicenumber" class="col-sm-4 col-form-label">Invoice Number</label>
                    <div class="col-sm-8">
                        <InputText
                        inputId="invoicenumber"
                        name="invoicenumber"
                        value={formik.values.invoicenumber}
                        onValueChange={(e) => {
                            formik.setFieldValue('invoicenumber', e.value);
                        }}
                        useGrouping={false}
                        pt={{
                            input: {
                                root: { autoComplete: 'off' }
                            }
                        }}
                        className={`"w-full md:w-14rem" ${classNames({ 'p-invalid': isFormFieldInvalid('invoicenumber') })})`}
                        />
                        {getFormErrorMessage('invoicenumber')}
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label htmlFor="solddate" class="col-sm-4 col-form-label">Sold Date</label>
                    <div class="col-sm-8">
                        <Calendar 
                        inputId="solddate"
                        name="solddate"
                        value={formik.values.solddate}
                        className={classNames({ 'p-invalid': isFormFieldInvalid('solddate') })}
                        onChange={(e) => {
                            formik.setFieldValue('solddate', e.target.value);
                        }}
                        dateFormat="dd/mm/yy" 
                        showIcon />
                        {getFormErrorMessage('solddate')}
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="soldquantity" class="col-sm-4 col-form-label">Sold Quantity</label>
                    <div class="col-sm-8">
                    <InputNumber
                        inputId="soldquantity"
                        name="soldquantity"
                        value={formik.values.soldquantity}
                        onValueChange={(e) => {
                            formik.setFieldValue('soldquantity', e.value);
                        }}
                        useGrouping={false}
                        pt={{
                            input: {
                                root: { autoComplete: 'off' }
                            }
                        }}
                        mode='decimal'
                        />
                        {getFormErrorMessage('soldquantity')}
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <div className="card flex justify-content-center gap-3">
                        <Button label="Submit" type="submit" onClick={formik.handleSubmit}/>
                        <Button label="Reset" type="button" severity="secondary" onClick={handleReset} />
                    </div>
                </div>
                </>
            }
        </div>
    );
}

export default StockOutflow;
