import apiClient from '../api/apiClient.js';

const excelService = {
    // Download empty template
    async downloadTemplate() {
        try {
            await apiClient.downloadTemplate();
            return { success: true, message: 'Template downloaded successfully' };
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Failed to download template'
            };
        }
    },

    // Validate file is Excel format
    isValidExcelFile(file) {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const validExtensions = ['.xlsx', '.xls'];

        const isValidType = validTypes.includes(file.type);
        const isValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        return isValidType || isValidExtension;
    },

    // File size validation (max 5MB)
    isValidFileSize(file, maxSizeMB = 5) {
        const maxBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxBytes;
    },

    // Parse and preview Excel
    async parseAndPreviewExcel(file) {
        try {
            // Validate file
            if (!this.isValidExcelFile(file)) {
                return {
                    success: false,
                    error: 'Invalid file format. Please upload .xlsx or .xls file'
                };
            }

            if (!this.isValidFileSize(file)) {
                return {
                    success: false,
                    error: 'File size exceeds 5MB'
                };
            }

            // Preview
            const response = await apiClient.previewExcelImport(file);

            return {
                success: response.success,
                errors: response.errors || [],
                summary: response.data || {},
                preview: response.preview || {},
                hasErrors: response.errors && response.errors.length > 0
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to parse Excel: ${error.message}`
            };
        }
    },

    // Bulk insert from Excel
    async bulkInsertFromExcel(file) {
        try {
            if (!this.isValidExcelFile(file)) {
                return {
                    success: false,
                    error: 'Invalid file format'
                };
            }

            if (!this.isValidFileSize(file)) {
                return {
                    success: false,
                    error: 'File size exceeds 5MB'
                };
            }

            const response = await apiClient.bulkInsertFromExcel(file);

            return {
                success: response.success,
                message: response.message,
                results: response.results || {},
                errors: response.errors || []
            };
        } catch (error) {
            return {
                success: false,
                error: `Bulk insert failed: ${error.message}`
            };
        }
    },

    // Format data for display in preview
    formatPreviewData(preview) {
        return {
            section1: this.formatTablePreview(preview.innovativeTeaching, [
                'Department', 'Course Code', 'Course Name', 'Topic', 'Teaching Method'
            ]),
            section2: this.formatTablePreview(preview.eContents, [
                'Branch', 'YouTube Video Count', 'Other E-Contents Title'
            ]),
            section3Guest: this.formatTablePreview(preview.guestLectures, [
                'Department', 'Workshop Title', 'Guest Name', 'Date (YYYY-MM-DD)'
            ]),
            section3FDP: this.formatTablePreview(preview.fdp, [
                'Department', 'FDP Title', 'Sponsored Agency', 'Number of Beneficiaries'
            ]),
            section3Facilitator: this.formatTablePreview(preview.facilitator, [
                'Department', 'Course Name', 'Facilitator Name', 'Date (YYYY-MM-DD)'
            ]),
            section4: this.formatTablePreview(preview.faculty, [
                'Faculty Name', 'Department', 'Event Type', 'Event Title'
            ]),
            section5: this.formatTablePreview(preview.student, [
                'Student Names (comma-separated)', 'Department', 'Event Type', 'Event Title'
            ]),
            section6: this.formatTablePreview(preview.nptel, [
                'Name of Person', 'Department/Class', 'Platform', 'Course Name'
            ]),
            section7: this.formatTablePreview(preview.academic, [
                'Branch', 'Appeared', 'Graduated'
            ])
        };
    },

    formatTablePreview(data, columns) {
        if (!Array.isArray(data) || data.length === 0) return [];

        return data.map(row => {
            const formatted = {};
            columns.forEach(col => {
                formatted[col] = row[col] || '-';
            });
            return formatted;
        });
    }
};

export default excelService;
