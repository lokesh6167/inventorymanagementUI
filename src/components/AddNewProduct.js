import React, { useState, useContext } from 'react';
import { InventaryManagementContext } from './Context/InventaryManagementProvider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputNumber } from 'primereact/inputnumber';
import Table from 'react-bootstrap/Table';
import ServerDownMessage from './ServerDownMessage';
import { Dropdown } from 'primereact/dropdown';

function AddNewProduct() {
    const [wareHouseCode, setWareHouseCode] = useState('');
    const [productGroup, setProductGroup] = useState('');
    const [productName, setProductName] = useState('');
    const [openingStockQuantity, setOpeningStockQuantity] = useState('');
    const [errors, setErrors] = useState({});
    const [addedProductResponse, setAddedProductResponse] = useState(null);
    const [addedProductFlag, setAddedProductFlag] = useState(false);
    const { products, addProducts, takePrint, isBackendUp } = useContext(
        InventaryManagementContext
    );

    const isValidate = () => {
        let noErrors = true;
        let errors = {};
        if (!wareHouseCode) {
            errors.wareHouseCode = 'Please enter warehouse code';
            noErrors = false;
        }
        if (!productGroup) {
            errors.productGroup = 'Please enter product group';
            noErrors = false;
        }
        if (!productName) {
            errors.productName = 'Please enter product name';
            noErrors = false;
        }
        if (!openingStockQuantity) {
            errors.openingStockQuantity = 'Please enter opening stock quantity';
            noErrors = false;
        }
        setErrors(errors);
        return noErrors;
    };

    const isExistingProduct = () => {
        const existingProduct = products.find(
            (product) =>
                product.wareHouseCode === wareHouseCode &&
                product.productGroup === productGroup &&
                product.productItem === productName
        );
        if (existingProduct) {
            setErrors({
                ...errors,
                existingProduct: `Existing product. Cannot add duplicate product. Please find existing product details:\nProduct Id: ${existingProduct.id}\nWarehouse Code: ${existingProduct.wareHouseCode}\nProduct Group: ${existingProduct.productGroup}\nProduct Name: ${existingProduct.productItem}\nCurrent Stock Quantity: ${existingProduct.stockQuantity}`,
            });
        }
        return existingProduct;
    };

    const addAnotherNewProduct = () => {
        setAddedProductFlag(!addedProductFlag);
    };
    const warehouses = [{ name: "Kochadai", code: "Kochadai" }, { name: "Nagamalai Padukottai", code: "Nagamalai Padukottai" }, { name: "Head office", code: "Head office" }]
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isValidate()) {
            if (!isExistingProduct()) {
                const payload = {
                    productGroup: productGroup.toLowerCase(),
                    productItem: productName.toLowerCase(),
                    wareHouseCode: wareHouseCode.code,
                    stockQuantity: openingStockQuantity,
                };
                const addedProductDetails = await addProducts(payload);
                setAddedProductResponse(addedProductDetails);
                setAddedProductFlag(true);
                setErrors({
                    wareHouseCode: '',
                    productGroup: '',
                    productItem: '',
                    openingStockQuantity: '',
                });
            }
        }
    };

    const handleReset = () => {
        setProductGroup('');
        setProductName('');
        setWareHouseCode('');
        setOpeningStockQuantity('');
    };

    if (!isBackendUp) {
        return <ServerDownMessage />;
    }

    return (
        <div className="add-new-product-container">
            <p className="h2">Add Product</p>
            <Divider />
            {addedProductFlag ? (
                <>
                    <div className="receipt-headings exclude-from-print">
                        <p className="h5 text-success">
                            New product has been added successfully. Please find the details
                        </p>
                        <Button
                            label="Add another new product"
                            onClick={addAnotherNewProduct}
                        />
                    </div>
                    <div className="card flex justify-content-center">
                        {addedProductResponse ? (
                            <>
                                <Table className='custom-margin-bottom-2' striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Warehouse Code</td>
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
                                        <tr>
                                            <td>Current Stock Quantity</td>
                                            <td>{addedProductResponse.stockQuantity}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                <div className="p-d-flex p-justify-center p-align-center p-jc-center p-mt-5 exclude-from-print">
                                    <Button className="take-print-btn-add-product" label="Take Print" onClick={takePrint} />
                                </div>
                            </>
                        ) : (
                            <h5>
                                No Results found. Order hasn't been submitted successfully.
                                Please try again.
                            </h5>
                        )}
                    </div>
                </>
            ) : (
                <div>
                    <div className="form-group row m-3">
                        <label htmlFor="warehousecode" className="col-sm-4 col-form-label">
                            Warehouse Code<span className="required-field">*</span>
                        </label>
                        <div className="col-sm-8">
                            <Dropdown value={wareHouseCode} onChange={(e) => setWareHouseCode(e.value)} options={warehouses} optionLabel="name"
                                placeholder="Select a Warehouse" className="w-full md:w-14rem form-field-generic-size" />
                            {errors.wareHouseCode && (
                                <small className="p-error display-block">
                                    {errors.wareHouseCode}.
                                </small>
                            )}
                        </div>
                    </div>
                    <div className="form-group row m-3">
                        <label htmlFor="productGroup" className="col-sm-4 col-form-label">
                            Product Group<span className="required-field">*</span>
                        </label>
                        <div className="col-sm-8">
                            <InputText
                                id="productGroup"
                                value={productGroup}
                                onChange={(e) => setProductGroup(e.target.value)}
                                className="w-full md:w-14rem form-field-generic-size"
                                placeholder="Enter Product Group"
                            />
                            {errors.productGroup && (
                                <small className="p-error display-block">
                                    {errors.productGroup}.
                                </small>
                            )}
                        </div>
                    </div>
                    <div className="form-group row m-3">
                        <label htmlFor="productName" className="col-sm-4 col-form-label">
                            Product Name<span className="required-field">*</span>
                        </label>
                        <div className="col-sm-8">
                            <InputText
                                id="productName"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="w-full md:w-14rem form-field-generic-size"
                                placeholder="Enter Product Name"
                            />
                            {errors.productName && (
                                <small className="p-error display-block">
                                    {errors.productName}.
                                </small>
                            )}
                        </div>
                    </div>
                    <div className="form-group row m-3">
                        <label
                            htmlFor="openingStockQuantity"
                            className="col-sm-4 col-form-label"
                        >
                            Opening Stock Quantity<span className="required-field">*</span>
                        </label>
                        <div className="col-sm-8">
                            <InputNumber
                                id="openingStockQuantity"
                                value={openingStockQuantity}
                                onValueChange={(e) => setOpeningStockQuantity(e.target.value)}
                                min={0}
                                mode="decimal"
                                className="w-full md:w-14rem form-field-generic-size"
                                placeholder="Enter opening stock quantity"
                            />
                            {errors.openingStockQuantity && (
                                <small className="p-error display-block">
                                    {errors.openingStockQuantity}.
                                </small>
                            )}
                        </div>
                    </div>
                    <div className="form-group row m-3">
                        {errors.existingProduct && (
                            <small className="p-error display-block">
                                {errors.existingProduct}.
                            </small>
                        )}
                    </div>
                    <div className="form-group row m-3">
                        <div className="card flex justify-content-center gap-3 no-border">
                            <Button label="Submit" onClick={handleSubmit} />
                            <Button
                                label="Reset"
                                onClick={handleReset}
                                severity="secondary"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddNewProduct;
