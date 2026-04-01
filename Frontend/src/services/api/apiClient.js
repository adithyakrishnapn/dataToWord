import { PILLAR1_API_BASE_URL } from '../../config/apiConfig';

const API_BASE_URL = PILLAR1_API_BASE_URL;

const apiClient = {
    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            // Handle file downloads
            if (options.isDownload) {
                return response;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `Error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },

    // Download template Excel
    async downloadTemplate() {
        try {
            const response = await fetch(`${API_BASE_URL}/template/download`);
            if (!response.ok) throw new Error('Failed to download template');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Pillar1_ImportTemplate.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download template error:', error);
            throw error;
        }
    },

    // Preview Excel upload
    async previewExcelImport(file) {
        const formData = new FormData();
        formData.append('excelFile', file);

        return this.request('/import/preview', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set headers for FormData
        });
    },

    // Bulk insert from Excel
    async bulkInsertFromExcel(file) {
        const formData = new FormData();
        formData.append('excelFile', file);

        return this.request('/import/bulk-insert', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set headers for FormData
        });
    },

    // Section 1: Innovative Teaching
    async addInnovativeTeaching(data, imageFile) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        if (imageFile) formData.append('image', imageFile);

        return this.request('/innovative-teaching', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },

    async getInnovativeTeaching() {
        return this.request('/innovative-teaching');
    },

    // Section 2: E-Contents
    async addEContent(data) {
        return this.request('/e-contents', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async getEContents() {
        return this.request('/e-contents');
    },

    // Section 3.1: Guest Lectures
    async addGuestLecture(data, imageFile) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        if (imageFile) formData.append('image', imageFile);

        return this.request('/guest-lectures', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },

    async getGuestLectures() {
        return this.request('/guest-lectures');
    },

    // Section 3.2: FDPs Organized
    async addFDPOrganized(data, imageFile) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        if (imageFile) formData.append('image', imageFile);

        return this.request('/fdps-organized', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },

    async getFDPsOrganized() {
        return this.request('/fdps-organized');
    },

    // Section 3.3: Course Facilitator Sessions
    async addCourseFacilitatorSession(data, imageFile) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        if (imageFile) formData.append('image', imageFile);

        return this.request('/course-facilitator-sessions', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },

    async getCourseFacilitatorSessions() {
        return this.request('/course-facilitator-sessions');
    },

    // Section 4: Faculty Events
    async addFacultyEvent(data, certificateFile) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        if (certificateFile) formData.append('certificate', certificateFile);

        return this.request('/faculty-events', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },

    async getFacultyEvents() {
        return this.request('/faculty-events');
    },

    // Section 5: Student Events
    async addStudentEvent(data) {
        return this.request('/student-events', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async getStudentEvents() {
        return this.request('/student-events');
    },

    // Section 6: NPTEL/MOOC
    async addNPTELMOOC(data, certificateFile) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        if (certificateFile) formData.append('certificate', certificateFile);

        return this.request('/nptel-mooc', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    },

    async getNPTELMOOC() {
        return this.request('/nptel-mooc');
    },

    // Section 7: Academic Achievements
    async addAcademicAchievement(data) {
        return this.request('/academic-achievements', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async getAcademicAchievements() {
        return this.request('/academic-achievements');
    },

    // Generate Report
    async generateReport(month, options = {}) {
        try {
            const params = new URLSearchParams();
            if (month) {
                params.set('month', month);
            }
            if (options.compatibility) {
                params.set('compatibility', options.compatibility);
            }

            const query = params.toString();
            const response = await fetch(`${API_BASE_URL}/generate-report${query ? `?${query}` : ''}`);
            if (!response.ok) throw new Error('Failed to generate report');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Annual_Report_${new Date().toISOString().split('T')[0]}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Generate report error:', error);
            throw error;
        }
    }
};

export default apiClient;
