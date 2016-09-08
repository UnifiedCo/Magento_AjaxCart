(function($) {
	
	if (typeof jQuery !== 'undefined') {
		
		jQuery.fn.ajaxAddToCart = function( options ) {
			
			/*
			 DEFAULTS
			 */
			var settings = {
				init: {
					ajaxCartEnable: null,
					ajaxCartType: null
				},
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
					success: null,
					validateSimpleChildren: true
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
					xxx: null,
					popup: null,
					inline: null,
					success: null,
					error: null,
					message: null,
					resetButton: null,
					consoleLog: null,
					defaultAjaxMessage: 'There was an error while processing your request. Please try again later.'
				},
				console: {
					active: true,
					log: null
				}
			};
			
			/*
			 DOM READY
			 */
			
			settings.documentReady.onClick = function(e) {
				e.preventDefault();
				// Loading state
				settings.display.loading();
				// Initialise validation
				settings.validation.init(e.target);
			};
			
			settings.documentReady.onHover = function(e) {};
			
			settings.documentReady.onLoad = function(e) {};
			
			$(document).ready(function(){
				
				settings.console.log('document.ready');
				
				settings.console.log(settings.init);
				
				// Check button exists
				if ($(settings.elements.addToCartButton).length < 1) {
					settings.validation.error('Could not find add to cart button');
				}
				
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

				// Close popup
				$(document).on('click','.ajaxcart-close, .ajaxcart-overlay',function(){
					$(this).closest('.ajaxcart-overlay').remove();
				});
				
			});
			
			/*
			 VALIDATION
			 */

			settings.validation.init = function (button) {
				
				settings.console.log('settings.validation.init');
				
				// Get the product configuration data
				var productData = settings.validation.getProductConfiguration(button);
				
				if (productData) {
					
					// Check there is sufficient stock
					var available = true;
					if (productData.productType === 'simple' || productData.productType === 'configurable' && settings.validation.validateSimpleChildren) {
						available = settings.validation.stockCheck(productData)
					}
					
					if (available) {
						settings.console.log(productData);
						settings.validation.success();
					}
				}
			};
			
			settings.validation.getProductConfiguration = function(button) {
				
				settings.console.log('settings.validation.getProductConfiguration');
				
				var data = JSON.parse($(button).closest('form').find('div[data-product]').attr('data-product'));
				var requiredProps = ['productId','productType','Qty'];
				
				// Check product data has required fields
				requiredProps.forEach(function(item){
					if (!data.hasOwnProperty(item)) {
						// If data is missing, call validation error
						settings.validation.error('Missing product data: ' + item);
						settings.display.error('An error occurred when trying to add this product to your basket');
						data = false;
					}
				});
				
				// If configurable product, validate configurable data
				if (data.productType === 'configurable')
					data = settings.validation.checkConfigurableAttributes(data);
				
				return data;
				
			};
			
			settings.validation.checkConfigurableAttributes = function(productData) {
				
				settings.console.log('settings.validation.checkConfigurableAttributes');
				
				if (!productData.configuration || !productData.products) {
					settings.validation.error('missing configurable data');
					settings.display.error('An error occurred when trying to add this product to your basket');
					return false;
				}
				
				var isValid = true;
				
				// Validate that user has selected attribute options
				var selects = $('.super-attribute-select');
				selects.each(function(){
					if (!this.value) {
						settings.display.error('Please complete all form fields');
						isValid = false;
					}
				});
				
				if (!isValid) return false;
				
				// Get the last select, from which we can infer the chosen simple product
				var select = $('.super-attribute-select').last();
				var selectAttrId = select.attr('id').substring(9); // e.g. Get "180" from "attribute180"
				var selectAttrOption = select.val();
				
				// Get the simple product object, which contains the qty
				try {
					var simpleProductId = productData.configuration.attributes[selectAttrId].options[selectAttrOption].products[0];
				} catch(err) {
					settings.validation.error(err);
					settings.display.error('An error occurred when trying to add this product to your basket');
					return false;
				}
				
				// Create new prop in the object with the selected product ID and qty
				productData.selectedProduct = simpleProductId;
				return productData;
				
			};
			
			settings.validation.stockCheck = function (productData) {
				
				settings.console.log('settings.validation.stockCheck');
				
				var qtyInput = $(settings.elements.qty);
				var qtyInputVal = qtyInput.val();
				var stock = productData.productType === 'configurable' ? productData.products[productData.selectedProduct].Qty : productData.qty;
				var isValid = false;
				
				switch (true) {
					case (qtyInput.length < 1) :
						settings.display.error('Please select a valid quantity');
						break;
					case (!$.isNumeric(qtyInputVal)) :
						settings.display.error('Please select a valid quantity');
						break;
					case (typeof qtyInputVal == 'undefined' || qtyInputVal < 1) :
						settings.display.error('Please select a valid quantity');
						break;
					case (qtyInputVal > stock) :
						settings.display.error('There is insufficient stock to fulfill your request');
						break;
					default :
						isValid = true;
				}
				
				return isValid;
				
			};
			
			settings.validation.error = function(error) {
				settings.console.log('settings.validation.error');
				settings.display.error(error);
			};
			
			settings.validation.success = function() {
				settings.console.log('settings.validation.success');
				settings.ajax.init();
			};
			
			/*
			 AJAX
			 */
			
			settings.ajax.init = function() {
				settings.console.log('settings.ajax.init');
				
				// Prepare the data
				var data = settings.ajax.data();
				// Make ajax call
				
				
				settings.ajax.request(data);
			};
			
			settings.ajax.data = function() {
				settings.console.log('settings.ajax.data');
				
				//build request parameters
				var data = $('#product_addtocart_form').serialize();
				data += '&isAjax=1';
				
				return data;
			};
			
			settings.ajax.request = function(data) {
				settings.console.log('settings.ajax.request');
				
				try {
					
					$.ajax({
						url: 'ajaxcart/index/add',
						dataType: 'json',
						type : 'post',
						data: data,
						success: function(data){
							settings.console.log('ajax success method');
							settings.console.log(data.error);
							if (data.error == false) {
								settings.ajax.success(data);
							} else if (data.error == true) {
								settings.ajax.error(data.message);
							}
						},
						error: function(){
							settings.console.log('ajax error method');
							settings.display.error(settings.display.defaultAjaxMessage);
						}
					});
				} catch (e) {
					settings.console.log('ajax catch method');
					settings.display.error(settings.display.defaultAjaxMessage);
				}
				return this;
			};
			
			settings.ajax.success = function(data) {
				
				settings.console.log('settings.ajax.success');
				
				switch(settings.init.ajaxCartType) {
					case '1': //TYPE_MINICART
						settings.display.miniCart(data);
						break;
					case '2': //TYPE_INLINE
						settings.display.inline(data);
						break;
					case '3': //TYPE_POPUP
						settings.display.popup(data);
						break;
					default: //TYPE_INLINE
						settings.display.inline(data);
				}

			};
			
			settings.ajax.error = function(data) {
				settings.console.log('settings.ajax.error');
				
				settings.display.error(data.replace(/<(?:.|\n)*?>/gm, ''));
			};
			
			/*
			 DISPLAY
			 */
			
			settings.display.loading = function() {
				settings.console.log('settings.display.loading');
				
				var button = $(settings.elements.addToCartButton);
				// Hide existing text
				button.children().hide();
				// Add class, disable and prepend text
				button.addClass('btn-cart-adding').prop('disabled',true).prepend('<span class="btn-cart-state">Adding&hellip;</span>');
			};
			
			settings.display.resetButton = function() {
				settings.console.log('settings.display.resetButton');
				var button = $(settings.elements.addToCartButton);
				button.removeClass('btn-cart-adding btn-cart-added').prop('disabled',false).children().show();
				button.children('.btn-cart-state').remove();
			};
			
			settings.display.miniCart = function(data) {
				
				settings.console.log('settings.display.miniCart');
				
				$("#cart_sidebar").html(data.sidebar);
				
				settings.display.xxx();
				
				/*// set the container
				jQuery(".desktop-basket-items").html(data.sidebar);
				
				jQuery('.cart-header').toggleClass('cart-header-open');
				
				window.setTimeout(function() {
					if (!jQuery('#-sidebar-cart').is(':hover')) {
						jQuery('.cart-header-anchor').toggleClass('cart-header-open');
					}
					basketDropdown(jQuery);
				}, 5000);*/
				
				settings.display.success();
			};
			
			settings.display.xxx = function() {
				
				settings.elements.target.foundation('clearing', 'reflow');
				
				//$('#desktop-basket').trigger('click.fndtn.dropdown');
			}
			
			settings.display.popup =  function(data) {
				
				settings.console.log('settings.display.popup');
				
				var overlay = $('<div class="ajaxcart-overlay"></div>');
				var modal = $('<div class="ajaxcart-modal"></div>');
				var modalContent = $('<div class="ajaxcart-modal-content"></div>');
				var close = $('<button class="ajaxcart-close"><span class="ajaxcart-close-text">close</span>&#10006;</button>');
				
				$('body').append(overlay);
				overlay.append(modal);
				modal.append(modalContent);
				modal.append(close);
				
				settings.display.success();
			};
			
			settings.display.inline =  function() {
				
				settings.console.log('settings.display.inline');
				settings.display.message('success','Ajax response goes here');
				settings.display.success();
			};
			
			settings.display.message = function(type,message) {
				// Valid types: "success", "notice", "error"
				settings.console.log('settings.display.message');
				
				// TODO: Make this work on category pages as well
				var messagesWrapper = $('#messages_product_view');
				var messagesList = messagesWrapper.children('ul.messages');
				
				if (messagesWrapper.length > 0) {
					
					messagesList = messagesList.length > 0 ? messagesList : $('<ul class="messages"></ul>');
					var messageItem = $('<li class="' + type + '-msg"></li>');
					var messageContent = $('<ul><li><span>' + message + '</span></li></ul>');
					
					messagesWrapper.append(messagesList);
					messagesList.append(messageItem);
					messageItem.append(messageContent);
					
				} else {
					alert(message);
				}
				
			};
			
			settings.display.success = function(data) {
				settings.console.log('settings.display.success');
				// Show success state in button, then reset after X seconds
				var button = $(settings.elements.addToCartButton);
				button.removeClass('btn-cart-adding').addClass('btn-cart-added').find('.btn-cart-state').text('Added');
				window.setTimeout(function(){
					settings.console.log('timeout');
					settings.display.resetButton();
				},4000);
			};
			
			settings.display.error = function(msg) {
				settings.console.log('settings.display.error');
				settings.display.message('error',msg);
				settings.display.resetButton();
			};
			
			settings.console.log = function(message) {
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
			
		}; // end jQuery.fn.ajaxAddToCart
		
	} // end if typeof jQuery !== 'undefined'
	
}(jQuery));