(function($) {

    if (typeof jQuery !== 'undefined') {

        jQuery.fn.ajaxAddToCart = function( options ) {

            /*
             DEFAULTS
             */
            var settings = {
                elements: {
                    addToCartButton: '.btn-cart',
                    qty: 'input.qty',
                    target: $(document)
                },
                documentReady: {
                    onClick: null,
                    onHover: null,
                    btnLoad: null
                },
                validation: {
                    init: null,
                    getProductConfiguration: null,
                    checkConfigurableAttributes: null,
                    stockCheck: null,
                    error: null,
                    success: null
                },
                ajax: {
                    init: null,
                    request: null,
                    miniCart: null,
                    popup: null,
                    inline: null,
                    success: null,
                    error: null
                },
                display: {
                    loading: null,
                    error: null,
                    success: null
                }
            };

            /*
             DOM READY
             */

            settings.documentReady.onClick = function(e) {
                e.preventDefault();
                // Initialise validation
                settings.validation.init(e.target);
                // Loading state
                settings.display.loading();
            };

            settings.documentReady.onHover = function(e) {};

            settings.documentReady.onLoad = function(e) {};

            $(document).ready(function(){

                // Check button exists
                if ($(settings.elements.addToCartButton).length < 1)
                    settings.validation.error('missing button');

                // Connect button to onClick setting
                settings.elements.target.on('click', settings.elements.addToCartButton, function(e){
                    settings.documentReady.onClick(e);
                });

                // Connect button to onHover setting
                settings.elements.target.on('hover', settings.elements.addToCartButton, function(e){
                    settings.documentReady.onHover(e);
                });

                // Connect button to onLoad setting
                settings.elements.target.on('load', settings.elements.addToCartButton, function(e){
                    settings.documentReady.onLoad(e);
                });

            });

            /*
             VALIDATION
             */

            settings.validation.init = function (button) {

                // Get the product configuration data
                var productData = settings.validation.getProductConfiguration(button);
                
                if (productData) {

                    // Check there is sufficient stock
                    var available = settings.validation.stockCheck(productData);

                    if (available) {
                        settings.validation.success(productData);
                    }

                }

            };

            settings.validation.getProductConfiguration = function(button) {

                var data = JSON.parse($(button).attr('data-product'));
                var requiredProps = ['id','type','qty'];

                // Check product data has required fields
                requiredProps.forEach(function(item){
                    if (!data.hasOwnProperty(item)) {
                        // If data is missing, call validation error
                        settings.validation.error('missing product data: ' + item);
                        data = false;
                    }
                });

                // If configurable product, validate configurable data
                if (data.type === 'configurable')
                    data = settings.validation.checkConfigurableAttributes(data);

                return data;

            };

            settings.validation.checkConfigurableAttributes = function(productData) {

                if (!productData.configuration) {
                    settings.validation.error('missing configurable data');
                    return false;
                }

                var isValid = true;

                // Validate that user has selected attribute options
                var selects = $('.super-attribute-select');
                selects.each(function(){
                    if (!this.value) {
                        settings.validation.error('please complete all fields');
                        isValid = false;
                    }
                });

                if (!isValid) return false;

                // Get the last select, from which we can infer the chosen simple product
                var select = $('.super-attribute-select').last();
                var selectAttrId = select.attr('id').substring(9); // e.g. Get "180" from "attribute180"
                var selectAttrOption = select.val();
                var simpleProductId = productData.configuration.attributes[selectAttrId].options[selectAttrOption].products[0];

                // Create new prop in the object with the selected product ID and qty
                productData.selectedProduct = productData.configuration.products[simpleProductId];
                return productData;

            };

            settings.validation.stockCheck = function (productData) {

                var qtyInput = $(settings.elements.qty);
                var qtyInputVal = qtyInput.val();
                var stock = productData.type === 'configurable' ? productData.selectedProduct.qty : productData.qty;

                var isValid = false;

                switch (true) {
                    case (qtyInput.length < 1) :
                        settings.validation.error('Missing qty input');
                        break;
                    case (typeof qtyInputVal == 'undefined' || qtyInputVal < 1) :
                        settings.validation.error('Invalid qty value');
                        break;
                    case (qtyInputVal > stock) :
                        settings.validation.error('Insufficient stock');
                        break;
                    default :
                        isValid = true;
                }

                return isValid;

            };

            settings.validation.error = function(error) {
                console.log(error);
                settings.display.error();
            };

            settings.validation.success = function(productData) {
                // Initialise Ajax
                settings.ajax.init(productData);
            };


            /*
             AJAX
             */

            settings.ajax.init = function(productData) {
                console.log('settings.ajax.init');
                console.log(productData);

                // Make ajax call
                settings.ajax.request();
                // On success
                // Check type and fire relevant handler e.g.
                settings.ajax.miniCart();
                settings.ajax.popup();
                settings.ajax.inline();
            };

            settings.ajax.request = function() {
                //build request parameters
                // If fail
                settings.display.error();
                // else
                return this;
            };

            settings.ajax.miniCart =  function() {
                // Do some validation
                // If error
                settings.ajax.error();
                // else
                settings.ajax.success();
            };

            settings.ajax.popup =  function() {
                // Do some validation
                // If error
                settings.ajax.error();
                // else
                settings.ajax.success();
            };

            settings.ajax.inline =  function() {
                // Do some validation
                // If error
                settings.ajax.error();
                // else
                settings.ajax.success();
            };

            settings.ajax.success = function() {
                settings.display.success();
            };

            settings.ajax.error = function() {
                settings.display.error();
            };


            /*
             DISPLAY
             */

            settings.display.loading = function() {
                // Add loading class to button etc.
            };

            settings.display.success = function() {
                // Add success class to button etc.
            };

            settings.display.error = function() {
                // Add error class to button etc.
            };

            // Merge defaults with any configured overrides
            for (var obj in settings) {
                if (options && options.hasOwnProperty(obj)) {
                    settings[obj] = $.extend( {}, settings[obj], options[obj] );
                }
            }

        }; // end jQuery.fn.ajaxAddToCart

    } // end if typeof jQuery !== 'undefined'

}(jQuery));