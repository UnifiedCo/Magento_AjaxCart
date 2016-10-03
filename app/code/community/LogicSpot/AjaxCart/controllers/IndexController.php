<?php require_once Mage::getBaseDir() . '/app/code/core/Mage/Checkout/controllers/CartController.php';

class LogicSpot_AjaxCart_IndexController extends Mage_Checkout_CartController {

	public function addAction() {

		$cart = $this->_getCart();
        $params = $this->getRequest()->getParams();
        $response = array(
        	"ajaxcart" => true,
            "error" => false,
            "message" => '',
            "messages" => array(),
            "image" => '',
            "count" => $cart->getItemsQty(),
	        "notifications" => ''
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
	            $response['messages'][] = $this->__('Unable to find Product ID');
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
	            $this->_getSession()->addSuccess($this->__('%s was added to your shopping cart.', Mage::helper('core')->escapeHtml($product->getName())));
	            $response['messages'][] = $this->__('%s was added to your shopping cart.', Mage::helper('core')->escapeHtml($product->getName()));
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

        	$this->_getSession()->addNotice(Mage::helper('core')->escapeHtml($e->getMessage()));
	        $response['messages'][] = Mage::helper('core')->escapeHtml($e->getMessage());
	        $response['error'] = true;
        } catch (Exception $e) {

	        if (Mage::helper('ajaxcart')->isInlineNotificationsEnabled()) {

		        $response['messages'][] = $this->__('Cannot add the item to shopping cart.');
			    $this->_getSession()->addException($e, $this->__('Cannot add the item to shopping cart.'));
		        Mage::logException($e);
		        $response['error'] = true;
	        }
        }

		$sessionMessages = Mage::getSingleton('checkout/session')->getMessages(true);

		$block = $this->getLayout()->getMessagesBlock();
		$block->addMessages($sessionMessages);

		$response['message'] = $block->getMessagesBlock()->toHtml();

		if (Mage::helper('ajaxcart')->isInlineNotificationsEnabled()) {

			$response['notifications'] = $block->getMessagesBlock()->toHtml();
		}

        $this->_reply($response);
    }

    protected function _reply($responseArray) {
        $jsonResponse = Mage::helper('core')->jsonEncode($responseArray);
        $this->getResponse()->setBody($jsonResponse);
    }
}