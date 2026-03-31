import httpClient from './httpClient';

export const pillarGenericApi = {
  createRecord: (pillarNumber, payload) =>
    httpClient.post(`/pillar${pillarNumber}/records`, payload, payload instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined),

  listRecordsBySection: (pillarNumber, sectionKey, month) =>
    httpClient.get(`/pillar${pillarNumber}/records/${encodeURIComponent(sectionKey)}`, {
      params: month ? { month } : undefined,
    }),

  updateRecord: (pillarNumber, id, payload) =>
    httpClient.put(`/pillar${pillarNumber}/records/${id}`, payload, payload instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined),

  deleteRecord: (pillarNumber, id) =>
    httpClient.delete(`/pillar${pillarNumber}/records/${id}`),
};
