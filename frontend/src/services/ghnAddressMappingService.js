/**
 * GHN Address Mapping Service
 * 
 * Handles mapping between Vietnam standard addresses (from vnAddressService)
 * and GHN-specific address codes (ProvinceID, DistrictID, WardCode).
 * 
 * This ensures consistent address handling across the application while
 * providing proper GHN codes for shipping fee calculations.
 */

import apiClient from './apiClient';

const cache = {
  ghnProvinces: null,
  ghnDistrictsByProvince: new Map(),
  ghnWardsByDistrict: new Map(),
  mappingByName: new Map(), // {vnName => ghnCode}
};

const ghnAddressMappingService = {
  /**
   * Get all GHN provinces with caching
   */
  async getGhnProvinces() {
    if (cache.ghnProvinces) return cache.ghnProvinces;

    try {
      const res = await apiClient.get('/api/client/ghn/tinh-thanh');
      cache.ghnProvinces = (res.data || []).map(p => ({
        code: p.provinceId,
        name: p.provinceName,
        ghnId: p.provinceId,
        ghnName: p.provinceName,
      }));
      return cache.ghnProvinces;
    } catch (e) {
      console.error('Error loading GHN provinces:', e);
      return [];
    }
  },

  /**
   * Get GHN districts by province code with caching
   */
  async getGhnDistricts(provinceCode) {
    if (!provinceCode) return [];
    if (cache.ghnDistrictsByProvince.has(provinceCode)) {
      return cache.ghnDistrictsByProvince.get(provinceCode);
    }

    try {
      const res = await apiClient.get(`/api/client/ghn/quan-huyen/${provinceCode}`);
      const districts = (res.data || []).map(d => ({
        code: d.districtId,
        name: d.districtName,
        ghnId: d.districtId,
        ghnName: d.districtName,
        provinceId: d.provinceId,
      }));
      cache.ghnDistrictsByProvince.set(provinceCode, districts);
      return districts;
    } catch (e) {
      console.error(`Error loading GHN districts for province ${provinceCode}:`, e);
      return [];
    }
  },

  /**
   * Get GHN wards by district code with caching
   */
  async getGhnWards(districtCode) {
    if (!districtCode) return [];
    if (cache.ghnWardsByDistrict.has(districtCode)) {
      return cache.ghnWardsByDistrict.get(districtCode);
    }

    try {
      const res = await apiClient.get(`/api/client/ghn/phuong-xa/${districtCode}`);
      const wards = (res.data || []).map(w => ({
        code: w.wardCode,
        name: w.wardName,
        ghnCode: w.wardCode,
        ghnName: w.wardName,
        districtId: w.districtId,
      }));
      cache.ghnWardsByDistrict.set(districtCode, wards);
      return wards;
    } catch (e) {
      console.error(`Error loading GHN wards for district ${districtCode}:`, e);
      return [];
    }
  },

  /**
   * Find GHN province code by name (with fuzzy matching)
   * Handles both "Hà Nội" and "Thành phố Hà Nội" formats
   */
  async findGhnProvinceByName(provinceName) {
    if (!provinceName) return null;

    const ghnProvinces = await this.getGhnProvinces();
    const normalized = this._normalizeName(provinceName);

    // Exact match first
    for (const p of ghnProvinces) {
      if (this._normalizeName(p.ghnName) === normalized) {
        return p;
      }
    }

    // Partial match (for handling "Thành phố Hà Nội" vs "Hà Nội")
    for (const p of ghnProvinces) {
      if (p.ghnName.toLowerCase().includes(normalized) || 
          normalized.includes(p.ghnName.toLowerCase())) {
        return p;
      }
    }

    return null;
  },

  /**
   * Find GHN district code by name within a province
   */
  async findGhnDistrictByName(provinceCode, districtName) {
    if (!provinceCode || !districtName) return null;

    const ghnDistricts = await this.getGhnDistricts(provinceCode);
    const normalized = this._normalizeName(districtName);

    // Exact match first
    for (const d of ghnDistricts) {
      if (this._normalizeName(d.ghnName) === normalized) {
        return d;
      }
    }

    // Partial match
    for (const d of ghnDistricts) {
      if (d.ghnName.toLowerCase().includes(normalized) || 
          normalized.includes(d.ghnName.toLowerCase())) {
        return d;
      }
    }

    return null;
  },

  /**
   * Find GHN ward code by name within a district
   */
  async findGhnWardByName(districtCode, wardName) {
    if (!districtCode || !wardName) return null;

    const ghnWards = await this.getGhnWards(districtCode);
    const normalized = this._normalizeName(wardName);

    // Exact match first
    for (const w of ghnWards) {
      if (this._normalizeName(w.ghnName) === normalized) {
        return w;
      }
    }

    // Partial match
    for (const w of ghnWards) {
      if (w.ghnName.toLowerCase().includes(normalized) || 
          normalized.includes(w.ghnName.toLowerCase())) {
        return w;
      }
    }

    return null;
  },

  /**
   * Map Vietnam standard address (name-based) to GHN codes
   * Returns { provinceId, districtId, wardCode } for GHN API
   */
  async mapVnAddressToGhn(provinceName, districtName, wardName) {
    try {
      const province = await this.findGhnProvinceByName(provinceName);
      if (!province) return null;

      const district = await this.findGhnDistrictByName(province.code, districtName);
      if (!district) return null;

      const ward = await this.findGhnWardByName(district.code, wardName);
      if (!ward) return null;

      return {
        provinceId: province.code,
        districtId: district.code,
        wardCode: ward.code,
      };
    } catch (e) {
      console.error('Error mapping address to GHN:', e);
      return null;
    }
  },

  /**
   * Calculate shipping fee from GHN using proper address codes
   */
  async calculateShippingFee(toDistrictId, toWardCode, itemValue = 0) {
    if (!toDistrictId || !toWardCode) {
      throw new Error('Missing district or ward code for shipping calculation');
    }

    try {
      const res = await apiClient.post('/api/client/ghn/tinh-phi-van-chuyen', {
        toDistrictId: Number(toDistrictId),
        toWardCode: String(toWardCode),
        tongGiaTriHang: Math.round(Number(itemValue || 0)),
      });

      return {
        total: Number(res.data?.total ?? res.data?.phiVanChuyen ?? 0),
        serviceFee: Number(res.data?.serviceFee ?? 0),
        insuranceFee: Number(res.data?.insuranceFee ?? 0),
      };
    } catch (e) {
      console.error('Error calculating shipping fee:', e);
      throw e;
    }
  },

  /**
   * Normalize address name for comparison
   * Removes prefixes like "Tỉnh", "Thành phố", "Quận", "Huyện", etc.
   */
  _normalizeName(name) {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/^(tỉnh|thành phố|quận|huyện|thị xã|thị trấn|xã|phường)\s+/i, '')
      .trim();
  },

  /**
   * Clear cache (useful for testing or forcing refresh)
   */
  clearCache() {
    cache.ghnProvinces = null;
    cache.ghnDistrictsByProvince.clear();
    cache.ghnWardsByDistrict.clear();
  },
};

export default ghnAddressMappingService;
