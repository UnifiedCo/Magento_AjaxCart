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
					popup: null,
					inline: null,
					success: null,
					error: null,
					loaded: null,
					defaultAjaxMessage: 'There was an error while processing your request. Please try again later.'
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
				
				console.log('document.ready');
				
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
					var available = true;
					if (productData.productType === 'simple' || productData.productType === 'configurable' && settings.validation.validateSimpleChildren) {
						available = settings.validation.stockCheck(productData)
					}
					
					if (available) {
						console.log(productData);
						console.log('success!');
						settings.validation.success();
					}
					
				}
				
			};
			
			settings.validation.getProductConfiguration = function(button) {
				
				var data = JSON.parse($(button).closest('form').find('div[data-product]').attr('data-product'));
				var requiredProps = ['productId','productType','Qty'];
				
				// Check product data has required fields
				requiredProps.forEach(function(item){
					if (!data.hasOwnProperty(item)) {
						// If data is missing, call validation error
						settings.validation.error('missing product data: ' + item);
						data = false;
					}
				});
				
				// If configurable product, validate configurable data
				if (data.productType === 'configurable')
					data = settings.validation.checkConfigurableAttributes(data);
				
				return data;
				
			};
			
			settings.validation.checkConfigurableAttributes = function(productData) {
				
				if (!productData.configuration || !productData.products) {
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
				
				// Get the simple product object, which contains the qty
				try {
					var simpleProductId = productData.configuration.attributes[selectAttrId].options[selectAttrOption].products[0];
				} catch(err) {
					settings.validation.error(err);
					return false;
				}
				
				// Create new prop in the object with the selected product ID and qty
				productData.selectedProduct = simpleProductId;
				return productData;
				
			};
			
			settings.validation.stockCheck = function (productData) {
				
				var qtyInput = $(settings.elements.qty);
				var qtyInputVal = qtyInput.val();
				var stock = productData.productType === 'configurable' ? productData.products[productData.selectedProduct].Qty : productData.qty;
				var isValid = false;
				
				switch (true) {
					case (qtyInput.length < 1) :
						settings.validation.error('Missing qty input');
						break;
					case (!$.isNumeric(qtyInputVal)) :
						settings.validation.error('Qty NaN');
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
				console.log('ajaxcart.js: ' + error);
				settings.display.error();
			};
			
			settings.validation.success = function() {
				settings.ajax.init();
			};
			
			/*
			 AJAX
			 */
			
			settings.ajax.init = function() {
				console.log('settings.ajax.init');
				
				// Prepare the data
				var data = settings.ajax.data();
				// Make ajax call
				
				
				settings.ajax.request(data);
			};
			
			settings.ajax.data = function() {
				console.log('settings.ajax.data');
				
				//build request parameters
				var data = $('#product_addtocart_form').serialize();
				data += '&isAjax=1';
				
				return data;
			};
			
			settings.ajax.request = function(data) {
				console.log('settings.ajax.request');
				
				try {
					
					$.ajax({
						url: url,
						dataType: 'json',
						type : 'post',
						data: data,
						beforeSend: function() {
							settings.display.loading();
						},
						success: function(data){
							if (data.status == 'SUCCESS') {
								settings.ajax.success(data);
							} else if (data.status == 'ERROR') {
								settings.ajax.error(data.message);
							}
						},
						error: function(){
							settings.display.error(settings.display.defaultAjaxMessage);
						}
					});
				} catch (e) {
					
				}
				return this;
			};
			
			settings.ajax.success = function(data) {
				
				switch(settings.init.ajaxCartType) {
					case 1: //TYPE_MINICART
						settings.display.miniCart(data);
						break;
					case 2: //TYPE_INLINE
						settings.display.inline(data);
						break;
					case 3: //TYPE_POPUP
						settings.display.popup(data);
						break;
					default: //TYPE_INLINE
						settings.display.inline(data);
				}
				
				settings.display.success(data);
			};
			
			settings.ajax.error = function(data) {
				settings.display.error(data.replace(/<(?:.|\n)*?>/gm, ''));
			};
			
			/*
			 DISPLAY
			 */
			
			settings.display.loading = function() {
				// Add loading class to button etc.
				$("#addtocart-button").addClass('adding').prop('disabled',true);
			};
			
			settings.display.loaded = function() {
				// Remove loading class to button etc.
				$("#addtocart-button").removeClass('adding').prop('disabled',false);
			};
			
			settings.display.miniCart =  function(data) {
				
				// set the container
				jQuery(".desktop-basket-items").html(data.sidebar);
				
				jQuery('.cart-header').toggleClass('cart-header-open');
				
				window.setTimeout(function() {
					if (!jQuery('#-sidebar-cart').is(':hover')) {
						jQuery('.cart-header-anchor').toggleClass('cart-header-open');
					}
					basketDropdown(jQuery);
				}, 5000);
				
				settings.display.success();
			};
			
			settings.display.popup =  function() {
				
				settings.display.success();
			};
			
			settings.display.inline =  function() {
				
				settings.display.success();
			};
			
			settings.display.success = function(data) {
				// Add success class to button etc.
				settings.display.loaded();
			};
			
			settings.display.error = function() {
				// Add error class to button etc.
				settings.display.loaded();
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