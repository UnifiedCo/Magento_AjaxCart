<?php
class LogicSpot_AjaxCart_Model_System_Config_Source_Type
{

    /**
     * Options getter
     *
     * @return array
     */
    public function toOptionArray() {
        return array(
            array('value' => 1, 'label'=>Mage::helper('ajaxcart')->__('Minicart')),
            array('value' => 2, 'label'=>Mage::helper('ajaxcart')->__('Inline')),
            array('value' => 3, 'label'=>Mage::helper('ajaxcart')->__('Popup'))
        );
    }

}
