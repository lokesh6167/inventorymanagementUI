import React, { useEffect, useState, useContext } from 'react';
import {InventaryManagementContext} from './Context/InventaryManagementProvider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
        


function StockInflow() {
  const { products, updateProducts, fetchProducts,takePrint} = useContext(InventaryManagementContext);
  useEffect(() => {
    fetchProducts();
  }, []);
  const [orderCompletionStatus,setOrderCompletionStatus]=useState(false);
  const [orderResponse,setOrderResponse]=useState([null]);
  const [selectedWareHouse, setSelectedWareHouse] = useState([]);
  const [selectedProductGroup, setSelectedProductGroup] = useState({});
  const [selectedProductName, setSelectedProductName] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchasedQuantity, setPurchasedQuantity] = useState("");
  const [purchasedDate, setPurchasedDate] = useState("");
  const selectedWareHousecodesArray=selectedWareHouse.map(wareHouse=>wareHouse.code);
  const matchedProductGroups = (product)=>{
    selectedWareHousecodesArray.includes(product.wareHouseCode);
  }
  const matchedProductNames = (product)=>{
    selectedWareHouse.forEach(wareHouse=>{
      if(wareHouse.code==product.wareHouseCode && selectedProductGroup.code==product.productGroup)
        return true;
    });
    return false;
  }
  const warehouses = [...new Set(products.map(product => product.wareHouseCode))].map(wareHouseCode=>{ return {name:wareHouseCode,code:wareHouseCode}});
  const productGroups = [...new Set(products.filter(matchedProductGroups).map(product => product.productGroup))].map(productGroup=>{return {name:productGroup,code:productGroup}});
  const productNames = [...new Set(products.filter(matchedProductNames).map(product => product.productItem))].map(productItem=>{return {name:productItem,code:productItem}});

  const handleStockInflow = async (e) => {
    e.preventDefault();
    let updatingProductId=null;
    const updatingProduct = products.find(product =>
      product.wareHouseCode === selectedWareHouse.code &&
      product.productGroup === selectedProductGroup.code &&
      product.productItem === selectedProductName.code
    );
    if(updatingProduct)updatingProductId=updatingProduct.id;
    const inflowTransactionPayload = {
      wareHouseCode:selectedWareHouse.code,
      productGroup:selectedProductGroup.code,
      productItem:selectedProductName.code,
      invoiceNumber,
      transactionType: "Inflow",
      dateOfTransaction:new Date(purchasedDate).toISOString(),
      transactionQuantity:purchasedQuantity
    }
    const inFlowOrderData = await updateProducts(updatingProductId, inflowTransactionPayload);
    inFlowOrderData["invoiceNumber"]=invoiceNumber;
    inFlowOrderData["soldQuantity"]=purchasedQuantity;
    inFlowOrderData["soldDate"]=purchasedDate;
    setOrderResponse([inFlowOrderData]);
  }
  const addAnotherOutflow=()=>{
    setOrderCompletionStatus(!orderCompletionStatus);
  }
  const handleReset=()=>{
    setSelectedWareHouse(null);
    setSelectedProductGroup(null);
    setSelectedProductName(null);
    setInvoiceNumber("");
    setPurchasedDate(null);
    setPurchasedQuantity("");
  }
  useEffect(() => {
    if (orderResponse) {
      setOrderCompletionStatus(!orderCompletionStatus);
    }
  }, [orderResponse]);
  return (
    <div className='stock-inflow-container'>
      <p class="h2">Stock Inflow</p>
      <Divider />
      {orderCompletionStatus ?
            <>
            <div className="receipt-headings">
            <p class="h5 text-success">Inflow transaction is successful. Please find the details of current transation here</p>
            <Button label="Add another outflow transaction" onClick={addAnotherOutflow}/>
            </div>
            <div className="card flex justify-content-center">
            <DataTable value={orderResponse} tableStyle={{ minWidth: '75rem' }}>
                <Column field="wareHouseCode" header="WareHouse Code"></Column>
                <Column field="productGroup" header="Product Group"></Column>
                <Column field="productItem" header="Product Name"></Column>
                <Column field="invoiceNumber" header="Invoice Number"></Column>
                <Column field="soldDate" header="Sold Date" body={rowData => {
                  if(rowData && rowData.soldDate){
                  return rowData.soldDate.toLocaleString();
                  }
                }}></Column>
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
        <div class="form-group row m-3 ">
          <label for="warehousecode" class="col-sm-4 col-form-label">Warehouse Code<span className="required-field">*</span></label>
          <div class="col-sm-8">
              <div className="card flex justify-content-center">
            <MultiSelect value={selectedWareHouse} onChange={(e) => setSelectedWareHouse(e.value)} options={warehouses}  optionLabel="name" display="chip" 
                placeholder="Select a Warehouse" maxSelectedLabels={3} className="w-full md:w-14rem" />
        </div>
          </div>
        </div>
        <div class="form-group row m-3 ">
          <label for="productGroup" class="col-sm-4 col-form-label">Product Group<span className="required-field">*</span></label>
          <div class="col-sm-8">
            <Dropdown value={selectedProductGroup} onChange={(e) => setSelectedProductGroup(e.value)} options={productGroups} optionLabel="name"
              placeholder="Select a Product Group" className="w-full md:w-14rem" />
          </div>
        </div>
        <div class="form-group row m-3 ">
          <label for="productName" class="col-sm-4 col-form-label">Product Name<span className="required-field">*</span></label>
          <div class="col-sm-8">
            <MultiSelect value={selectedProductName} onChange={(e) => setSelectedProductName(e.value)} options={productNames}   optionLabel="name" display="chip" 
                placeholder="Select a Product Name"  maxSelectedLabels={3} className="w-full md:w-14rem" />
          </div>
        </div>
        <div class="form-group row m-3 ">
          <label for="invoicenumber" class="col-sm-4 col-form-label">Invoice Number<span className="required-field">*</span></label>
          <div class="col-sm-8">
            <InputText id="invoicenumber" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          </div>
        </div>
        <div class="form-group row m-3 ">
          <label for="purchaseddate" class="col-sm-4 col-form-label">Purchased Date<span className="required-field">*</span></label>
          <div class="col-sm-8">
            <Calendar value={purchasedDate} onChange={(e) => setPurchasedDate(e.value)} dateFormat="dd/mm/yy" showIcon />
          </div>
        </div>
        <div class="form-group row m-3 ">
          <label for="purchasedquantity" class="col-sm-4 col-form-label">Purchased Quantity<span className="required-field">*</span></label>
          <div class="col-sm-8">
            <InputNumber id="purchasedquantity" value={purchasedQuantity} onValueChange={(e) => setPurchasedQuantity(e.target.value)} min={0} mode='decimal'/>
          </div>
        </div>
        <div class="form-group row m-3 ">
          <div className="card flex justify-content-center gap-3">
            <Button label="Submit" onClick={handleStockInflow}/>
            <Button label="Reset" severity="secondary" onClick={handleReset} />
          </div>
        </div>
    </>
  }
</div>
  );
}

export default StockInflow;
