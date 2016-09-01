(function($) {

    if (typeof jQuery !== 'undefined') {

        jQuery.fn.ajaxAddToCart = function( options ) {

            /*
             DEFAULTS
             */
            var settings = {
                elements: {
                    addToCartButton: '.add-to-cart',
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
                    checkQty: null,
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

            // Merge defaults with any configured overrides
            for (var obj in settings) {
                if (options && options.hasOwnProperty(obj)) {
                    settings[obj] = $.extend( {}, settings[obj], options[obj] );
                }
            }

            /*
             DOM READY
             */

            settings.documentReady.onClick = function() {
                // Initialise validation
                settings.validation.init();
                // Loading state
                settings.display.loading();
            };

            settings.documentReady.onHover = function() {};

            settings.documentReady.onLoad = function() {};

            $(document).ready(function(){

                // Connect button to onClick setting
                settings.elements.target.on('click', settings.elements.addToCartButton, function(){
                    settings.documentReady.onClick();
                });


                // Connect button to onHover setting
                settings.elements.target.on('hover', settings.elements.addToCartButton, function(){
                    settings.documentReady.onHover();
                });

                // Connect button to onLoad setting
                settings.elements.target.on('load', settings.elements.addToCartButton, function(){
                    settings.documentReady.onLoad();
                });

            });

            /*
             VALIDATION
             */

            settings.validation.init = function () {

                // Get the product configuration
                settings.validation.getProductConfiguration();

                // Check quantity
                settings.validation.checkQty();

                // If configurable, check configurable attributes
                settings.validation.checkConfigurableAttributes();

                // Success
                settings.validation.success();

            };

            settings.validation.getProductConfiguration = function() {
                var productData;
                // Do some validation
                // If error
                settings.validation.error();
                // else
                return productData;
            };

            settings.validation.checkConfigurableAttributes = function() {
                var configurableProductData;
                // Do some validation
                // If error
                settings.validation.error();
                // else
                return configurableProductData;
            };

            settings.validation.checkQty = function () {
                var qty;
                // Do some validation
                // If error
                settings.validation.error();
                // else
                return qty;
            };

            settings.validation.error = function() {
                // Handle validation fail
                settings.display.error();
            };

            settings.validation.success = function() {
                // Handle validation passed

                // Initialise Ajax
                settings.ajax.init();
            };


            /*
             AJAX
             */

            settings.ajax.init = function() {
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

        }; // end jQuery.fn.ajaxAddToCart

    } // end if typeof jQuery !== 'undefined'

}(jQuery));