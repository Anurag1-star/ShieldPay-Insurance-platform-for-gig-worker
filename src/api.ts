/**
 * Centralized API configuration for ShieldPay
 * In production (Vercel/Render), we use relative paths if hosted on the same domain,
 * or the VITE_API_URL environment variable.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  ME: `${API_BASE_URL}/api/me`,
  PLANS: `${API_BASE_URL}/api/plans`,
  USERS: `${API_BASE_URL}/api/users`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,
  USER_PLAN: `${API_BASE_URL}/api/users/me/plan`,
  PUBLIC_STATS: `${API_BASE_URL}/api/public/stats`,
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
  PLAN_BY_ID: (id: string) => `${API_BASE_URL}/api/plans/${id}`,
};

export default API_BASE_URL;
