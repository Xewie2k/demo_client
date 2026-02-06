// File: src/services/vnAddressService.js
// Dùng API phổ biến: https://provinces.open-api.vn
// Trả về list chuẩn: [{code, name}]
// Có cache để tránh gọi lại nhiều.

const BASE = "https://provinces.open-api.vn/api";

const cache = {
  provinces: null,
  districtsByProvince: new Map(),
  wardsByDistrict: new Map(),
};

const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const mapLite = (arr) =>
  (arr || []).map((x) => ({
    code: x.code,
    name: x.name,
  }));

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Không tải được dữ liệu địa giới: ${res.status}`);
  return await res.json();
}

const vnAddressService = {
  async getProvinces() {
    if (cache.provinces) return cache.provinces;

    // /p/ trả danh sách tỉnh/thành
    const data = await fetchJson(`${BASE}/p/`);
    cache.provinces = mapLite(unwrapList(data));
    return cache.provinces;
  },

  async getDistricts(provinceCode) {
    if (!provinceCode) return [];
    if (cache.districtsByProvince.has(provinceCode)) {
      return cache.districtsByProvince.get(provinceCode);
    }

    // depth=2 để lấy districts
    const data = await fetchJson(`${BASE}/p/${provinceCode}?depth=2`);
    const districts = mapLite(data?.districts || []);
    cache.districtsByProvince.set(provinceCode, districts);
    return districts;
  },

  async getWards(districtCode) {
    if (!districtCode) return [];
    if (cache.wardsByDistrict.has(districtCode)) {
      return cache.wardsByDistrict.get(districtCode);
    }

    // depth=2 để lấy wards
    const data = await fetchJson(`${BASE}/d/${districtCode}?depth=2`);
    const wards = mapLite(data?.wards || []);
    cache.wardsByDistrict.set(districtCode, wards);
    return wards;
  },

  buildAddressText({ detail, wardName, districtName, provinceName }) {
    const parts = [detail, wardName, districtName, provinceName]
      .map((x) => (x ?? "").toString().trim())
      .filter(Boolean);
    return parts.join(", ");
  },
};

export default vnAddressService;
