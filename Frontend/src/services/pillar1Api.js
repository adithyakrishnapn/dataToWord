import httpClient from './httpClient';

const PILLAR_BASE = '/pillar1';

export const pillar1Api = {
  createInnovativeTeaching: (formData) =>
    httpClient.post(`${PILLAR_BASE}/innovative-teaching`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createEContents: (payload) => httpClient.post(`${PILLAR_BASE}/e-contents`, payload),
  createGuestLecture: (formData) =>
    httpClient.post(`${PILLAR_BASE}/guest-lectures`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createFdpOrganized: (formData) =>
    httpClient.post(`${PILLAR_BASE}/fdps-organized`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createCourseFacilitatorSession: (formData) =>
    httpClient.post(`${PILLAR_BASE}/course-facilitator-sessions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createFacultyEvent: (formData) =>
    httpClient.post(`${PILLAR_BASE}/faculty-events`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createStudentEvent: (payload) => httpClient.post(`${PILLAR_BASE}/student-events`, payload),
  createNptelMooc: (formData) =>
    httpClient.post(`${PILLAR_BASE}/nptel-mooc`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createAcademicAchievement: (payload) =>
    httpClient.post(`${PILLAR_BASE}/academic-achievements`, payload),
  downloadReport: () =>
    httpClient.get(`${PILLAR_BASE}/generate-report`, { responseType: 'blob' }),
  listReportHistory: () =>
    httpClient.get(`${PILLAR_BASE}/report-history`),
  downloadReportByName: (fileName) =>
    httpClient.get(`${PILLAR_BASE}/report-history/${encodeURIComponent(fileName)}/download`, { responseType: 'blob' }),
  downloadAllReports: () =>
    httpClient.get(`${PILLAR_BASE}/report-history/download-all`, { responseType: 'blob' }),
};
