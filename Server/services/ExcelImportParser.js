import xlsx from 'xlsx';

class ExcelImportParser {
    static isProvided(value) {
        if (value === null || value === undefined) {
            return false;
        }

        if (typeof value === 'string') {
            return value.trim().length > 0;
        }

        return true;
    }

    static normalizeString(value) {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value).trim();
    }

    static normalizeAssetPath(value) {
        const raw = this.normalizeString(value);
        if (!raw) {
            return null;
        }

        if (raw.startsWith('http://') || raw.startsWith('https://')) {
            return raw;
        }

        if (raw.startsWith('/uploads/')) {
            return raw;
        }

        if (raw.startsWith('uploads/')) {
            return `/${raw}`;
        }

        if (raw.startsWith('/') || raw.startsWith('\\')) {
            return raw;
        }

        return `/uploads/${raw}`;
    }

    static hasMeaningfulData(row) {
        const ignoreKeys = new Set(['S.No', 'S.No.', 'Serial No', 'Serial Number']);
        return Object.entries(row || {}).some(([key, value]) => {
            if (ignoreKeys.has(key)) {
                return false;
            }
            return this.isProvided(value);
        });
    }

    static normalizeDate(value) {
        if (!this.isProvided(value)) {
            return '';
        }

        if (typeof value === 'number') {
            const parsed = xlsx.SSF.parse_date_code(value);
            if (!parsed) {
                return null;
            }

            const yyyy = String(parsed.y).padStart(4, '0');
            const mm = String(parsed.m).padStart(2, '0');
            const dd = String(parsed.d).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }

        const str = String(value).trim();
        if (!str) {
            return '';
        }

        const yyyyMmDd = /^\d{4}-\d{2}-\d{2}$/;
        if (yyyyMmDd.test(str)) {
            return str;
        }

        const date = new Date(str);
        if (Number.isNaN(date.getTime())) {
            return null;
        }

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    static numeric(value) {
        if (!this.isProvided(value)) {
            return null;
        }

        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }

    static columnNumberToName(columnNumber) {
        let dividend = columnNumber;
        let columnName = '';

        while (dividend > 0) {
            const modulo = (dividend - 1) % 26;
            columnName = String.fromCharCode(65 + modulo) + columnName;
            dividend = Math.floor((dividend - modulo) / 26);
        }

        return columnName;
    }

    static buildCellRef(headers, columnKey, rowNumber) {
        const columnIndex = headers.indexOf(columnKey);
        if (columnIndex === -1) {
            return `unknown column, row ${rowNumber}`;
        }

        const columnLabel = this.columnNumberToName(columnIndex + 1);
        return `${columnLabel}${rowNumber}`;
    }

    static pushError(errors, sheetName, headers, rowNumber, columnKey, message) {
        const cellRef = this.buildCellRef(headers, columnKey, rowNumber);
        errors.push(`${sheetName} | Cell ${cellRef} | ${message}`);
    }

    static validateSection1(rows) {
        const errors = [];
        const sheetName = '1_InnovativeTeaching';
        const headers = ['S.No', 'Department', 'Course Code', 'Course Name', 'Topic', 'Teaching Method', 'Month', 'Academic Year', 'Image Filename'];
        rows.forEach((row, idx) => {
            const rowNumber = idx + 2;
            if (!this.isProvided(row['Department'])) this.pushError(errors, sheetName, headers, rowNumber, 'Department', 'Department is required');
            if (!this.isProvided(row['Course Code'])) this.pushError(errors, sheetName, headers, rowNumber, 'Course Code', 'Course Code is required');
            if (!this.isProvided(row['Course Name'])) this.pushError(errors, sheetName, headers, rowNumber, 'Course Name', 'Course Name is required');
            if (!this.isProvided(row['Month'])) this.pushError(errors, sheetName, headers, rowNumber, 'Month', 'Month is required');
            if (!this.isProvided(row['Academic Year'])) this.pushError(errors, sheetName, headers, rowNumber, 'Academic Year', 'Academic Year is required');
        });
        return errors;
    }

    static validateSection2(rows) {
        const errors = [];
        const sheetName = '2_EContents';
        const headers = ['S.No', 'Branch', 'YouTube Video Count', 'YouTube Video Links (comma-separated)', 'Other E-Contents Title', 'E-Content Links (comma-separated)', 'Month', 'Academic Year'];
        rows.forEach((row, idx) => {
            const rowNumber = idx + 2;
            if (!this.isProvided(row['Branch'])) this.pushError(errors, sheetName, headers, rowNumber, 'Branch', 'Branch is required');
            if (!this.isProvided(row['Month'])) this.pushError(errors, sheetName, headers, rowNumber, 'Month', 'Month is required');
            if (!this.isProvided(row['Academic Year'])) this.pushError(errors, sheetName, headers, rowNumber, 'Academic Year', 'Academic Year is required');
        });
        return errors;
    }

    static validateSection3Guest(rows) {
        const errors = [];
        const sheetName = '3_1_GuestLectures';
        const headers = ['S.No', 'Department', 'Workshop Title', 'Date (YYYY-MM-DD)', 'Guest Name', 'Guest Designation', 'Month', 'Academic Year', 'Image Filename'];
        rows.forEach((row, idx) => {
            const rowNumber = idx + 2;
            if (!this.isProvided(row['Department'])) this.pushError(errors, sheetName, headers, rowNumber, 'Department', 'Department is required');
            if (!this.isProvided(row['Workshop Title'])) this.pushError(errors, sheetName, headers, rowNumber, 'Workshop Title', 'Workshop Title is required');
            if (!this.isProvided(row['Guest Name'])) this.pushError(errors, sheetName, headers, rowNumber, 'Guest Name', 'Guest Name is required');
            if (!this.isProvided(row['Month'])) this.pushError(errors, sheetName, headers, rowNumber, 'Month', 'Month is required');
            if (!this.isProvided(row['Academic Year'])) this.pushError(errors, sheetName, headers, rowNumber, 'Academic Year', 'Academic Year is required');
            if (this.isProvided(row['Date (YYYY-MM-DD)']) && !this.isValidDate(row['Date (YYYY-MM-DD)'])) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Date (YYYY-MM-DD)', 'Invalid date format (use YYYY-MM-DD)');
            }
        });
        return errors;
    }

    static validateSection3FDP(rows) {
        const errors = [];
        const sheetName = '3_2_FDP';
        const headers = ['S.No', 'Department', 'FDP Title', 'Date (YYYY-MM-DD)', 'Sponsored Agency', 'Sponsored Amount', 'Number of Beneficiaries', 'Month', 'Academic Year', 'Image Filename'];
        rows.forEach((row, idx) => {
            const rowNumber = idx + 2;
            if (!this.isProvided(row['Department'])) this.pushError(errors, sheetName, headers, rowNumber, 'Department', 'Department is required');
            if (!this.isProvided(row['FDP Title'])) this.pushError(errors, sheetName, headers, rowNumber, 'FDP Title', 'FDP Title is required');
            if (!this.isProvided(row['Sponsored Agency'])) this.pushError(errors, sheetName, headers, rowNumber, 'Sponsored Agency', 'Sponsored Agency is required');
            if (this.numeric(row['Number of Beneficiaries']) === null) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Number of Beneficiaries', 'Number of Beneficiaries must be numeric');
            }
            if (!this.isProvided(row['Month'])) this.pushError(errors, sheetName, headers, rowNumber, 'Month', 'Month is required');
            if (!this.isProvided(row['Academic Year'])) this.pushError(errors, sheetName, headers, rowNumber, 'Academic Year', 'Academic Year is required');
            if (this.isProvided(row['Date (YYYY-MM-DD)']) && !this.isValidDate(row['Date (YYYY-MM-DD)'])) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Date (YYYY-MM-DD)', 'Invalid date format (use YYYY-MM-DD)');
            }
        });
        return errors;
    }

    static validateSection3Facilitator(rows) {
        const errors = [];
        const sheetName = '3_3_CourseFacilitator';
        const headers = ['S.No', 'Department', 'Course Name', 'Date (YYYY-MM-DD)', 'Facilitator Name', 'Facilitator Designation', 'Facilitator Institution', 'Number of Students', 'Month', 'Academic Year', 'Image Filename'];
        rows.forEach((row, idx) => {
            const rowNumber = idx + 2;
            if (!this.isProvided(row['Department'])) this.pushError(errors, sheetName, headers, rowNumber, 'Department', 'Department is required');
            if (!this.isProvided(row['Course Name'])) this.pushError(errors, sheetName, headers, rowNumber, 'Course Name', 'Course Name is required');
            if (!this.isProvided(row['Facilitator Name'])) this.pushError(errors, sheetName, headers, rowNumber, 'Facilitator Name', 'Facilitator Name is required');
            if (!this.isProvided(row['Month'])) this.pushError(errors, sheetName, headers, rowNumber, 'Month', 'Month is required');
            if (!this.isProvided(row['Academic Year'])) this.pushError(errors, sheetName, headers, rowNumber, 'Academic Year', 'Academic Year is required');
            if (this.isProvided(row['Date (YYYY-MM-DD)']) && !this.isValidDate(row['Date (YYYY-MM-DD)'])) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Date (YYYY-MM-DD)', 'Invalid date format (use YYYY-MM-DD)');
            }
        });
        return errors;
    }

    static validateSection4(rows) {
        const errors = [];
        const sheetName = '4_FacultyEvents';
        const headers = ['S.No', 'Faculty Name', 'Department', 'Event Type', 'Event Title', 'Online/Offline', 'Organizer Details', 'Place of Event', 'Date (YYYY-MM-DD)', 'Month', 'Academic Year', 'Certificate Filename'];
        const validEventTypes = ['Workshop', 'Seminar', 'Guest Lecture', 'FDP', 'Others'];
        const validModes = ['Online', 'Offline'];
        rows.forEach((row, idx) => {
            const rowNumber = idx + 2;
            if (!this.isProvided(row['Faculty Name'])) this.pushError(errors, sheetName, headers, rowNumber, 'Faculty Name', 'Faculty Name is required');
            if (!this.isProvided(row['Department'])) this.pushError(errors, sheetName, headers, rowNumber, 'Department', 'Department is required');
            if (!this.isProvided(row['Month'])) this.pushError(errors, sheetName, headers, rowNumber, 'Month', 'Month is required');
            if (!this.isProvided(row['Academic Year'])) this.pushError(errors, sheetName, headers, rowNumber, 'Academic Year', 'Academic Year is required');
            if (this.isProvided(row['Event Type']) && !validEventTypes.includes(this.normalizeString(row['Event Type']))) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Event Type', 'Invalid Event Type');
            }
            if (this.isProvided(row['Online/Offline']) && !validModes.includes(this.normalizeString(row['Online/Offline']))) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Online/Offline', 'Online/Offline must be Online or Offline');
            }
            if (this.isProvided(row['Date (YYYY-MM-DD)']) && !this.isValidDate(row['Date (YYYY-MM-DD)'])) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Date (YYYY-MM-DD)', 'Invalid date format (use YYYY-MM-DD)');
            }
        });
        return errors;
    }

    static validateSection5(rows) {
        const errors = [];
        const sheetName = '5_StudentEvents';
        const headers = ['S.No', 'Student Names (comma-separated)', 'Department', 'Event Type', 'Event Title', 'Online/Offline', 'Organizer Details', 'Place of Event', 'Date (YYYY-MM-DD)', 'Number of Students', 'Month', 'Academic Year'];
        const validEventTypes = ['Workshop', 'Seminar', 'Guest Lecture', 'Course Facilitator Session', 'Others'];
        const validModes = ['Online', 'Offline'];
        rows.forEach((row, idx) => {
            const rowNumber = idx + 2;
            if (!this.isProvided(row['Student Names (comma-separated)'])) this.pushError(errors, sheetName, headers, rowNumber, 'Student Names (comma-separated)', 'Student Names is required');
            if (!this.isProvided(row['Department'])) this.pushError(errors, sheetName, headers, rowNumber, 'Department', 'Department is required');
            if (!this.isProvided(row['Month'])) this.pushError(errors, sheetName, headers, rowNumber, 'Month', 'Month is required');
            if (!this.isProvided(row['Academic Year'])) this.pushError(errors, sheetName, headers, rowNumber, 'Academic Year', 'Academic Year is required');
            if (this.isProvided(row['Event Type']) && !validEventTypes.includes(this.normalizeString(row['Event Type']))) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Event Type', 'Invalid Event Type');
            }
            if (this.isProvided(row['Online/Offline']) && !validModes.includes(this.normalizeString(row['Online/Offline']))) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Online/Offline', 'Online/Offline must be Online or Offline');
            }
            if (this.isProvided(row['Number of Students']) && this.numeric(row['Number of Students']) === null) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Number of Students', 'Number of Students must be numeric');
            }
            if (row['Date (YYYY-MM-DD)'] && !this.isValidDate(row['Date (YYYY-MM-DD)'])) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Date (YYYY-MM-DD)', 'Invalid date format (use YYYY-MM-DD)');
            }
        });
        return errors;
    }

    static validateSection6(rows) {
        const errors = [];
        const sheetName = '6_NPTELMooc';
        const headers = ['S.No', 'Category (Faculty/Student)', 'Name of Person', 'Department/Class', 'Platform', 'Course Name', 'Duration', 'Score/Completion Date', 'Month', 'Academic Year', 'Certificate Filename'];
        const validCategories = ['Faculty', 'Student'];
        rows.forEach((row, idx) => {
            const rowNumber = idx + 2;
            if (row['Category (Faculty/Student)'] && !validCategories.includes(this.normalizeString(row['Category (Faculty/Student)']))) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Category (Faculty/Student)', 'Category must be Faculty or Student');
            }
            if (!this.isProvided(row['Name of Person'])) this.pushError(errors, sheetName, headers, rowNumber, 'Name of Person', 'Name of Person is required');
            if (!this.isProvided(row['Course Name'])) this.pushError(errors, sheetName, headers, rowNumber, 'Course Name', 'Course Name is required');
            if (!this.isProvided(row['Month'])) this.pushError(errors, sheetName, headers, rowNumber, 'Month', 'Month is required');
            if (!this.isProvided(row['Academic Year'])) this.pushError(errors, sheetName, headers, rowNumber, 'Academic Year', 'Academic Year is required');
        });
        return errors;
    }

    static validateSection7(rows) {
        const errors = [];
        const sheetName = '7_AcademicAchievements';
        const headers = ['S.No', 'Branch', 'Semester/Year', 'Appeared', 'Graduated', 'Month'];
        rows.forEach((row, idx) => {
            const rowNumber = idx + 2;
            if (!this.isProvided(row['Branch'])) this.pushError(errors, sheetName, headers, rowNumber, 'Branch', 'Branch is required');
            if (!this.isProvided(row['Month'])) this.pushError(errors, sheetName, headers, rowNumber, 'Month', 'Month is required');
            if (this.numeric(row['Appeared']) === null) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Appeared', 'Appeared must be numeric');
            }
            if (this.numeric(row['Graduated']) === null) {
                this.pushError(errors, sheetName, headers, rowNumber, 'Graduated', 'Graduated must be numeric');
            }
        });
        return errors;
    }

    static isValidDate(dateString) {
        const normalized = this.normalizeDate(dateString);
        if (!normalized) {
            return false;
        }

        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(normalized)) return false;
        const date = new Date(normalized);
        return date instanceof Date && !isNaN(date);
    }

    static parseExcelFile(buffer) {
        try {
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const result = {
                sheet1InnovativeTeaching: [],
                sheet2EContents: [],
                sheet3GuestLectures: [],
                sheet3FDP: [],
                sheet3Facilitator: [],
                sheet4Faculty: [],
                sheet5Student: [],
                sheet6NPTEL: [],
                sheet7Academic: [],
                errors: []
            };

            // Parse each sheet
            const sheetNames = workbook.SheetNames;

            sheetNames.forEach((sheetName) => {
                const worksheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' })
                    .filter((row) => this.hasMeaningfulData(row));

                if (sheetName.includes('InnovativeTeaching')) {
                    result.sheet1InnovativeTeaching = data;
                    const errors = this.validateSection1(data);
                    if (errors.length) result.errors.push(...errors);
                }
                else if (sheetName.includes('EContents')) {
                    result.sheet2EContents = data;
                    const errors = this.validateSection2(data);
                    if (errors.length) result.errors.push(...errors);
                }
                else if (sheetName.includes('GuestLectures')) {
                    result.sheet3GuestLectures = data;
                    const errors = this.validateSection3Guest(data);
                    if (errors.length) result.errors.push(...errors);
                }
                else if (sheetName.includes('FDP')) {
                    result.sheet3FDP = data;
                    const errors = this.validateSection3FDP(data);
                    if (errors.length) result.errors.push(...errors);
                }
                else if (sheetName.includes('CourseFacilitator')) {
                    result.sheet3Facilitator = data;
                    const errors = this.validateSection3Facilitator(data);
                    if (errors.length) result.errors.push(...errors);
                }
                else if (sheetName.includes('FacultyEvents')) {
                    result.sheet4Faculty = data;
                    const errors = this.validateSection4(data);
                    if (errors.length) result.errors.push(...errors);
                }
                else if (sheetName.includes('StudentEvents')) {
                    result.sheet5Student = data;
                    const errors = this.validateSection5(data);
                    if (errors.length) result.errors.push(...errors);
                }
                else if (sheetName.includes('NPTELMooc')) {
                    result.sheet6NPTEL = data;
                    const errors = this.validateSection6(data);
                    if (errors.length) result.errors.push(...errors);
                }
                else if (sheetName.includes('AcademicAchievements')) {
                    result.sheet7Academic = data;
                    const errors = this.validateSection7(data);
                    if (errors.length) result.errors.push(...errors);
                }
            });

            return result;
        } catch (error) {
            return {
                error: `Failed to parse Excel file: ${error.message}`,
                sheet1InnovativeTeaching: [],
                sheet2EContents: [],
                sheet3GuestLectures: [],
                sheet3FDP: [],
                sheet3Facilitator: [],
                sheet4Faculty: [],
                sheet5Student: [],
                sheet6NPTEL: [],
                sheet7Academic: []
            };
        }
    }

    static transformToModels(parsedData) {
        const transformed = {
            innovativeTeaching: [],
            eContents: [],
            guestLectures: [],
            fdpOrganized: [],
            courseFacilitator: [],
            facultyEvents: [],
            studentEvents: [],
            nptelMooc: [],
            academicAchievements: []
        };

        // Transform Section 1
        transformed.innovativeTeaching = parsedData.sheet1InnovativeTeaching
            .filter(row => row['Department'])
            .map((row, index) => ({
                department: this.normalizeString(row['Department']),
                courseCode: this.normalizeString(row['Course Code']),
                courseName: this.normalizeString(row['Course Name']),
                topic: this.normalizeString(row['Topic']),
                teachingMethod: this.normalizeString(row['Teaching Method']),
                month: this.normalizeString(row['Month']),
                academicYear: this.normalizeString(row['Academic Year']),
                serialNo: this.numeric(row['S.No']) ?? (index + 1),
                imagePath: this.normalizeAssetPath(row['Image Filename'])
            }));

        // Transform Section 2
        transformed.eContents = parsedData.sheet2EContents
            .filter(row => row['Branch'])
            .map((row, index) => ({
                serialNo: this.numeric(row['S.No']) ?? (index + 1),
                branch: this.normalizeString(row['Branch']),
                youtubeVideoCount: parseInt(row['YouTube Video Count']) || 0,
                youtubeVideoLinks: row['YouTube Video Links (comma-separated)']
                    ? this.normalizeString(row['YouTube Video Links (comma-separated)']).split(',').map(l => l.trim()).filter(Boolean)
                    : [],
                otherEContents: row['Other E-Contents Title'] ? [{
                    title: this.normalizeString(row['Other E-Contents Title']),
                    link: this.normalizeString(row['E-Content Links (comma-separated)']),
                    type: 'resource'
                }] : [],
                month: this.normalizeString(row['Month']),
                academicYear: this.normalizeString(row['Academic Year'])
            }));

        // Transform Section 3.1
        transformed.guestLectures = parsedData.sheet3GuestLectures
            .filter(row => row['Department'])
            .map((row, index) => ({
                serialNo: this.numeric(row['S.No']) ?? (index + 1),
                department: this.normalizeString(row['Department']),
                workshopTitle: this.normalizeString(row['Workshop Title']),
                date: this.normalizeDate(row['Date (YYYY-MM-DD)']) || row['Date (YYYY-MM-DD)'],
                guestName: this.normalizeString(row['Guest Name']),
                guestDesignation: this.normalizeString(row['Guest Designation']),
                month: this.normalizeString(row['Month']),
                academicYear: this.normalizeString(row['Academic Year']),
                imagePath: this.normalizeAssetPath(row['Image Filename'])
            }));

        // Transform Section 3.2
        transformed.fdpOrganized = parsedData.sheet3FDP
            .filter(row => row['Department'])
            .map((row, index) => ({
                serialNo: this.numeric(row['S.No']) ?? (index + 1),
                department: this.normalizeString(row['Department']),
                fdpTitle: this.normalizeString(row['FDP Title']),
                date: this.normalizeDate(row['Date (YYYY-MM-DD)']) || row['Date (YYYY-MM-DD)'],
                sponsoredAgency: this.normalizeString(row['Sponsored Agency']),
                sponsoredAmount: this.normalizeString(row['Sponsored Amount']),
                numberOfBeneficiaries: parseInt(row['Number of Beneficiaries']) || 0,
                month: this.normalizeString(row['Month']),
                academicYear: this.normalizeString(row['Academic Year']),
                imagePath: this.normalizeAssetPath(row['Image Filename'])
            }));

        // Transform Section 3.3
        transformed.courseFacilitator = parsedData.sheet3Facilitator
            .filter(row => row['Department'])
            .map((row, index) => ({
                serialNo: this.numeric(row['S.No']) ?? (index + 1),
                department: this.normalizeString(row['Department']),
                courseName: this.normalizeString(row['Course Name']),
                date: this.normalizeDate(row['Date (YYYY-MM-DD)']) || row['Date (YYYY-MM-DD)'],
                facilitatorName: this.normalizeString(row['Facilitator Name']),
                facilitatorDesignation: this.normalizeString(row['Facilitator Designation']),
                facilitatorInstitution: this.normalizeString(row['Facilitator Institution']),
                numberOfStudents: parseInt(row['Number of Students']) || 0,
                month: this.normalizeString(row['Month']),
                academicYear: this.normalizeString(row['Academic Year']),
                imagePath: this.normalizeAssetPath(row['Image Filename'])
            }));

        // Transform Section 4
        transformed.facultyEvents = parsedData.sheet4Faculty
            .filter(row => row['Faculty Name'])
            .map((row, index) => ({
                serialNo: this.numeric(row['S.No']) ?? (index + 1),
                facultyName: this.normalizeString(row['Faculty Name']),
                department: this.normalizeString(row['Department']),
                eventType: this.normalizeString(row['Event Type']),
                eventTitle: this.normalizeString(row['Event Title']),
                onlineOffline: this.normalizeString(row['Online/Offline']),
                organizerDetails: this.normalizeString(row['Organizer Details']),
                placeOfEvent: this.normalizeString(row['Place of Event']),
                date: this.normalizeDate(row['Date (YYYY-MM-DD)']) || row['Date (YYYY-MM-DD)'],
                month: this.normalizeString(row['Month']),
                academicYear: this.normalizeString(row['Academic Year']),
                certificatePath: this.normalizeAssetPath(row['Certificate Filename'])
            }));

        // Transform Section 5
        transformed.studentEvents = parsedData.sheet5Student
            .filter(row => row['Student Names (comma-separated)'])
            .map((row, index) => ({
                serialNo: this.numeric(row['S.No']) ?? (index + 1),
                studentNames: this.normalizeString(row['Student Names (comma-separated)']).split(',').map(n => n.trim()).filter(Boolean),
                department: this.normalizeString(row['Department']),
                eventType: this.normalizeString(row['Event Type']),
                eventTitle: this.normalizeString(row['Event Title']),
                onlineOffline: this.normalizeString(row['Online/Offline']),
                organizerDetails: this.normalizeString(row['Organizer Details']),
                placeOfEvent: this.normalizeString(row['Place of Event']),
                date: this.normalizeDate(row['Date (YYYY-MM-DD)']) || row['Date (YYYY-MM-DD)'],
                numberOfStudentsAttended: parseInt(row['Number of Students']) || 0,
                month: this.normalizeString(row['Month']),
                academicYear: this.normalizeString(row['Academic Year'])
            }));

        // Transform Section 6
        transformed.nptelMooc = parsedData.sheet6NPTEL
            .filter(row => row['Name of Person'])
            .map((row, index) => ({
                category: this.normalizeString(row['Category (Faculty/Student)']),
                serialNo: this.numeric(row['S.No']) ?? (index + 1),
                nameOfPerson: this.normalizeString(row['Name of Person']),
                classOrDepartment: this.normalizeString(row['Department/Class']),
                platform: this.normalizeString(row['Platform']),
                courseName: this.normalizeString(row['Course Name']),
                duration: this.normalizeString(row['Duration']),
                scoreOrCompletionDate: this.normalizeString(row['Score/Completion Date']),
                month: this.normalizeString(row['Month']),
                academicYear: this.normalizeString(row['Academic Year']),
                certificatePath: this.normalizeAssetPath(row['Certificate Filename'])
            }));

        // Transform Section 7
        transformed.academicAchievements = parsedData.sheet7Academic
            .filter(row => row['Branch'])
            .map((row, index) => ({
                serialNo: this.numeric(row['S.No']) ?? (index + 1),
                branch: this.normalizeString(row['Branch']),
                semesterYear: this.normalizeString(row['Semester/Year']),
                appeared: parseInt(row['Appeared']) || 0,
                graduated: parseInt(row['Graduated']) || 0,
                graduationPercentage: ((parseInt(row['Graduated']) || 0) / (parseInt(row['Appeared']) || 1)) * 100,
                month: this.normalizeString(row['Month'])
            }));

        return transformed;
    }
}

export default ExcelImportParser;
