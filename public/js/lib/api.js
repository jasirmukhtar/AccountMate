// Thin fetch wrapper: sends/receives JSON and throws on a non-2xx response.

async function apiRequest(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    cache: 'no-store',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty or non-JSON body
  }

  if (!res.ok) {
    const error = new Error(data?.message || data?.error || `HTTP error ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

// { page: 1, from: '' } -> "?page=1" (blank values dropped)
function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) query.set(key, value);
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

// Downloads a file response (e.g. a ZIP export) under the given name
async function downloadFile(url, fileName) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);

  const blobUrl = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}
