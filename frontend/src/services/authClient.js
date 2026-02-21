import { ref, computed } from 'vue';
import apiClient from './apiClient';

const STORAGE_KEY = 'ss_customer';

// Shared reactive state (singleton across all components)
const customer = ref(loadFromStorage());

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useClientAuth() {
  const isLoggedIn = computed(() => !!customer.value);

  async function login(username, password) {
    const res = await apiClient.post('/api/auth/client/login', { username, password });
    customer.value = res.data;
    saveToStorage(res.data);
    return res.data;
  }

  async function register(data) {
    const res = await apiClient.post('/api/auth/client/register', data);
    customer.value = res.data;
    saveToStorage(res.data);
    return res.data;
  }

  function logout() {
    customer.value = null;
    saveToStorage(null);
  }

  function updateProfile(data) {
    // Merge updated fields into current customer state
    if (customer.value && data) {
      customer.value = { ...customer.value, ...data };
      saveToStorage(customer.value);
    }
  }

  return {
    customer,
    isLoggedIn,
    login,
    register,
    logout,
    updateProfile,
  };
}
