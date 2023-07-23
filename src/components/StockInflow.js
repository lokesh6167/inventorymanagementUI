import React, { useEffect, useState, useContext } from 'react';
import { InventaryManagementContext } from './Context/InventaryManagementProvider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import Table from 'react-bootstrap/Table';
import moment from 'moment';
import ServerDownMessage from './ServerDownMessage';


function StockInflow() {
  const { products, updateProducts, fetchProducts, takePrint, isBackendUp, transactions } = useContext(InventaryManagementContext);
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
  const [purchasedDate, setPurchasedDate] = useState(() => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return currentDate;
  });
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
  const productGroups = [...new Set(products.filter(matchedProductGroups).map(product => product.productGroup))].map(productGroup => { return { name: productGroup, code: productGroup } });
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
    } else {
      transactions.forEach(transaction => {
        if (transaction.invoiceNumber === invoiceNumber) {
          errors.invoiceNumber = `Existing transaction on date ${moment(transaction.dateOfTransaction).format('DD-MMM-YYYY')} with same invoice number. Please proceed with new invoice number. For more details about transactions please check on transactions history..`;
          noErros = false;
        }
      })
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
      /*Adding 10hour offset to fix date issue in transactions*/
      const offsetPurchasedDate = new Date(purchasedDate.getTime() + 10 * 60 * 60 * 1000);
      if (updatingProduct) updatingProductId = updatingProduct.id;
      const inflowTransactionPayload = {
        wareHouseCode: selectedWareHouse.code,
        productGroup: selectedProductGroup.code,
        productItem: selectedProductName.code,
        invoiceNumber,
        transactionType: "Purchase",
        dateOfTransaction: moment(offsetPurchasedDate).toISOString(),
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

  if (!isBackendUp) {
    return <ServerDownMessage />;
  }

  return (
    <div className={orderCompletionStatus ? "stock-inflow-transaction-completed-container" : "stock-inflow-container"}>
      <p class="h2 exclude-from-print">Purchase</p>
      <Divider className='exclude-from-print' />
      {orderCompletionStatus ?
        <>
          <div className="receipt-headings exclude-from-print">
            <p class="h5 text-success">purchase transaction is successful. Please find the details of current transaction here</p>
            <Button label="Add another purchase transaction" onClick={addAnotherInflow} />
          </div>
          <div className="card flex justify-content-center print-no-border">
            {orderResponse ?
              <>
                <div className='table-container-center'>
                  <Table className='custom-margin-bottom-2 table-fit-content' striped bordered hover>
                    <thead>
                      <tr>
                        <th className="text-center" colSpan={2}>Purchase Challan </th>
                      </tr>
                      <tr className='exclude-from-print'>
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
                        <td>{moment(orderResponse.purchasedDate).format("DD-MMM-YYYY")}</td>
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
                </div>
                <div className="p-d-flex p-justify-center p-align-center p-jc-center p-mt-5 exclude-from-print">
                  <Button className="take-print-btn" label="Take Print" onClick={takePrint} />
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
            <label for="purchaseddate" class="col-sm-4 col-form-label">Purchased Date<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <Calendar value={purchasedDate} onChange={(e) => setPurchasedDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full md:w-14rem form-field-generic-size" />
              {errors.purchasedDate && <small className="p-error display-block">{errors.purchasedDate}.</small>}
            </div>
          </div>
          <div class="form-group row m-3 ">
            <label for="warehousecode" class="col-sm-4 col-form-label">Warehouse Code<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <Dropdown value={selectedWareHouse} onChange={(e) => setSelectedWareHouse(e.value)} options={warehouses} optionLabel="name"
                placeholder="Select a Warehouse" className="w-full md:w-14rem form-field-generic-size" />
              {errors.wareHouseCode && <small className="p-error display-block">{errors.wareHouseCode}.</small>}
            </div>
          </div>
          <div class="form-group row m-3 ">
            <label for="productGroup" class="col-sm-4 col-form-label">Product Group<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <Dropdown value={selectedProductGroup} onChange={(e) => setSelectedProductGroup(e.value)} options={productGroups} optionLabel="name"
                placeholder="Select a Product Group" className="w-full md:w-14rem form-field-generic-size" />
              {errors.productGroup && <small className="p-error display-block">{errors.productGroup}.</small>}
            </div>
          </div>
          <div class="form-group row m-3 ">
            <label for="productName" class="col-sm-4 col-form-label">Product Name<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <Dropdown value={selectedProductName} onChange={(e) => setSelectedProductName(e.value)} options={productNames} optionLabel="name"
                placeholder="Select a Product Name" className="w-full md:w-14rem form-field-generic-size" />
              {errors.productName && <small className="p-error display-block">{errors.productName}.</small>}
            </div>
          </div>
          <div class="form-group row m-3 ">
            <label for="invoicenumber" class="col-sm-4 col-form-label">Invoice Number<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <InputText id="invoicenumber" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full md:w-14rem form-field-generic-size" />
              {errors.invoiceNumber && <small className="p-error display-block">{errors.invoiceNumber}.</small>}
            </div>
          </div>
          <div class="form-group row m-3 ">
            <label for="purchasedquantity" class="col-sm-4 col-form-label">Purchased Quantity<span className="required-field">*</span></label>
            <div class="col-sm-8">
              <InputNumber id="purchasedquantity" value={purchasedQuantity} onValueChange={(e) => setPurchasedQuantity(e.target.value)} min={0} mode='decimal' className="w-full md:w-14rem form-field-generic-size" />
              {errors.purchasedQuantity && <small className="p-error display-block display-block">{errors.purchasedQuantity}.</small>}
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
