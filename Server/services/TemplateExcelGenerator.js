import ExcelJS from 'exceljs';

class TemplateExcelGenerator {
    static academicYearOptions = ['1st year', '2nd year', '3rd year', 'final year'];

    static monthOptions = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    static createHeaderStyle() {
        return {
            fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'FF4472C4' } },
            font: { bold: true, color: { rgb: 'FFFFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };
    }

    static createDataStyle() {
        return {
            alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };
    }

    static applyHeaderAndLayout(sheet) {
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
        sheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: sheet.columnCount }
        };

        const headerRow = sheet.getRow(1);
        headerRow.height = 24;
        headerRow.eachCell((cell) => {
            cell.style = this.createHeaderStyle();
        });
    }

    static addDropdownValidation(sheet, columnLetter, values) {
        sheet.dataValidations.add(`${columnLetter}2:${columnLetter}1000`, {
            type: 'list',
            formula1: `"${values.join(',')}"`,
            showErrorMessage: true,
            errorTitle: 'Invalid value',
            error: `Please select from: ${values.join(', ')}`
        });
    }

    static createSection1Sheet(workbook) {
        const sheet = workbook.addWorksheet('1-InnovativeTeaching', {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        const headers = ['Department', 'Course Code', 'Course Name', 'Topic', 'Teaching Method', 'Month', 'Academic Year', 'Image Filename'];
        sheet.columns = headers.map(h => ({ header: h, key: h.toLowerCase().replace(/\s+/g, '_'), width: 20 }));

        this.applyHeaderAndLayout(sheet);
        this.addDropdownValidation(sheet, 'F', this.monthOptions);
        this.addDropdownValidation(sheet, 'G', this.academicYearOptions);

        return sheet;
    }

    static createSection2Sheet(workbook) {
        const sheet = workbook.addWorksheet('2-EContents', {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        const headers = ['S.No', 'Branch', 'YouTube Video Count', 'YouTube Video Links (comma-separated)', 'Other E-Contents Title', 'E-Content Links (comma-separated)', 'Month', 'Academic Year'];
        sheet.columns = headers.map(h => ({ header: h, key: h.toLowerCase().replace(/\s+/g, '_'), width: 20 }));

        this.applyHeaderAndLayout(sheet);
        this.addDropdownValidation(sheet, 'G', this.monthOptions);
        this.addDropdownValidation(sheet, 'H', this.academicYearOptions);

        return sheet;
    }

    static createSection3GuestLecturesSheet(workbook) {
        const sheet = workbook.addWorksheet('3.1-GuestLectures', {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        const headers = ['S.No', 'Department', 'Workshop Title', 'Date (YYYY-MM-DD)', 'Guest Name', 'Guest Designation', 'Month', 'Academic Year', 'Image Filename'];
        sheet.columns = headers.map(h => ({ header: h, key: h.toLowerCase().replace(/\s+/g, '_'), width: 18 }));

        this.applyHeaderAndLayout(sheet);
        this.addDropdownValidation(sheet, 'G', this.monthOptions);
        this.addDropdownValidation(sheet, 'H', this.academicYearOptions);

        return sheet;
    }

    static createSection3FDPSheet(workbook) {
        const sheet = workbook.addWorksheet('3.2-FDPsOrganized', {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        const headers = ['S.No', 'Department', 'FDP Title', 'Date (YYYY-MM-DD)', 'Sponsored Agency', 'Sponsored Amount', 'Number of Beneficiaries', 'Month', 'Academic Year', 'Image Filename'];
        sheet.columns = headers.map(h => ({ header: h, key: h.toLowerCase().replace(/\s+/g, '_'), width: 18 }));

        this.applyHeaderAndLayout(sheet);
        this.addDropdownValidation(sheet, 'H', this.monthOptions);
        this.addDropdownValidation(sheet, 'I', this.academicYearOptions);

        return sheet;
    }

    static createSection3CourseFacilitatorSheet(workbook) {
        const sheet = workbook.addWorksheet('3.3-CourseFacilitator', {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        const headers = ['S.No', 'Department', 'Course Name', 'Date (YYYY-MM-DD)', 'Facilitator Name', 'Facilitator Designation', 'Facilitator Institution', 'Number of Students', 'Month', 'Academic Year', 'Image Filename'];
        sheet.columns = headers.map(h => ({ header: h, key: h.toLowerCase().replace(/\s+/g, '_'), width: 16 }));

        this.applyHeaderAndLayout(sheet);
        this.addDropdownValidation(sheet, 'I', this.monthOptions);
        this.addDropdownValidation(sheet, 'J', this.academicYearOptions);

        return sheet;
    }

    static createSection4Sheet(workbook) {
        const sheet = workbook.addWorksheet('4-FacultyEvents', {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        const headers = ['S.No', 'Faculty Name', 'Department', 'Event Type', 'Event Title', 'Online/Offline', 'Organizer Details', 'Place of Event', 'Date (YYYY-MM-DD)', 'Month', 'Academic Year', 'Certificate Filename'];
        sheet.columns = headers.map(h => ({ header: h, key: h.toLowerCase().replace(/\s+/g, '_'), width: 16 }));

        this.applyHeaderAndLayout(sheet);

        const eventTypes = ['Workshop', 'Seminar', 'Guest Lecture', 'FDP', 'Others'];
        sheet.dataValidations.add('D2:D1000', {
            type: 'list',
            formula1: `"${eventTypes.join(',')}"`,
            showErrorMessage: true,
            errorTitle: 'Invalid Event Type',
            error: `Please select from: ${eventTypes.join(', ')}`
        });

        this.addDropdownValidation(sheet, 'J', this.monthOptions);
        this.addDropdownValidation(sheet, 'K', this.academicYearOptions);

        return sheet;
    }

    static createSection5Sheet(workbook) {
        const sheet = workbook.addWorksheet('5-StudentEvents', {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        const headers = ['S.No', 'Student Names (comma-separated)', 'Department', 'Event Type', 'Event Title', 'Online/Offline', 'Organizer Details', 'Place of Event', 'Date (YYYY-MM-DD)', 'Number of Students', 'Month', 'Academic Year'];
        sheet.columns = headers.map(h => ({ header: h, key: h.toLowerCase().replace(/\s+/g, '_'), width: 16 }));

        this.applyHeaderAndLayout(sheet);

        const eventTypes = ['Workshop', 'Seminar', 'Guest Lecture', 'Course Facilitator Session', 'Others'];
        sheet.dataValidations.add('D2:D1000', {
            type: 'list',
            formula1: `"${eventTypes.join(',')}"`,
            showErrorMessage: true,
            errorTitle: 'Invalid Event Type',
            error: `Please select from: ${eventTypes.join(', ')}`
        });

        this.addDropdownValidation(sheet, 'K', this.monthOptions);
        this.addDropdownValidation(sheet, 'L', this.academicYearOptions);

        return sheet;
    }

    static createSection6Sheet(workbook) {
        const sheet = workbook.addWorksheet('6-NPTELMooc', {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        const headers = ['S.No', 'Category (Faculty/Student)', 'Name of Person', 'Department/Class', 'Platform', 'Course Name', 'Duration', 'Score/Completion Date', 'Month', 'Academic Year', 'Certificate Filename'];
        sheet.columns = headers.map(h => ({ header: h, key: h.toLowerCase().replace(/\s+/g, '_'), width: 16 }));

        this.applyHeaderAndLayout(sheet);

        sheet.dataValidations.add('B2:B1000', {
            type: 'list',
            formula1: '"Faculty,Student"',
            showErrorMessage: true,
            errorTitle: 'Invalid Category',
            error: 'Please select: Faculty or Student'
        });

        this.addDropdownValidation(sheet, 'I', this.monthOptions);
        this.addDropdownValidation(sheet, 'J', this.academicYearOptions);

        return sheet;
    }

    static createSection7Sheet(workbook) {
        const sheet = workbook.addWorksheet('7-AcademicAchievements', {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        const headers = ['S.No', 'Branch', 'Semester/Year', 'Appeared', 'Graduated', 'Month'];
        sheet.columns = headers.map(h => ({ header: h, key: h.toLowerCase().replace(/\s+/g, '_'), width: 18 }));

        this.applyHeaderAndLayout(sheet);
        this.addDropdownValidation(sheet, 'F', this.monthOptions);

        return sheet;
    }

    static async generateTemplate() {
        const workbook = new ExcelJS.Workbook();
        workbook.properties.title = 'DataToWord - Pillar 1 Template';

        // Create all sheets
        this.createSection1Sheet(workbook);
        this.createSection2Sheet(workbook);
        this.createSection3GuestLecturesSheet(workbook);
        this.createSection3FDPSheet(workbook);
        this.createSection3CourseFacilitatorSheet(workbook);
        this.createSection4Sheet(workbook);
        this.createSection5Sheet(workbook);
        this.createSection6Sheet(workbook);
        this.createSection7Sheet(workbook);

        // Add Instructions sheet
        const instructionSheet = workbook.addWorksheet('Instructions', { views: [{ showGridLines: false }] });
        instructionSheet.columns = [{ width: 100 }];

        const instructions = [
            'DATATOWORD - PILLAR 1 IMPORT TEMPLATE',
            '',
            'Instructions for filling this template:',
            '',
            '1. GENERAL',
            '   - Each sheet represents a section of Pillar 1',
            '   - Keep headers unchanged',
            '   - Enter data in rows below headers',
            '   - Do not add or delete columns',
            '',
            '2. DATE FORMAT',
            '   - Use format: YYYY-MM-DD (e.g., 2024-03-30)',
            '',
            '2A. REQUIRED COLUMNS',
            '   - Fill Month in all sheets',
            '   - Fill Academic Year in sheets 1 to 6',
            '   - Allowed Academic Year: 1st year, 2nd year, 3rd year, final year',
            '',
            '3. IMAGE/CERTIFICATE FILENAMES',
            '   - Enter only the filename (e.g., image.jpg)',
            '   - Upload image files separately',
            '   - Supported formats: JPEG, PNG, GIF, WebP',
            '',
            '4. COMMA-SEPARATED VALUES',
            '   - Where specified, use commas to separate multiple items',
            '   - Example: Link1, Link2, Link3',
            '',
            '5. DROPDOWN FIELDS',
            '   - Some columns have predefined dropdowns',
            '   - Select from available options only',
            '',
            '6. VALIDATION',
            '   - Check all required fields are filled',
            '   - Dates must be valid',
            '   - Numbers must be numeric',
            '',
            '7. UPLOAD PROCESS',
            '   - Fill all sections you need',
            '   - Upload this file via the Import button',
            '   - Upload images separately if needed',
            '   - Review validation errors if any',
            '   - Click Insert to save data',
            '',
            'SHEET BREAKDOWN:',
            '1. 1-InnovativeTeaching: Best teaching methodologies per department',
            '2. 2-EContents: E-learning content developed',
            '3. 3.1-GuestLectures: Guest lectures organized',
            '4. 3.2-FDPsOrganized: Faculty Development Programs organized',
            '5. 3.3-CourseFacilitator: Course facilitator sessions organized',
            '6. 4-FacultyEvents: Events attended by faculty members',
            '7. 5-StudentEvents: Events attended by students',
            '8. 6-NPTELMooc: NPTEL/MOOC courses completed',
            '9. 7-AcademicAchievements: Academic achievement statistics',
            '',
            'TIP: Leave rows blank for sections with no data. Blank rows are ignored during import.'
        ];

        instructions.forEach((line, idx) => {
            const row = instructionSheet.addRow([line]);
            if (idx === 0) {
                row.font = { bold: true, size: 14 };
            } else if (line.match(/^[0-9]+\./)) {
                row.font = { bold: true };
            }
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
}

export default TemplateExcelGenerator;
