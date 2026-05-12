import { createApiClient } from '@coachos/ui';

// Staff portal API client — redirects to /login on auth failure
const api = createApiClient({ baseURL: '/api/v1', loginPath: '/login' });
export default api;
