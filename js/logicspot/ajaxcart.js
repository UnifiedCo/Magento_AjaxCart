(function($) {
	
	if (typeof jQuery !== 'undefined') {
		
		jQuery.fn.extend({
		    ajaxAddToCart: function( options ) {

                /*
                 DEFAULTS
                 */
                var settings = {
                    init: {
                        ajaxCartEnable: null,
                        ajaxCartType: null,
                        isInlineNotificationsEnabled: false,
                        ajaxUrl: 'ajaxcart/index/add'
                    },
                    elements: {
                        addToCartButton: '.btn-cart',
                        qty: 'input.qty',
                        target: this,
                        minicartTarget: 'desktop-basket',
                        notificationsBlock: '#messages_product_view'
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
                        success: null,
                        validateSimpleChildren: true,
                        validateInputs: true
                    },
                    ajax: {
                        init: null,
                        data: null,
                        request: null,
                        success: null,
                        error: null
                    },
                    display: {
                        loading: null,
                        miniCart: null,
                        miniCartAfter: null,
                        popup: null,
                        inline: null,
                        success: null,
                        error: null,
                        message: null,
                        messages: null,
                        buildInlineMessage: null,
                        resetButton: null,
                        consoleLog: null,
                        defaultAjaxMessage: 'There was an error while processing your request. Please try again later.',
                        errorNoAddToCartButtonMessage: 'Could not find add to cart button',
                        errorWhileAddingMessage: 'An error occurred when trying to add this product to your basket',
                        errorAllOptionsMessage: 'Please specify all required options',
                        errorValidQuantityMessage: 'Please select a valid quantity',
                        quantityNotAvailableMessage: 'The requested quantity is not available.',
                        addingToCartText: 'Adding&hellip;',
                        addedToCartText: 'Added',
                        ajaxCartCloseText: 'close',
                        successResetDelay: 4000,
                        minicartCloseDelay: 6000
                    },
                    console: {
                        active: true,
                        log: true
                    }
                };

                var productData = null;

                /*
                 DOM READY
                 */

                settings.documentReady.onClick = function(settings, e) {
                    e.preventDefault();
                    // Loading state
                    settings.display.loading(settings);
                    // Initialise validation
                    settings.validation.init(settings);
                };

                settings.documentReady.onHover = function(settings, e) {};

                settings.documentReady.onLoad = function(settings, e) {};

                /*
                 VALIDATION
                 */

                settings.validation.init = function (settings) {

                    settings.console.log(settings, 'settings.validation.init');

                    // Get the product configuration data
                    var productData = settings.validation.getProductConfiguration(settings);

                    if (productData) {

                        // Check there is sufficient stock
                        var available = true;
                        if (productData.productType === 'simple' || productData.productType === 'configurable' && settings.validation.validateSimpleChildren) {
                            available = settings.validation.stockCheck(settings, productData)
                        }

                        if (available) {
                            settings.console.log(settings, productData);
                            settings.validation.success(settings);
                        }
                    }
                };

                settings.validation.getProductConfiguration = function(settings) {
                    settings.console.log(settings, 'settings.validation.getProductConfiguration');
                    if (!productData) {
                        var data = JSON.parse(settings.elements.target.find('div[data-product]').attr('data-product'));
                        var requiredProps = ['productId', 'productType', 'Qty'];

                        // Check product data has required fields
                        requiredProps.forEach(function (item) {
                            if (!data.hasOwnProperty(item)) {
                                // If data is missing, call validation error
                                settings.validation.error(settings, 'Missing product data: ' + item);
                                settings.display.error(settings, settings.display.errorWhileAddingMessage);
                                data = false;
                            }
                        });

                        // If configurable product, validate configurable data
                        if (data.productType === 'configurable') {
                            data = settings.validation.checkConfigurableAttributes(settings, data);
                        }

                        productData = data;
                    }

                    return productData;

                };

                settings.validation.checkConfigurableAttributes = function(settings, productData) {

                    settings.console.log(settings, 'settings.validation.checkConfigurableAttributes');

                    if (!productData.configuration || !productData.products) {
                        settings.validation.error(settings, 'missing configurable data');
                        settings.display.error(settings, 'An error occurred when trying to add this product to your basket');
                        return false;
                    }

                    var isValid = true;

                    // Validate that user has selected attribute options
                    if (settings.validation.validateInputs) {
                        var selects = $('.super-attribute-select');
                        selects.each(function(){
                            var el = $(this);
                            if (el.prop('required') && !this.value) {
                                settings.display.error(settings, settings.display.errorAllOptionsMessage);
                                isValid = false;
                            }
                        });
                    }

                    if (!isValid) return false;

                    // Get the last select, from which we can infer the chosen simple product
                    // TODO: There should be a logical way to do this without relying on HTML sort order
                    var select = $('.super-attribute-select').last();
                    var selectAttrId = select.attr('id').substring(9); // e.g. Get "180" from "attribute180"
                    var selectAttrOption = select.val();

                    // Get the simple product object, which contains the qty
                    try {
                        var simpleProductId = productData.configuration.attributes[selectAttrId].options[selectAttrOption].products[0];
                    } catch(err) {
                        settings.validation.error(settings, err);
                        settings.display.error(settings, 'An error occurred when trying to add this product to your basket');
                        return false;
                    }

                    // Create new prop in the object with the selected product ID and qty
                    productData.selectedProduct = simpleProductId;
                    return productData;

                };

                settings.validation.stockCheck = function (settings, productData) {

                    settings.console.log(settings, 'settings.validation.stockCheck');

                    var qtyInput = settings.elements.target.find(settings.elements.qty);
                    var qtyInputVal = qtyInput.val();
                    var stock = productData.productType === 'configurable' ? productData.products[productData.selectedProduct].Qty : productData.qty;
                    var isValid = false;

                    switch (true) {
                        case (qtyInput.length < 1 && settings.validation.validateInputs) :
                            settings.display.error(settings, settings.display.errorValidQuantityMessage);
                            break;
                        case (!$.isNumeric(qtyInputVal) && settings.validation.validateInputs) :
                            settings.display.error(settings, settings.display.errorValidQuantityMessage);
                            break;
                        case ((typeof qtyInputVal == 'undefined' || qtyInputVal < 1) && settings.validation.validateInputs) :
                            settings.display.error(settings, settings.display.errorValidQuantityMessage);
                            break;
                        case (qtyInputVal > stock) :
                            settings.display.error(settings, settings.display.quantityNotAvailableMessage);
                            break;
                        default :
                            isValid = true;
                    }

                    return isValid;

                };

                settings.validation.error = function(settings, error) {
                    settings.console.log(settings, 'settings.validation.error');
                    settings.display.error(settings, error);
                };

                settings.validation.success = function(settings) {
                    settings.console.log(settings, 'settings.validation.success');
                    settings.ajax.init(settings);
                };

                /*
                 AJAX
                 */

                settings.ajax.init = function(settings) {
                    settings.console.log(settings, 'settings.ajax.init');

                    // Prepare the data
                    var data = settings.ajax.data(settings);
                    // Make ajax call
                    settings.ajax.request(settings, data);
                };

                settings.ajax.data = function(settings) {
                    settings.console.log(settings, 'settings.ajax.data');

                    //build request parameters
                    var data = $('#product_addtocart_form').serialize();
                    data += '&isAjax=1';

                    return data;
                };

                settings.ajax.request = function(settings, data) {
                    settings.console.log(settings, 'settings.ajax.request');

                    try {
                        $.ajax({
                            url: settings.init.ajaxUrl,
                            dataType: 'json',
                            type : 'post',
                            data: data,
                            success: function(data){
                                settings.console.log(settings, 'ajax success method');
                                settings.console.log(settings, data.error);
                                if (data.error == false) {
                                    settings.ajax.success(settings, data);
                                } else if (data.error == true) {
                                    settings.ajax.error(settings, data.message);
                                }
                            },
                            error: function(){
                                settings.console.log(settings, 'ajax error method');
                                settings.display.error(settings, settings.display.defaultAjaxMessage);
                            }
                        });
                    } catch (e) {
                        settings.console.log(settings, 'ajax catch method');
                        settings.display.error(settings, settings.display.defaultAjaxMessage);
                    }
                    return this;
                };

                settings.ajax.success = function(settings, data) {

                    settings.console.log(settings, 'settings.ajax.success');

                    switch(settings.init.ajaxCartType) {
                        case '1': //TYPE_MINICART
                            settings.display.miniCart(settings, data);
                            break;
                        case '2': //TYPE_INLINE
                            settings.display.inline(settings, data);
                            break;
                        case '3': //TYPE_POPUP
                            settings.display.popup(settings, data);
                            break;
                        default: //TYPE_INLINE
                            settings.display.inline(settings, data);
                    }

                    if (settings.display.isInlineNotificationsEnabled)
                        settings.display.notifications(settings, data);

                };

                settings.ajax.error = function(settings, data) {
                    settings.console.log(settings, 'settings.ajax.error');

                    settings.display.error(settings, data.replace(/<(?:.|\n)*?>/gm, ''));
                };

                /*
                 DISPLAY
                 */

                settings.display.loading = function(settings) {
                    settings.console.log(settings, 'settings.display.loading');

                    var button = settings.elements.target.find(settings.elements.addToCartButton);
                    // Hide existing text
                    button.children().hide();
                    // Add class, disable and prepend text
                    button.addClass('btn-cart-adding').prop('disabled',true).prepend('<span class="btn-cart-state">' + settings.display.addingToCartText + '</span>');
                };

                settings.display.resetButton = function(settings) {
                    settings.console.log(settings, 'settings.display.resetButton');

                    var button = settings.elements.target.find(settings.elements.addToCartButton);
                    button.removeClass('btn-cart-adding btn-cart-added').prop('disabled',false).children().show();
                    button.children('.btn-cart-state').remove();
                };

                settings.display.miniCart = function(settings, data) {

                    settings.console.log(settings, 'settings.display.miniCart');

                    $("#cart_sidebar").html(data.sidebar);

                    settings.display.miniCartAfter(settings);

                    settings.display.success(settings);

                    // Display message
                    settings.display.message(settings, 'success', data.message);

                };

                settings.display.miniCartAfter = function(settings) {

                    settings.console.log(settings, 'settings.display.miniCartAfter');

                    // Reinit foundation dropdowns
                    settings.elements.target.foundation('dropdown', 'reflow');

                    // Open mini cart dropdown
                    var minicartTrigger = jQuery('a[data-dropdown="' + settings.elements.minicartTarget + '"]');
                    var minicartDropdown = jQuery('#' + settings.elements.minicartTarget);
                    Foundation.libs.dropdown.open(minicartDropdown,minicartTrigger);

                    // Close minicart after X seconds, if user is not hovering
                    window.setTimeout(function(){
                        if (!minicartDropdown.is(':hover')) {
                            Foundation.libs.dropdown.close(minicartDropdown);
                        }
                    },settings.display.minicartCloseDelay);

                };

                settings.display.popup =  function(settings, data) {
                    settings.console.log(settings, 'settings.display.popup');

                    var overlay = $('<div class="ajaxcart-overlay"></div>');
                    var modal = $('<div class="ajaxcart-modal"></div>');
                    var modalContent = $('<div class="ajaxcart-modal-content">' + data.messages +  '</div>');
                    var close = $('<button class="ajaxcart-close"><span class="ajaxcart-close-text">' + settings.display.ajaxCartCloseText + '</span>&#10006;</button>');

                    $('body').append(overlay);
                    overlay.append(modal);
                    modal.append(modalContent);
                    modal.append(close);

                    settings.display.success(settings);
                };

                settings.display.inline =  function(settings, data) {

                    settings.console.log(settings, 'settings.display.inline');
                    settings.display.message(settings, 'success', data.message);
                    settings.display.success(settings);
                };

                settings.display.message = function(settings, type, message) {

                    // Valid types: "success", "notice", "error"
                    settings.console.log(settings, 'settings.display.message');

                    if (settings.init.ajaxCartType == 1 || settings.init.ajaxCartType == 2) { // MINI CART OR INLINE

                        if (message.indexOf('</div>') > -1) {
                            console.log('msg has HTML');
                            settings.display.notifications(settings, message);
                        } else {
                            console.log('msg doesnt have HTML');
                            console.log(message);
                            console.log(typeof message);
                            settings.display.buildInlineMessage(settings, type, message);
                        }


                    } else if (settings.init.ajaxCartType == 3) { // POPUP

                        console.log('settings.display. popup');

                        settings.display.popup(settings, {message:message});

                    }

                };

                settings.display.notifications = function(settings, notification) {

                    settings.console.log(settings, 'settings.display.notification');

                    var notificationsBlock = $(settings.elements.notificationsBlock);

                    if (notificationsBlock.length > 0)
                        $(settings.elements.notificationsBlock).html(notification);


                };

                settings.display.buildInlineMessage = function(settings, type, message) {

                    settings.console.log(settings, 'settings.display.buildInlineMessage');

                    var messagesWrapper = $(settings.elements.notificationsBlock);
                    var messagesList = $('<div class="messages"></div>');
                    var messageItem = $('<div class="alert-box ' + type + '">' + message + '</div>');
                    var messageClose = $('<a href="#" class="close">×</a>');

                    messagesWrapper.html(messagesList);
                    messagesList.append(messageItem);
                    messageItem.append(messageClose);

                };

                settings.display.success = function(settings, data) {
                    settings.console.log(settings, 'settings.display.success');
                    // Show success state in button, then reset after X seconds
                    var button = $(settings.elements.addToCartButton);
                    button.removeClass('btn-cart-adding').addClass('btn-cart-added').find('.btn-cart-state').text(settings.display.addedToCartText);
                    window.setTimeout(function(){
                        settings.display.resetButton(settings);
                    },settings.display.successResetDelay);
                };

                settings.display.error = function(settings, msg) {
                    settings.console.log(settings, 'settings.display.error');
                    settings.display.message(settings, 'error', msg);
                    settings.display.resetButton(settings);
                };

                settings.console.log = function(settings, message) {
                    if (settings.console.active) {
                        console.log(message);
                    }
                };

                // Merge defaults with any configured overrides
                for (var obj in settings) {
                    if (options && options.hasOwnProperty(obj)) {
                        settings[obj] = $.extend( {}, settings[obj], options[obj] );
                    }
                }

                return this.each(function(){
                    settings.console.log(settings, 'document.ready');

                    settings.console.log(settings, settings.init);

                    // Check button exists
                    if ($(settings.elements.addToCartButton).length < 1) {
                        settings.validation.error(settings, settings.display.errorNoAddToCartButtonMessage);
                    }

                    // Connect button to onClick setting
                    settings.elements.target.on('click', settings.elements.addToCartButton, function(e){
                        settings.documentReady.onClick(settings, e);
                    });

                    // Connect button to onHover setting
                    settings.elements.target.on('hover', settings.elements.addToCartButton, function(e){
                        settings.documentReady.onHover(settings, e);
                    });

                    // Connect button to onLoad setting
                    settings.elements.target.on('load', settings.elements.addToCartButton, function(e){
                        settings.documentReady.onLoad(settings, e);
                    });

                    // Close popup
                    $(document).on('click','.ajaxcart-close, .ajaxcart-overlay',function(){
                        $(this).closest('.ajaxcart-overlay').remove();
                    });

                });

            }
        }); // end jQuery.fn.extend
		
	} // end if typeof jQuery !== 'undefined'
	
}(jQuery));