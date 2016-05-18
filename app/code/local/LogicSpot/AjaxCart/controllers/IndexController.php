<?php require_once Mage::getBaseDir() . '/app/code/core/Mage/Checkout/controllers/CartController.php';

class LogicSpot_AjaxCart_IndexController extends Mage_Checkout_CartController {
    public function addAction() {
        $cart = $this->_getCart();
        $params = $this->getRequest()->getParams();
        $response = array(
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
            }

            $response['count'] = $cart->getItemsQty();
            $response['image'] = "<img src='" . $product->getSmallImageUrl() . "' alt='" . $product->getName . "' />";

        } catch (Mage_Core_Exception $e) {
            if ($this->_getSession()->getUseNotice(true)) {
                $this->_getSession()->addNotice(Mage::helper('core')->escapeHtml($e->getMessage()));
            }
            else {
                $messages = array_unique(explode("\n", $e->getMessage()));
                foreach ($messages as $message) {
                    $this->_getSession()->addError(Mage::helper('core')->escapeHtml($message));
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