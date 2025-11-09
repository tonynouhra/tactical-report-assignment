package com.tacticalreport.tacticalreportbackend.exception;


public class ItemNotFoundException extends RuntimeException {

    /**
     * Constructor with item ID
     * @param id The ID of the item that was not found
     */
    public ItemNotFoundException(String id) {
        super("Item not found with id: " + id);
    }

    /**
     * Constructor with custom message
     * @param message Custom error message
     */
    public ItemNotFoundException(String message, boolean customMessage) {
        super(message);
    }
}