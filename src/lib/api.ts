import { supabase } from './supabase';
import { API_BASE } from './theme';

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) throw new Error('Not authenticated');
  return data.session.access_token;
}

async function request(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const b = await res.json(); msg = b.detail || b.message || msg; } catch {}
    throw new Error(msg);
  }
  return res;
}

export async function startScan(url: string, includeAi = true) {
  const res = await request('/api/scan', { method: 'POST', body: JSON.stringify({ url, include_ai: includeAi }) });
  return res.json();
}
export async function getScan(scanId: string) {
  return (await request(`/api/scan/${scanId}`)).json();
}
export async function listScans(limit = 20) {
  return (await request(`/api/scans?limit=${limit}`)).json();
}
export async function deleteScan(scanId: string) {
  return (await request(`/api/scan/${scanId}`, { method: 'DELETE' })).json();
}
export async function downloadPdf(scanId: string): Promise<string> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/scan/${scanId}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('PDF download failed');
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
export async function getMe() {
  return (await request('/api/me')).json();
}
export async function listSites() {
  return (await request('/api/monitoring/sites')).json();
}
export async function addSite(url: string, intervalHours = 24) {
  return (await request('/api/monitoring/sites', { method: 'POST', body: JSON.stringify({ url, interval_hours: intervalHours }) })).json();
}
export async function deleteSite(siteId: string) {
  return (await request(`/api/monitoring/sites/${siteId}`, { method: 'DELETE' })).json();
}
export async function listAlerts(limit = 50) {
  return (await request(`/api/monitoring/alerts?limit=${limit}`)).json();
}
export async function markAllAlertsRead() {
  return (await request('/api/monitoring/alerts/read-all', { method: 'POST' })).json();
}
export async function getBillingPlans() {
  return (await fetch(`${API_BASE}/api/billing/plans`)).json();
}
