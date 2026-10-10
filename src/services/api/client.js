/**
 * Central HTTP client for the SudaWork REST API.
 *
 * - Base URL from VITE_API_URL (e.g. http://localhost:3000/api/v1).
 * - Attaches the access token and transparently refreshes it once on 401.
 * - Unwraps the { success, data, message } envelope.
 * - Throws ApiError for every failure; callers never receive fake data.
 */
import { translateError } from './errors.js';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');
const API_ORIGIN = new URL(API_URL, window.location.origin).origin;

const ACCESS_KEY = 'sudawork_access_token';
const REFRESH_KEY = 'sudawork_refresh_token';

export class ApiError extends Error {
  constructor({ status = 0, code = 'NETWORK_ERROR', message, details = null }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isNetwork() { return this.status === 0; }
  get isAuth() { return this.status === 401; }
  get isForbidden() { return this.status === 403; }
  get isFeatureDisabled() { return this.code === 'FEATURE_DISABLED'; }
  get isNotFound() { return this.status === 404; }

  // Field-level validation messages keyed by field name.
  get fieldErrors() {
    if (!Array.isArray(this.details)) return {};
    return Object.fromEntries(this.details.filter((d) => d.field).map((d) => [d.field, d.message]));
  }
}

// ---------- token storage ----------
// "Remember me" keeps tokens in localStorage; otherwise they live in
// sessionStorage and end when the browser closes.
let remember = true;
const store = () => (remember ? window.localStorage : window.sessionStorage);
const read = (key) => {
  try { return window.localStorage.getItem(key) || window.sessionStorage.getItem(key); } catch { return null; }
};
const write = (key, value) => {
  try {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
    if (value) store().setItem(key, value);
  } catch { /* storage unavailable */ }
};

export const tokens = {
  get access() { return read(ACCESS_KEY); },
  get refresh() { return read(REFRESH_KEY); },
  setRemember(value) { remember = value !== false; },
  set({ accessToken, refreshToken }) {
    if (accessToken !== undefined) write(ACCESS_KEY, accessToken);
    if (refreshToken !== undefined) write(REFRESH_KEY, refreshToken);
  },
  clear() {
    write(ACCESS_KEY, null);
    write(REFRESH_KEY, null);
  },
};
// A refresh keeps the tokens wherever the original sign-in put them.
try { remember = !window.sessionStorage.getItem(ACCESS_KEY); } catch { /* ignore */ }

// AuthContext subscribes so an expired session logs the user out everywhere.
let onSessionExpired = () => {};
export const setSessionExpiredHandler = (fn) => { onSessionExpired = fn; };

// ---------- helpers ----------
const buildUrl = (path, query) => {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') url.searchParams.set(k, v);
    });
  }
  return url.toString();
};

// Turns relative upload URLs (/api/v1/uploads/..) into absolute ones.
export const resolveFileUrl = (url) => {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};

const toApiError = (status, body) => {
  const err = body?.error || {};
  return new ApiError({
    status,
    code: err.code || (status ? `HTTP_${status}` : 'NETWORK_ERROR'),
    message: translateError(err.code, err.message, status),
    details: err.details || null,
  });
};

let refreshPromise = null;

// Single-flight refresh: concurrent 401s share one refresh request.
const refreshSession = async () => {
  if (!tokens.refresh) return false;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(buildUrl('/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refresh }),
        });
        if (!res.ok) return false;
        const body = await res.json();
        tokens.set(body.data);
        return true;
      } catch {
        return false;
      } finally {
        setTimeout(() => { refreshPromise = null; }, 0);
      }
    })();
  }
  return refreshPromise;
};

/**
 * @param {string} path  e.g. '/projects'
 * @param {object} opts  { method, body, query, signal, auth=true, raw=false }
 */
export async function request(path, { method = 'GET', body, query, signal, auth = true, raw = false, _retry = false } = {}) {
  const headers = { Accept: 'application/json' };
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;

  let res;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: translateError('NETWORK_ERROR') });
  }

  if (res.status === 401 && auth && tokens.access && !_retry && path !== '/auth/refresh') {
    if (await refreshSession()) {
      return request(path, { method, body, query, signal, auth, raw, _retry: true });
    }
    tokens.clear();
    onSessionExpired();
  }

  if (raw && res.ok) return res;

  let payload = null;
  const text = await res.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = null; }
  }

  if (!res.ok || payload?.success === false) {
    throw toApiError(res.status, payload);
  }
  return payload ? payload.data : null;
}

export const get = (path, query, opts) => request(path, { ...opts, query });
export const post = (path, body, opts) => request(path, { ...opts, method: 'POST', body });
export const put = (path, body, opts) => request(path, { ...opts, method: 'PUT', body });
export const patch = (path, body, opts) => request(path, { ...opts, method: 'PATCH', body });
export const del = (path, opts) => request(path, { ...opts, method: 'DELETE' });

/**
 * Multipart upload with progress. Resolves with the upload record.
 * onProgress receives 0–100.
 */
export function uploadFile(file, { purpose = 'other', path = '/uploads', onProgress, signal } = {}) {
  const attempt = (retried) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', buildUrl(path));
    if (tokens.access) xhr.setRequestHeader('Authorization', `Bearer ${tokens.access}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = async () => {
      let payload;
      try { payload = JSON.parse(xhr.responseText); } catch { payload = null; }
      if (xhr.status === 401 && !retried && (await refreshSession())) {
        attempt(true).then(resolve, reject);
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && payload?.success) resolve(payload.data);
      else reject(toApiError(xhr.status, payload));
    };
    xhr.onerror = () => reject(new ApiError({ status: 0, code: 'NETWORK_ERROR', message: translateError('NETWORK_ERROR') }));
    xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'));
    if (signal) signal.addEventListener('abort', () => xhr.abort());

    const form = new FormData();
    form.append('purpose', purpose);
    form.append('file', file);
    xhr.send(form);
  });
  return attempt(false);
}

/**
 * Opens a private file (Bearer-protected) by downloading it as a blob.
 */
export async function openProtectedFile(url, fileName) {
  const res = await request(url.replace(/^.*\/api\/v1/, ''), { raw: true });
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.target = '_blank';
  a.rel = 'noopener';
  if (fileName && !blob.type.startsWith('image/') && blob.type !== 'application/pdf') a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

export { API_URL };
