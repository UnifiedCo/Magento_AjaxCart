<?php require_once Mage::getBaseDir() . '/app/code/core/Mage/Checkout/controllers/CartController.php';

class LogicSpot_AjaxCart_IndexController extends Mage_Checkout_CartController {

	public function addAction() {

		$cart = $this->_getCart();
        $params = $this->getRequest()->getParams();
        $response = array(
        	"ajaxcart" => true,
            "error" => false,
            "message" => '',
            "image" => '',
            "count" => $cart->getItemsQty()
        );

        try {

        	if (isset($params['qty'])) {
                $filter = new Zend_Filter_LocalizedToNormalized(
                    array('locale' => Mage::app()->getLocale()->getLocaleCode())
                );
                $params['qty'] = $filter->filter($params['qty']);
            }

            $product = $this->_initProduct();
            $related = $this->getRequest()->getParam('related_product');

            /**
             * Check product availability
             */
            if (!$product) {
                $response['error'] = true;
	            $response['message'] = $this->__('Unable to find Product ID');
                $this->_reply($response);
                return;
            }

            $cart->addProduct($product, $params);
            if (!empty($related)) {
                $cart->addProductsByIds(explode(',', $related));
            }

            $cart->save();

            $this->_getSession()->setCartWasUpdated(true);

            Mage::dispatchEvent('checkout_cart_add_product_complete',
                array('product' => $product, 'request' => $this->getRequest(), 'response' => $this->getResponse())
            );

            if (!$cart->getQuote()->getHasError()) {
                $response['message'] = $this->__('%s was added to your shopping cart.', Mage::helper('core')->escapeHtml($product->getName()));
	            $response['qty'] = $params['qty'];

	            if (Mage::helper('ajaxcart')->getType() == LogicSpot_AjaxCart_Helper_Data::TYPE_MINICART) {

		            $this->loadLayout();
		            $sidebar_block = $this->getLayout()->getBlock('cart_sidebar');
		            Mage::register('referrer_url', $this->_getRefererUrl());
		            $sidebar = $sidebar_block->toHtml();
		            $response['sidebar'] = $sidebar;
	            }
            }

        } catch (Mage_Core_Exception $e) {
            if ($this->_getSession()->getUseNotice(true)) {
            	$message = Mage::helper('core')->escapeHtml($e->getMessage());
                $this->_getSession()->addNotice($message);
	            $response['message'] = $message;
            }
            else {
                $messages = array_unique(explode("\n", $e->getMessage()));
                foreach ($messages as $message) {
	            	$message = Mage::helper('core')->escapeHtml($message);
                    $this->_getSession()->addError($message);
	                $response['message'] .= $message;
                }
            }

            $response['error'] = true;
        } catch (Exception $e) {
            $this->_getSession()->addException($e, $this->__('Cannot add the item to shopping cart.'));
            Mage::logException($e);
            $response['error'] = true;
        }

        $this->_reply($response);
    }

    protected function _reply($responseArray) {
        $jsonResponse = Mage::helper('core')->jsonEncode($responseArray);
        $this->getResponse()->setBody($jsonResponse);
    }
}