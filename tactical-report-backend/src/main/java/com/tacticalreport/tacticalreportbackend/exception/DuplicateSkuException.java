package com.tacticalreport.tacticalreportbackend.exception;


public class DuplicateSkuException extends RuntimeException {

    /**
     * Constructor with SKU
     * @param sku The duplicate SKU
     */
    public DuplicateSkuException(String sku) {
        super("Item with SKU already exists: " + sku);
    }
}