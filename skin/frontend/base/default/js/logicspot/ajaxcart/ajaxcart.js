jQuery.fn.center = function (absolute) {
    return this.each(function () {
        var t = jQuery(this);
        t.css({
            position: absolute ? 'absolute' : 'fixed',
            left: '50%',
            top: '50%',
            zIndex: '1000'
        }).css({
            marginLeft: '-' + (t.outerWidth() / 2) + 'px',
            marginTop: '-' + (t.outerHeight() / 2) + 'px'
        });

        if (absolute) {
            t.css({
                marginTop: parseInt(t.css('marginTop'), 10) + jQuery(window).scrollTop(),
                marginLeft: parseInt(t.css('marginLeft'), 10) + jQuery(window).scrollLeft()
            });
        }
    });
};

jQuery(document).ready(function () {
    jQuery('.ajaxcart-element').center();
    if (jQuery('.btn-cart').size() > 0) {
        var onclickHolder = {}; //IE8 fix

        for (var i = 0; i < jQuery('.btn-cart').size(); i++) {
            onclickHolder[i] = jQuery(jQuery('.btn-cart')[i]).attr('onclick'); //IE8 fix
            jQuery('.btn-cart')[i].onclick = null;
        }

        jQuery('.btn-cart').click(function () {
            if (jQuery('#product_addtocart_form').size() > 0) {
                var params = jQuery('#product_addtocart_form').serialize();
                var appendix = '';
            } else {
                var params = '';
                var elIndex = jQuery.inArray(this, jQuery('.btn-cart'));
                //var targetHref = jQuery(this).attr("onclick");
                var targetHref = onclickHolder[elIndex]; //IE8 fix
                var appendix = targetHref.split("add/")[1].substring(0, targetHref.split("add/")[1].length - 3);
            }
            jQuery('.ajaxcart-element').center();
            jQuery('.ajaxcart-element').fadeIn();
            jQuery('.ajaxcart-overlay').fadeIn();
            jQuery('.ajaxcart-loader').show();
            jQuery('.ajaxcart-content').hide();

            jQuery.ajax({
                url: jQuery('.ajaxcart-url').val() + appendix,
                data: params,
                type: 'POST',
                datatype: 'json',
                complete: function (response) {
                    var json = jQuery.parseJSON(response.responseText);
                    if (json.error == false) {
                        jQuery('.ajaxcart-content-message').html(json.message);
                        jQuery('.ajaxcart-content-image').html(json.image);
                        jQuery('.ajaxcart-loader').hide();
                        jQuery('.ajaxcart-content').show();
                        var topLink = jQuery('.top-link-cart');
                        if (topLink.size() > 0) {
                            topLink.text(function (i, txt) {
                                return txt.replace(/\d+/, json.count);
                            });
                        }
                    } else {
                        location.reload();
                    }
                }
            });
        });
        jQuery('.ajaxcart-continue').click(function () {
            jQuery('.ajaxcart-element').fadeOut();
            jQuery('.ajaxcart-overlay').fadeOut();
        })
    }
});