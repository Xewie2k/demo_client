/**
 * GHN Shipping Fee Calculator
 * 
 * Enhanced utility for calculating GHN shipping fees with proper address validation.
 * This service combines vnAddressService (standard Vietnam addresses) with
 * ghnAddressMappingService (GHN-specific codes) for seamless shipping fee calculation.
 */

import ghnAddressMappingService from './ghnAddressMappingService';

const ghnShippingCalculator = {
  /**
   * Calculate shipping fee with full validation
   * 
   * @param {string} provinceName - Province name (from standard Vietnam address)
   * @param {string} districtName - District name (from standard Vietnam address)
   * @param {string} wardName - Ward name (from standard Vietnam address)
   * @param {number} itemValue - Total value of items for insurance calculation
   * @param {boolean} validateOnly - If true, only validate without calculating fee
   * 
   * @returns {Promise<{
   *   success: boolean,
   *   fee: number,
   *   details: {total, serviceFee, insuranceFee},
   *   ghnCodes: {provinceId, districtId, wardCode},
   *   error: string | null
   * }>}
   */
  async calculateFeeWithValidation(provinceName, districtName, wardName, itemValue = 0, validateOnly = false) {
    try {
      // Step 1: Validate and map address to GHN codes
      const ghnCodes = await ghnAddressMappingService.mapVnAddressToGhn(
        provinceName,
        districtName,
        wardName
      );

      if (!ghnCodes) {
        return {
          success: false,
          fee: 0,
          details: null,
          ghnCodes: null,
          error: 'Không thể ánh xạ địa chỉ. Vui lòng kiểm tra tỉnh/quận/xã.'
        };
      }

      // If only validating, return here
      if (validateOnly) {
        return {
          success: true,
          fee: 0,
          details: null,
          ghnCodes: ghnCodes,
          error: null
        };
      }

      // Step 2: Calculate shipping fee
      const feeData = await ghnAddressMappingService.calculateShippingFee(
        ghnCodes.districtId,
        ghnCodes.wardCode,
        itemValue
      );

      return {
        success: true,
        fee: feeData.total,
        details: feeData,
        ghnCodes: ghnCodes,
        error: null
      };

    } catch (error) {
      console.error('Error calculating shipping fee:', error);
      return {
        success: false,
        fee: 0,
        details: null,
        ghnCodes: null,
        error: error.message || 'Lỗi tính phí vận chuyển. Vui lòng thử lại.'
      };
    }
  },

  /**
   * Batch validate multiple addresses
   * Useful for checking if customer addresses are supported by GHN
   */
  async validateAddresses(addressList) {
    const results = await Promise.all(
      addressList.map(async (addr) => ({
        ...addr,
        validation: await this.calculateFeeWithValidation(
          addr.provinceName,
          addr.districtName,
          addr.wardName,
          0,
          true // validateOnly
        )
      }))
    );
    return results;
  },

  /**
   * Get shipping fee breakdown for display
   */
  async getShippingFeeBreakdown(provinceName, districtName, wardName, itemValue = 0) {
    const result = await this.calculateFeeWithValidation(
      provinceName,
      districtName,
      wardName,
      itemValue,
      false
    );

    if (!result.success) {
      return null;
    }

    const { details } = result;
    return {
      serviceFee: this._formatVND(details.serviceFee),
      insuranceFee: this._formatVND(details.insuranceFee),
      totalFee: this._formatVND(details.total),
      serviceFeeRaw: details.serviceFee,
      insuranceFeeRaw: details.insuranceFee,
      totalFeeRaw: details.total
    };
  },

  /**
   * Format number as VND currency
   */
  _formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },

  /**
   * Clear cached data (useful when GHN updates their address lists)
   */
  clearCache() {
    ghnAddressMappingService.clearCache();
  }
};

export default ghnShippingCalculator;
