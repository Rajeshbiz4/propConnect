const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: (token) => `/reset-password/${token}`,

  app: '/app',
  dashboard: '/app',
  properties: '/app/properties',
  newProperty: '/app/properties/new',
  editProperty: (id) => `/app/properties/${id}/edit`,
  enquiries: '/app/enquiries',
  profile: '/app/profile',

  admin: '/admin',
  adminAgents: '/admin/agents',
  adminProperties: '/admin/properties',

  publicAgent: (slug) => `/agent/${slug}`,
  publicProperty: (slug, id) => `/agent/${slug}/property/${id}`,
};

export function appAbsoluteUrl(pathname) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${window.location.origin}${base}${path}`;
}

export const routerBasename = base || '/';
