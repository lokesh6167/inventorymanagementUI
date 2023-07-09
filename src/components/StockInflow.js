import React, { useEffect, useState, useContext } from 'react';
import { InventaryManagementContext } from './Context/InventaryManagementProvider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import Table from 'react-bootstrap/Table';


function StockInflow() {
  const { products, updateProducts, fetchProducts, takePrint } = useContext(InventaryManagementContext);
  useEffect(() => {
    fetchProducts();
  }, []);
  const [orderCompletionStatus, setOrderCompletionStatus] = useState(false);
  const [orderResponse, setOrderResponse] = useState(null);
  const [selectedWareHouse, setSelectedWareHouse] = useState([]);
  const [selectedProductGroup, setSelectedProductGroup] = useState({});
  const [selectedProductName, setSelectedProductName] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchasedQuantity, setPurchasedQuantity] = useState("");
  const [purchasedDate, setPurchasedDate] = useState("");
  const [errors, setErrors] = useState({});
  const matchedProductGroups = (product) => {
    if (selectedWareHouse && selectedWareHouse.code === product.wareHouseCode)
      return true;
    return false;
  }
  const matchedProductNames = (product) => {
    if (selectedWareHouse && selectedWareHouse.code === product.wareHouseCode && selectedProductGroup && selectedProductGroup.code === product.productGroup)
      return true;
    return false;
  }
  const warehouses = [...new Set(products.map(product => product.wareHouseCode))].map(wareHouseCode => { return { name: wareHouseCode, code: wareHouseCode } });
  const productGroups = [...new Set(products.filter(matchedProductGroups))].map(product => product.productGroup).map(productGroup => { return { name: productGroup, code: productGroup } });
  const productNames = [...new Set(products.filter(matchedProductNames).map(product => product.productItem))].map(productItem => { return { name: productItem, code: productItem } });
  const validate = () => {
    let noErros = true;
    let errors = {};
    if (!(selectedWareHouse && selectedWareHouse.code)) {
      errors.wareHouseCode = "Please select any ware house";
      noErros = false;
    }
    if (!(selectedProductGroup && selectedProductGroup.code)) {
      errors.productGroup = "Please select any product group";
      noErros = false;
    }
    if (!(selectedProductName && selectedProductName.code)) {
      errors.productName = "Please select any product name";
      noErros = false;
    }
    if (!invoiceNumber) {
      errors.invoiceNumber = "Please enter invoice number";
      noErros = false;
    }
    if (!purchasedDate) {
      errors.purchasedDate = "Please select purchased date";
      noErros = false;
    }
    if (!purchasedQuantity) {
      errors.purchasedQuantity = "Please enter purchased quantity"
      noErros = false;
    }
    setErrors(errors);
    return noErros;
  }
  const handleStockInflow = async (e) => {
    e.preventDefault();
    if (validate()) {
      let updatingProductId = null;
      const updatingProduct = products.find(product =>
        product.wareHouseCode === selectedWareHouse.code &&
        product.productGroup === selectedProductGroup.code &&
        product.productItem === selectedProductName.code
      );
      if (updatingProduct) updatingProductId = updatingProduct.id;
      const inflowTransactionPayload = {
        wareHouseCode: selectedWareHouse.code,
        productGroup: selectedProductGroup.code,
        productItem: selectedProductName.code,
        invoiceNumber,
        transactionType: "Inflow",
        dateOfTransaction: new Date(purchasedDate).toISOString(),
        transactionQuantity: purchasedQuantity
      }
      const inFlowOrderData = await updateProducts(updatingProductId, inflowTransactionPayload);
      inFlowOrderData["invoiceNumber"] = invoiceNumber;
      inFlowOrderData["purchasedQuantity"] = purchasedQuantity;
      inFlowOrderData["purchasedDate"] = purchasedDate;
      setOrderResponse(inFlowOrderData);
    }
  }
  const addAnotherInflow = () => {
    setOrderCompletionStatus(!orderCompletionStatus);
  }
  const handleReset = () => {
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
    <div className={orderCompletionStatus ? "stock-inflow-transaction-completed-container" : "stock-inflow-container"}>
      <p class="h2">Stock Inflow</p>
      <Divider />
      {orderCompletionStatus ?
        <>
          <div className="receipt-headings">
            <p class="h5 text-success">Inflow transaction is successful. Please find the details of current transaction here</p>
            <Button label="Add another Inflow transaction" onClick={addAnotherInflow} />
          </div>
          <div className="card flex justify-content-center">
            {orderResponse ?
              <>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>category</th>
                      <th>value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Ware House Code</td>
                      <td>{orderResponse.wareHouseCode}</td>
                    </tr>
                    <tr>
                      <td>Product Group</td>
                      <td>{orderResponse.productGroup}</td>
                    </tr>
                    <tr>
                      <td>Product Name</td>
                      <td>{orderResponse.productItem}</td>
                    </tr>
                    <tr>
                      <td>Invoice Number</td>
                      <td>{orderResponse.invoiceNumber}</td>
                    </tr>
                    <tr>
                      <td>Sold Date</td>
                      <td>{new Date(orderResponse.purchasedDate).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td>Sold Quantity</td>
                      <td>{orderResponse.purchasedQuantity}</td>
                    </tr>
                    <tr>
                      <td>Current Quantity</td>
                      <td>{orderResponse.stockQuantity}</td>
                    </tr>
                  </tbody>
                </Table>
                <div className="p-d-flex p-jc-center p-mt-5">
                  <Button label="Take Print" onClick={takePrint} />
                </div>
              </>
              :
              <h5>No Results found. Order hasnt submitted successfuly. Please try again.</h5>
            }
          </div>
        </>
        :
        <>
          <div class="form-group row m-3 ">
            <label for="warehousecode" class="col-sm-4 col-form-label">Warehouse Code<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <Dropdown value={selectedWareHouse} onChange={(e) => setSelectedWareHouse(e.value)} options={warehouses} optionLabel="name"
                placeholder="Select a Warehouse" className="w-full md:w-14rem form-field-generic-size" />
              {errors.wareHouseCode && <small className="p-error">{errors.wareHouseCode}.</small>}
            </div>
          </div>
          <div class="form-group row m-3 ">
            <label for="productGroup" class="col-sm-4 col-form-label">Product Group<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <Dropdown value={selectedProductGroup} onChange={(e) => setSelectedProductGroup(e.value)} options={productGroups} optionLabel="name"
                placeholder="Select a Product Group" className="w-full md:w-14rem form-field-generic-size" />
              {errors.productGroup && <small className="p-error">{errors.productGroup}.</small>}
            </div>
          </div>
          <div class="form-group row m-3 ">
            <label for="productName" class="col-sm-4 col-form-label">Product Name<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <Dropdown value={selectedProductName} onChange={(e) => setSelectedProductName(e.value)} options={productNames} optionLabel="name"
                placeholder="Select a Product Name" className="w-full md:w-14rem form-field-generic-size" />
              {errors.productName && <small className="p-error">{errors.productName}.</small>}
            </div>
          </div>
          <div class="form-group row m-3 ">
            <label for="invoicenumber" class="col-sm-4 col-form-label">Invoice Number<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <InputText id="invoicenumber" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full md:w-14rem form-field-generic-size" />
              {errors.invoiceNumber && <small className="p-error">{errors.invoiceNumber}.</small>}
            </div>
          </div>
          <div class="form-group row m-3 ">
            <label for="purchaseddate" class="col-sm-4 col-form-label">Purchased Date<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <Calendar value={purchasedDate} onChange={(e) => setPurchasedDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full md:w-14rem form-field-generic-size" />
              {errors.purchasedDate && <small className="p-error">{errors.purchasedDate}.</small>}
            </div>
          </div>
          <div class="form-group row m-3 ">
            <label for="purchasedquantity" class="col-sm-4 col-form-label">Purchased Quantity<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <InputNumber id="purchasedquantity" value={purchasedQuantity} onValueChange={(e) => setPurchasedQuantity(e.target.value)} min={0} mode='decimal' className="w-full md:w-14rem form-field-generic-size" />
              {errors.purchasedQuantity && <small className="p-error">{errors.purchasedQuantity}.</small>}
            </div>
          </div>
          <div class="form-group row m-3 ">
            <div className="card flex justify-content-center gap-3 no-border">
              <Button label="Submit" onClick={handleStockInflow} />
              <Button label="Reset" severity="secondary" onClick={handleReset} />
            </div>
          </div>
        </>
      }
    </div>
  );
}

export default StockInflow;
