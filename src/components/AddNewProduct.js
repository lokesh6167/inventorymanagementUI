import React, {useState,useContext } from 'react';
import {InventaryManagementContext} from './Context/InventaryManagementProvider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputNumber } from 'primereact/inputnumber';

function AddNewProduct() {
  const [productGroup, setProductGroup] = useState("");
  const [productName, setProductName] = useState("");
  const [wareHouseCode, setWareHouseCode] = useState("");
  const [openingStockQuantity, setOpeningStockQuantity] = useState("");
  const {addProducts,takePrint}=useContext(InventaryManagementContext);
  const handleSubmit = (e) =>{
    e.preventDefault();
    const payload={
        productGroup,
        productItem:productName,
        wareHouseCode,
        stockQuantity:openingStockQuantity
    }
    addProducts(payload);
  }
  const handleReset = ()=>{
    setProductGroup("");
    setProductName("");
    setWareHouseCode("");
    setOpeningStockQuantity("");
  }
    return (
        <div className='add-new-product-container'>
            <p class="h2">Add Product</p>
            <Divider />
            {/* <form onSubmit={handleSubmit}> */}
            <div class="form-group row m-3 ">
                    <label for="warehousecode" class="col-sm-4 col-form-label">Warehouse Code</label>
                    <div class="col-sm-8">
                        <InputText id="warehousecode" value={wareHouseCode} onChange={(e) => setWareHouseCode(e.target.value)} />
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="productGroup" class="col-sm-4 col-form-label">Product Group</label>
                    <div class="col-sm-8">
                        <InputText id="productGroup" value={productGroup} onChange={(e) => setProductGroup(e.target.value)} />
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="productName" class="col-sm-4 col-form-label">Product Name</label>
                    <div class="col-sm-8">
                        <InputText id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} />
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <label for="openingStockQuantity" class="col-sm-4 col-form-label">Opening Stock Quantity</label>
                    <div class="col-sm-8">
                        <InputNumber id="openingStockQuantity" value={openingStockQuantity} onValueChange={(e) => setOpeningStockQuantity(e.target.value)} min={0} mode='decimal'/>
                    </div>
                </div>
                <div class="form-group row m-3 ">
                    <div className="card flex justify-content-center gap-3">
                        <Button label="Submit" onClick = {handleSubmit}/>
                        <Button label="Reset" onClick = {handleReset} severity="secondary" />
                    </div>
                </div>
            {/* </form> */}
        </div>
    );
}

export default AddNewProduct;
