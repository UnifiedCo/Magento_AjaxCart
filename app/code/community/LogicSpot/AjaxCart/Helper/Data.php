<?php

class LogicSpot_AjaxCart_Helper_Data extends Mage_Core_Helper_Abstract
{
    const XML_PATH_ENABLE                   = 'logicspot_ajaxcart/ajaxcart/enable';
    const XML_SIMPLE_PRODUCT_DATA_ENABLE    = 'logicspot_ajaxcart/ajaxcart/enable_simple_product_data';
    const XML_PATH_TYPE                     = 'logicspot_ajaxcart/ajaxcart/type';
    const XML_PATH_INLINE_NOTIFICATIONS     = 'logicspot_ajaxcart/ajaxcart/inline_notifications';

    const TYPE_MINICART = 1;
    const TYPE_INLINE   = 2;
    const TYPE_POPUP    = 3;

    /**
     * Determine if module is enabled.
     *
     * @return bool
     */
    public function isModuleEnabled($moduleName = null) {
        return parent::isModuleEnabled($moduleName) && Mage::getStoreConfigFlag(self::XML_PATH_ENABLE);
    }

	/**
	 * Determine if Simple Product Data is enabled.
	 *
	 * @return bool
	 */
	public function isSimpleProductDataEnabled() {
		return Mage::getStoreConfigFlag(self::XML_SIMPLE_PRODUCT_DATA_ENABLE);
	}

    public function getAllowedTypes() {
        return array(
            self::TYPE_MINICART => 'minicart',
            self::TYPE_INLINE   => 'inline',
            self::TYPE_POPUP    => 'popup',
        );
    }

    public function getType() {
        return Mage::getStoreConfig(self::XML_PATH_TYPE);
    }

    public function isInlineNotificationsEnabled() {
        return Mage::getStoreConfigFlag(self::XML_PATH_INLINE_NOTIFICATIONS);
    }
}