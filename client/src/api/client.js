import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://prop-connect-two.vercel.app/api';
export const http = axios.create({ baseURL: API_URL });

const TOKEN_KEY = 'property_portal_token';
const USER_KEY = 'property_portal_user';

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event('property-portal:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export function errorMessage(error) {
  return error.response?.data?.message || error.message || 'Something went wrong';
}
