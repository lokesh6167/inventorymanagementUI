import React, { useState, useContext } from 'react';
import { InventaryManagementContext } from './Context/InventaryManagementProvider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputNumber } from 'primereact/inputnumber';

function AddNewProduct() {
    const [wareHouseCode, setWareHouseCode] = useState("");
    const [productGroup, setProductGroup] = useState("");
    const [productName, setProductName] = useState("");
    const [openingStockQuantity, setOpeningStockQuantity] = useState("");
    const [errors, setErrors] = useState({});
    const { addProducts, takePrint } = useContext(InventaryManagementContext);

    const isValidate = () => {
        let noErros = true;
        let errors = {};
        if (!wareHouseCode) {
            errors.wareHouseCode = "Please enter ware house code";
            noErros = false;
        }
        if (!productGroup) {
            errors.productGroup = "Please enter product group";
            noErros = false;
        }
        if (!productName) {
            errors.productName = "Please enter product name";
            noErros = false;
        }
        if (!openingStockQuantity) {
            errors.openingStockQuantity = "Please enter opening stock quantity";
            noErros = false;
        }
        setErrors(errors);
        return noErros;
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isValidate()) {
            const payload = {
                productGroup,
                productItem: productName,
                wareHouseCode,
                stockQuantity: openingStockQuantity
            }
            addProducts(payload);
        }
    }
    const handleReset = () => {
        setProductGroup("");
        setProductName("");
        setWareHouseCode("");
        setOpeningStockQuantity("");
    }
    return (
        <div className='add-new-product-container'>
            <p class="h2">Add Product</p>
            <Divider />
            <div class="form-group row m-3 ">
                <label for="warehousecode" class="col-sm-4 col-form-label">Warehouse Code<span className="required-field">*</span></label>
                <div class="col-sm-8">
                    <InputText id="warehousecode" value={wareHouseCode} onChange={(e) => setWareHouseCode(e.target.value)} />
                    {errors.wareHouseCode && <small className="p-error">{errors.wareHouseCode}.</small>}
                </div>
            </div>
            <div class="form-group row m-3 ">
                <label for="productGroup" class="col-sm-4 col-form-label">Product Group<span className="required-field">*</span></label>
                <div class="col-sm-8">
                    <InputText id="productGroup" value={productGroup} onChange={(e) => setProductGroup(e.target.value)} />
                    {errors.productGroup && <small className="p-error">{errors.productGroup}.</small>}
                </div>
            </div>
            <div class="form-group row m-3 ">
                <label for="productName" class="col-sm-4 col-form-label">Product Name<span className="required-field">*</span></label>
                <div class="col-sm-8">
                    <InputText id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} />
                    {errors.productName && <small className="p-error">{errors.productName}.</small>}
                </div>
            </div>
            <div class="form-group row m-3 ">
                <label for="openingStockQuantity" class="col-sm-4 col-form-label">Opening Stock Quantity<span className="required-field">*</span></label>
                <div class="col-sm-8">
                    <InputNumber id="openingStockQuantity" value={openingStockQuantity} onValueChange={(e) => setOpeningStockQuantity(e.target.value)} min={0} mode='decimal' />
                    {errors.openingStockQuantity && <small className="p-error">{errors.openingStockQuantity}.</small>}
                </div>
            </div>
            <div class="form-group row m-3 ">
                <div className="card flex justify-content-center gap-3">
                    <Button label="Submit" onClick={handleSubmit} />
                    <Button label="Reset" onClick={handleReset} severity="secondary" />
                </div>
            </div>
            {/* </form> */}
        </div>
    );
}

export default AddNewProduct;
