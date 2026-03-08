import { ref } from "vue";

export function useBanHangTonKho(deps) {
  const { safeParse } = deps;

  const ctspBaseQtyMap = ref({});

  function baseQtyKey() {
    return "ss_pos_ctsp_base_qty_map";
  }

  function restoreCtspBaseQtyMap() {
    const raw = localStorage.getItem(baseQtyKey());
    const map = safeParse(raw || "{}", {});
    ctspBaseQtyMap.value = map && typeof map === "object" ? map : {};
  }

  function persistCtspBaseQtyMap() {
    try {
      localStorage.setItem(baseQtyKey(), JSON.stringify(ctspBaseQtyMap.value || {}));
    } catch (e) {}
  }

  // ✅ FIX: đồng bộ tồn theo API là nguồn sự thật (tránh tồn hiển thị bị “kẹt thấp” do MIN)
  function dongBoTonKhoTuApi(listCtsp) {
    const list = Array.isArray(listCtsp) ? listCtsp : [];
    const map = { ...(ctspBaseQtyMap.value || {}) };

    for (const x of list) {
      const id = x?.id;
      if (id == null) continue;

      const apiQty = Math.max(0, Number(x?.soLuong || 0));
      map[id] = apiQty;
    }

    ctspBaseQtyMap.value = map;
  }

  function capNhatTonLocal(ctspId, delta) {
    const id = Number(ctspId);
    if (!Number.isFinite(id)) return;

    const map = { ...(ctspBaseQtyMap.value || {}) };
    const cur = Math.max(0, Number(map[id] ?? 0));
    const d = Number(delta || 0);

    const next = Math.max(0, cur + d);
    map[id] = next;

    ctspBaseQtyMap.value = map;
    persistCtspBaseQtyMap();
  }

  function getBaseQtyByCtspId(ctspId) {
    const id = Number(ctspId);
    const base = Number(ctspBaseQtyMap.value?.[id] ?? 0);
    return Number.isFinite(base) && base >= 0 ? base : 0;
  }

  function getAvailableQtyByCtspId(ctspId) {
    return getBaseQtyByCtspId(ctspId);
  }

  function xoaTonKhoLocal() {
    try {
      localStorage.removeItem(baseQtyKey());
    } catch (e) {}
    ctspBaseQtyMap.value = {};
  }

  return {
    ctspBaseQtyMap,

    baseQtyKey,
    restoreCtspBaseQtyMap,
    persistCtspBaseQtyMap,

    dongBoTonKhoTuApi,
    capNhatTonLocal,

    getBaseQtyByCtspId,
    getAvailableQtyByCtspId,

    xoaTonKhoLocal,
  };
}