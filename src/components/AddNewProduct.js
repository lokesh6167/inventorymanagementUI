import React, { useState, useContext, useEffect } from 'react';
import { InventaryManagementContext } from './Context/InventaryManagementProvider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputNumber } from 'primereact/inputnumber';
import Table from 'react-bootstrap/Table';

function AddNewProduct() {
    const [wareHouseCode, setWareHouseCode] = useState("");
    const [productGroup, setProductGroup] = useState("");
    const [productName, setProductName] = useState("");
    const [openingStockQuantity, setOpeningStockQuantity] = useState("");
    const [errors, setErrors] = useState({});
    const [addedProductResponse, setAddedProductResponse] = useState(null);
    const [addedProductFlag, setAddedProductFlag] = useState(false);
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
    // useEffect(() => {
    //     if (addedProductResponse) {
    //         setAddedProductFlag(!addedProductFlag);
    //     }
    // }, [addedProductResponse]);

    const addAnotherNewProduct = () => {
        setAddedProductFlag(!addedProductFlag);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isValidate()) {
            const payload = {
                productGroup,
                productItem: productName,
                wareHouseCode,
                stockQuantity: openingStockQuantity
            }
            const addedProductDetails = await addProducts(payload);
            setAddedProductResponse(addedProductDetails);
            setAddedProductFlag(true);
            setErrors({ wareHouseCode: "", productGroup: "", productItem: "", openingStockQuantity: "" });
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
            {addedProductFlag ?
                <>
                    <div className="receipt-headings">
                        <p class="h5 text-success">New product has been added successfully. Please find the details</p>
                        <Button label="Add another new product" onClick={addAnotherNewProduct} />
                    </div>
                    <div className="card flex justify-content-center">
                        {addedProductResponse ?
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
                                            <td>{addedProductResponse.wareHouseCode}</td>
                                        </tr>
                                        <tr>
                                            <td>Product Group</td>
                                            <td>{addedProductResponse.productGroup}</td>
                                        </tr>
                                        <tr>
                                            <td>Product Name</td>
                                            <td>{addedProductResponse.productItem}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                <div className="p-d-flex p-jc-center p-mt-5">
                                    <Button label="Take Print" onClick={takePrint} />
                                </div>
                            </>
                            :
                            <h5>No Results found. Order hasn't submitted successfuly. Please try again.</h5>
                        }
                    </div>
                </>
                :
                <div>
                    <div class="form-group row m-3 ">
                        <label for="warehousecode" class="col-sm-4 col-form-label">Warehouse Code<span className="required-field">*</span></label>
                        <div class="col-sm-8">
                            <InputText id="warehousecode" value={wareHouseCode} onChange={(e) => setWareHouseCode(e.target.value)} className="w-full md:w-14rem form-field-generic-size" />
                            {errors.wareHouseCode && <small className="p-error">{errors.wareHouseCode}.</small>}
                        </div>
                    </div>
                    <div class="form-group row m-3 ">
                        <label for="productGroup" class="col-sm-4 col-form-label">Product Group<span className="required-field">*</span></label>
                        <div class="col-sm-8">
                            <InputText id="productGroup" value={productGroup} onChange={(e) => setProductGroup(e.target.value)} className="w-full md:w-14rem form-field-generic-size" />
                            {errors.productGroup && <small className="p-error">{errors.productGroup}.</small>}
                        </div>
                    </div>
                    <div class="form-group row m-3 ">
                        <label for="productName" class="col-sm-4 col-form-label">Product Name<span className="required-field">*</span></label>
                        <div class="col-sm-8">
                            <InputText id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full md:w-14rem form-field-generic-size" />
                            {errors.productName && <small className="p-error">{errors.productName}.</small>}
                        </div>
                    </div>
                    <div class="form-group row m-3 ">
                        <label for="openingStockQuantity" class="col-sm-4 col-form-label">Opening Stock Quantity<span className="required-field">*</span></label>
                        <div class="col-sm-8">
                            <InputNumber id="openingStockQuantity" value={openingStockQuantity} onValueChange={(e) => setOpeningStockQuantity(e.target.value)} min={0} mode='decimal' className="w-full md:w-14rem form-field-generic-size" />
                            {errors.openingStockQuantity && <small className="p-error">{errors.openingStockQuantity}.</small>}
                        </div>
                    </div>
                    <div class="form-group row m-3 ">
                        <div className="card flex justify-content-center gap-3 no-border">
                            <Button label="Submit" onClick={handleSubmit} />
                            <Button label="Reset" onClick={handleReset} severity="secondary" />
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export default AddNewProduct;
