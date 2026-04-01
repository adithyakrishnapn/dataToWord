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
  downloadReport: (month) =>
    httpClient.get(`${PILLAR_BASE}/generate-report`, {
      responseType: 'blob',
      params: month ? { month } : undefined,
    }),
  getMonthlySummary: (month) =>
    httpClient.get(`${PILLAR_BASE}/summary-report`, {
      params: {
        ...(month ? { month } : {}),
        provider: 'local',
      },
      timeout: 120000,
    }),
  downloadMonthlySummary: (month) =>
    httpClient.get(`${PILLAR_BASE}/summary-report/download`, {
      responseType: 'blob',
      params: {
        ...(month ? { month } : {}),
        provider: 'local',
      },
      timeout: 120000,
    }),
  listReportHistory: () =>
    httpClient.get(`${PILLAR_BASE}/report-history`),
  deleteReportByName: (fileName) =>
    httpClient.delete(`${PILLAR_BASE}/report-history/${encodeURIComponent(fileName)}`),
  downloadReportByName: (fileName) =>
    httpClient.get(`${PILLAR_BASE}/report-history/${encodeURIComponent(fileName)}/download`, { responseType: 'blob' }),
  downloadAllReports: () =>
    httpClient.get(`${PILLAR_BASE}/report-history/download-all`, { responseType: 'blob' }),

  // GET methods for fetching records
  getInnovativeTeachingRecords: (month) =>
    httpClient.get(`${PILLAR_BASE}/innovative-teaching`, { params: month ? { month } : undefined }),
  getEContentsRecords: (month) =>
    httpClient.get(`${PILLAR_BASE}/e-contents`, { params: month ? { month } : undefined }),
  getGuestLectureRecords: (month) =>
    httpClient.get(`${PILLAR_BASE}/guest-lectures`, { params: month ? { month } : undefined }),
  getFdpOrganizedRecords: (month) =>
    httpClient.get(`${PILLAR_BASE}/fdps-organized`, { params: month ? { month } : undefined }),
  getCourseFacilitatorRecords: (month) =>
    httpClient.get(`${PILLAR_BASE}/course-facilitator-sessions`, { params: month ? { month } : undefined }),
  getFacultyEventRecords: (month) =>
    httpClient.get(`${PILLAR_BASE}/faculty-events`, { params: month ? { month } : undefined }),
  getStudentEventRecords: (month) =>
    httpClient.get(`${PILLAR_BASE}/student-events`, { params: month ? { month } : undefined }),
  getNptelMoocRecords: (month) =>
    httpClient.get(`${PILLAR_BASE}/nptel-mooc`, { params: month ? { month } : undefined }),
  getAcademicAchievementRecords: (month) =>
    httpClient.get(`${PILLAR_BASE}/academic-achievements`, { params: month ? { month } : undefined }),

  // PUT methods for updating records
  updateInnovativeTeaching: (id, formData) =>
    httpClient.put(`${PILLAR_BASE}/innovative-teaching/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateEContents: (id, payload) =>
    httpClient.put(`${PILLAR_BASE}/e-contents/${id}`, payload),
  updateGuestLecture: (id, formData) =>
    httpClient.put(`${PILLAR_BASE}/guest-lectures/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateFdpOrganized: (id, formData) =>
    httpClient.put(`${PILLAR_BASE}/fdps-organized/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateCourseFacilitatorSession: (id, formData) =>
    httpClient.put(`${PILLAR_BASE}/course-facilitator-sessions/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateFacultyEvent: (id, formData) =>
    httpClient.put(`${PILLAR_BASE}/faculty-events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStudentEvent: (id, payload) =>
    httpClient.put(`${PILLAR_BASE}/student-events/${id}`, payload),
  updateNptelMooc: (id, formData) =>
    httpClient.put(`${PILLAR_BASE}/nptel-mooc/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateAcademicAchievement: (id, payload) =>
    httpClient.put(`${PILLAR_BASE}/academic-achievements/${id}`, payload),

  // DELETE methods for removing records
  deleteInnovativeTeaching: (id) =>
    httpClient.delete(`${PILLAR_BASE}/innovative-teaching/${id}`),
  deleteEContents: (id) =>
    httpClient.delete(`${PILLAR_BASE}/e-contents/${id}`),
  deleteGuestLecture: (id) =>
    httpClient.delete(`${PILLAR_BASE}/guest-lectures/${id}`),
  deleteFdpOrganized: (id) =>
    httpClient.delete(`${PILLAR_BASE}/fdps-organized/${id}`),
  deleteCourseFacilitatorSession: (id) =>
    httpClient.delete(`${PILLAR_BASE}/course-facilitator-sessions/${id}`),
  deleteFacultyEvent: (id) =>
    httpClient.delete(`${PILLAR_BASE}/faculty-events/${id}`),
  deleteStudentEvent: (id) =>
    httpClient.delete(`${PILLAR_BASE}/student-events/${id}`),
  deleteNptelMooc: (id) =>
    httpClient.delete(`${PILLAR_BASE}/nptel-mooc/${id}`),
  deleteAcademicAchievement: (id) =>
    httpClient.delete(`${PILLAR_BASE}/academic-achievements/${id}`),
};
