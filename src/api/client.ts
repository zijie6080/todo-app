const API_BASE = 'https://superagent-53a820bc.base44.app/functions';

export async function callApi(fnName: string, body: object) {
  const res = await fetch(`${API_BASE}/${fnName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}
