import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    ImageRun,
    Packer,
    PageNumber,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    UnderlineType,
    VerticalAlign,
    WidthType
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentGenerator {
    static genericSectionRenderConfig = {
        // Pillar 2
        cfe: { mode: 'text' },
        'papers-published-scopus-wos-scie-faculty': { mode: 'text', totalLabel: 'Total Number of Papers Published' },
        'papers-presented-faculty': { mode: 'text' },
        'papers-published-students': { mode: 'text' },
        'papers-presented-students': { mode: 'text' },
        'symposium-papers-students': { mode: 'text' },
        'books-book-chapters': { mode: 'text' },
        patents: {
            mode: 'table',
            headers: ['S.No', 'Application Number', 'Date of Grant/Published/Filed', 'Name of the faculty members', 'Title of the Patent', 'Filed/Published/Granted', 'Design/Product'],
            row: (item, index) => [
                String(index + 1),
                item?.data?.applicationNumber || '',
                this.safeDate(item?.data?.date),
                item?.data?.facultyMembers || '',
                item?.data?.patentTitle || '',
                item?.data?.filingStatus || '',
                item?.data?.designOrProduct || ''
            ]
        },
        'grants-received': {
            mode: 'table',
            headers: ['S.No', 'Departments', 'Description', 'Granting Agency', 'Grant Amount Received Rs'],
            row: (item, index) => [
                String(index + 1),
                item?.data?.department || item?.department || '',
                item?.data?.description || '',
                item?.data?.grantingAgency || '',
                String(item?.data?.amountReceived || '')
            ]
        },
        consultancy: {
            mode: 'table',
            headers: ['S.No', 'Department', 'Consultancy to', 'Revenue Generated (Rs)', 'Status'],
            row: (item, index) => [
                String(index + 1),
                item?.data?.department || item?.department || '',
                item?.data?.consultancyTo || '',
                String(item?.data?.revenueGenerated || ''),
                item?.data?.status || ''
            ]
        },
        startups: {
            mode: 'table',
            headers: ['S.No', 'Departments', 'Name of the startup', 'Month & Year of Starting', 'Amount Generated Rs'],
            row: (item, index) => [
                String(index + 1),
                item?.data?.department || item?.department || '',
                item?.data?.startupName || '',
                item?.data?.monthYearStarted || '',
                String(item?.data?.amountGenerated || '')
            ]
        },
        'hackathon-ideathon-organized': { mode: 'text' },
        'bmc-videos': {
            mode: 'table',
            headers: ['S.No', 'Branch', 'No. of BMC videos Taken'],
            row: (item, index) => [
                String(index + 1),
                item?.data?.branch || item?.department || '',
                String(item?.data?.bmcVideosTaken || '')
            ]
        },

        // Pillar 3
        'student-participation': {
            mode: 'table',
            headers: ['S.No', 'Departments', 'Type of events', 'Number of students'],
            row: (item, index) => [
                String(index + 1),
                item?.data?.department || item?.department || '',
                item?.data?.eventType || '',
                String(item?.data?.studentsCount || '')
            ]
        },
        'student-achievements': {
            mode: 'table',
            headers: ['S.No', 'Class', 'Name of the Students', 'Date of the Event', 'Name of the event', 'Organized by', 'Place'],
            row: (item, index) => [
                String(index + 1),
                item?.data?.className || '',
                item?.data?.studentNames || '',
                this.safeDate(item?.data?.date),
                item?.data?.eventName || '',
                item?.data?.organizedBy || '',
                item?.data?.place || ''
            ]
        },
        'iste-activities': { mode: 'text', totalLabel: 'Total Number of Activity Organized' },
        'iete-activities': { mode: 'text', totalLabel: 'Total Number of IETE Activity Organized' },
        'club-activities': { mode: 'text', totalLabel: 'Total Number of Club Activity Organized' },
        'iste-iete-club-activities': { mode: 'text', totalLabel: 'Total Number of Activity Organized' },
        'global-certifications': {
            mode: 'table',
            headers: ['S.No', 'Class', 'Name of Certification', 'No. of Students Completed'],
            row: (item, index) => [
                String(index + 1),
                item?.data?.className || '',
                item?.data?.certificationName || '',
                String(item?.data?.studentsCompleted || '')
            ]
        },

        // Pillar 4
        'mou-signed': { mode: 'text', totalLabel: 'MoUs Signed This Year' },
        'industry-collaborated-activities': {
            mode: 'table',
            headers: ['Sl.No', 'Type of events', 'Student Count'],
            row: (item, index) => [
                String(index + 1),
                item?.data?.activityType || '',
                String(item?.data?.studentCount || '')
            ]
        },
        'internship-details': {
            mode: 'table',
            headers: ['S.No', 'Departments', 'Name of the Students', 'Name of the Industry', 'Internship Category (Paid / Unpaid)', 'Amount Received'],
            row: (item, index) => [
                String(index + 1),
                item?.data?.department || item?.department || '',
                item?.data?.studentName || '',
                item?.data?.industryName || '',
                item?.data?.internshipCategory || '',
                String(item?.data?.amountReceived || '')
            ]
        },
        'industrial-visits': { mode: 'text', totalLabel: 'Total Number of Industry Visits' },
        'industrial-projects': {
            mode: 'table',
            headers: ['S.No', 'Class', 'Name of the Students', 'Name of the Industry with Address', 'Title of the Project'],
            row: (item, index) => [
                String(index + 1),
                item?.data?.className || '',
                item?.data?.studentName || '',
                item?.data?.industryName || '',
                item?.data?.projectTitle || ''
            ]
        },

        // Pillar 5
        'extension-activities': { mode: 'text' },
        'dt-bootcamps': { mode: 'text' }
    };

    static pillarSectionOrder = {
        2: [
            'cfe',
            'papers-published-scopus-wos-scie-faculty',
            'papers-presented-faculty',
            'papers-published-students',
            'papers-presented-students',
            'symposium-papers-students',
            'books-book-chapters',
            'patents',
            'grants-received',
            'consultancy',
            'startups',
            'hackathon-ideathon-organized',
            'bmc-videos'
        ],
        3: ['student-participation', 'student-achievements', 'iste-activities', 'iete-activities', 'club-activities', 'iste-iete-club-activities', 'global-certifications'],
        4: ['mou-signed', 'industry-collaborated-activities', 'internship-details', 'industrial-visits', 'industrial-projects'],
        5: ['extension-activities', 'dt-bootcamps']
    };

    static textRun(text, options = {}) {
        return new TextRun({
            text: String(text ?? ''),
            font: 'Times New Roman',
            size: options.size ?? 22,
            bold: options.bold || false,
            italics: options.italics || false,
            underline: options.underline ? { type: UnderlineType.SINGLE } : undefined,
            break: options.break || undefined
        });
    }

    static paragraph(text, options = {}) {
        return new Paragraph({
            alignment: options.alignment || AlignmentType.LEFT,
            spacing: options.spacing,
            indent: options.indent,
            children: [this.textRun(text, options)]
        });
    }

    static safeDate(value) {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    static sorted(items = []) {
        return [...items].sort((a, b) => Number(a?.serialNo || 0) - Number(b?.serialNo || 0));
    }

    static sortedByDepartment(items = []) {
        return [...items].sort((a, b) => {
            const deptA = (a?.department || a?.branch || a?.classOrDepartment || '').toLowerCase();
            const deptB = (b?.department || b?.branch || b?.classOrDepartment || '').toLowerCase();
            return deptA.localeCompare(deptB);
        });
    }

    static resolveUploadPath(storedPath) {
        if (!storedPath || typeof storedPath !== 'string') {
            return null;
        }

        // Paths from DB are stored as '/uploads/<file>'. On Windows this is treated as
        // an absolute root path (e.g. D:\uploads\...), so map it back to /public/uploads.
        if (storedPath.startsWith('/uploads/') || storedPath.startsWith('\\uploads\\')) {
            const normalizedUploadPath = storedPath.replace(/^[/\\]+/, '');
            return path.join(__dirname, '..', 'public', normalizedUploadPath);
        }

        if (path.isAbsolute(storedPath)) {
            return storedPath;
        }

        const normalized = storedPath.replace(/^[/\\]+/, '');
        return path.join(__dirname, '..', 'public', normalized);
    }

    static async imageParagraph(storedPath, width = 240, height = 130) {
        try {
            const absolutePath = this.resolveUploadPath(storedPath);
            if (!absolutePath) {
                return null;
            }

            let imageBuffer = await fs.readFile(absolutePath);
            const ext = path.extname(absolutePath).toLowerCase();

            let imageType = 'png';
            if (ext === '.jpg' || ext === '.jpeg' || ext === '.jfif') {
                imageType = 'jpg';
            } else if (ext === '.png') {
                imageType = 'png';
            } else if (ext === '.bmp') {
                imageType = 'bmp';
            } else if (ext === '.gif' || ext === '.webp') {
                // Convert formats with poor DOCX compatibility into PNG.
                imageBuffer = await sharp(imageBuffer).png().toBuffer();
                imageType = 'png';
            }

            return new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 140 },
                children: [
                    new ImageRun({
                        data: imageBuffer,
                        type: imageType,
                        transformation: { width, height }
                    })
                ]
            });
        } catch {
            return null;
        }
    }

    static sectionTitle(text) {
        return this.paragraph(text, {
            bold: true,
            underline: true,
            alignment: AlignmentType.LEFT,
            spacing: { before: 220, after: 120 }
        });
    }

    static centerTitle(text, size = 24) {
        return this.paragraph(text, {
            bold: true,
            underline: true,
            alignment: AlignmentType.CENTER,
            size,
            spacing: { before: 100, after: 120 }
        });
    }

    static prettyLabel(key) {
        return String(key || '')
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/[_-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/^./, (ch) => ch.toUpperCase());
    }

    static stringifyData(data = {}) {
        const pairs = Object.entries(data)
            .map(([key, value]) => {
                if (value === null || value === undefined || String(value).trim() === '') {
                    return null;
                }
                const normalized = Array.isArray(value) ? value.join(', ') : String(value);
                return `${this.prettyLabel(key)}: ${normalized}`;
            })
            .filter(Boolean);

        return pairs.join(' | ');
    }

    static async renderTextRecord(record, options = {}) {
        const lines = [];
        const entries = Object.entries(record?.data || {});
        const alignment = options.alignment || AlignmentType.LEFT;

        for (const [key, value] of entries) {
            if (value === null || value === undefined || String(value).trim() === '') {
                continue;
            }
            const formatted = key.toLowerCase().includes('date') ? this.safeDate(value) : String(value);
            lines.push(this.paragraph(`${this.prettyLabel(key)} : ${formatted}`, { alignment }));
        }

        if (record?.month || record?.academicYear) {
            lines.push(this.paragraph(`Month : ${record.month || ''}   Academic Year : ${record.academicYear || ''}`, { alignment }));
        }

        if (options.includeImage && record?.imagePath) {
            const imageBlock = await this.imageParagraph(record.imagePath, 220, 120);
            if (imageBlock) {
                lines.push(imageBlock);
            }
        }

        lines.push(this.paragraph('', { alignment, spacing: { after: 120 } }));
        return lines;
    }

    static pillarTitlePage(title) {
        return [
            new Paragraph({
                pageBreakBefore: true,
                alignment: AlignmentType.CENTER,
                spacing: { before: 6200, after: 5200 },
                children: [this.textRun(title, { bold: true, underline: true, size: 40 })]
            }),
            new Paragraph({ pageBreakBefore: true, children: [] })
        ];
    }

    static async appendGenericPillar(blocks, pillarNumber, pillarTitle, records = []) {
        if (!records.length) {
            return;
        }

        blocks.push(...this.pillarTitlePage(`${pillarNumber}. ${pillarTitle}`));

        const grouped = records.reduce((acc, record) => {
            const key = record.sectionKey || 'misc';
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(record);
            return acc;
        }, {});

        const orderedKeys = this.pillarSectionOrder[pillarNumber] || Object.keys(grouped);

        for (const sectionKey of orderedKeys) {
            const sectionRecords = grouped[sectionKey] || [];
            if (!sectionRecords.length) {
                continue;
            }

            const sectionTitle = sectionRecords[0]?.sectionTitle || sectionKey;
            const sortedRecords = this.sortedByDepartment(sectionRecords);
            blocks.push(this.sectionTitle(sectionTitle));

            const sectionConfig = this.genericSectionRenderConfig[sectionKey] || { mode: 'text' };

            if (sectionKey === 'hackathon-ideathon-organized') {
                const hackathons = sortedRecords.filter((row) => String(row?.data?.eventType || '').toLowerCase().includes('hack'));
                const ideathons = sortedRecords.filter((row) => String(row?.data?.eventType || '').toLowerCase().includes('idea'));
                blocks.push(this.paragraph(`Total Number of Hackathons Organized: ${hackathons.length}`, { bold: true }));
                blocks.push(this.paragraph(`Total Number of Ideathons Organized: ${ideathons.length}`, { bold: true, spacing: { after: 100 } }));
            } else if (sectionConfig.totalLabel) {
                blocks.push(this.paragraph(`${sectionConfig.totalLabel}: ${sortedRecords.length}`, { bold: true, spacing: { after: 100 } }));
            } else {
                blocks.push(this.paragraph(`Total Number of Records: ${sortedRecords.length}`, { bold: true, spacing: { after: 100 } }));
            }

            if (sectionConfig.mode === 'table') {
                blocks.push(
                    this.createTable(
                        sectionConfig.headers || ['S.No', 'Details'],
                        sortedRecords.map((item, index) => {
                            if (typeof sectionConfig.row === 'function') {
                                return sectionConfig.row(item, index);
                            }
                            return [String(index + 1), this.stringifyData(item.data)];
                        })
                    )
                );
                blocks.push(this.paragraph('', { spacing: { after: 180 } }));
                continue;
            }

            for (const item of sortedRecords) {
                blocks.push(...await this.renderTextRecord(item, {
                    includeImage: sectionKey === 'cfe'
                        || sectionKey === 'papers-published-scopus-wos-scie-faculty'
                        || sectionKey === 'hackathon-ideathon-organized'
                        || sectionKey === 'iste-activities'
                        || sectionKey === 'iete-activities'
                        || sectionKey === 'club-activities'
                        || sectionKey === 'iste-iete-club-activities'
                        || sectionKey === 'mou-signed'
                        || sectionKey === 'industrial-visits'
                        || sectionKey === 'extension-activities'
                        || sectionKey === 'dt-bootcamps'
                }));
            }
        }
    }

    static createTable(headers, rows, options = {}) {
        const headerStyle = {
            verticalAlign: VerticalAlign.CENTER,
            children: [
                this.paragraph('', {
                    bold: true,
                    alignment: AlignmentType.CENTER
                })
            ]
        };

        const tableRows = [
            new TableRow({
                children: headers.map((header) =>
                    new TableCell({
                        ...headerStyle,
                        children: [
                            this.paragraph(header, {
                                bold: true,
                                alignment: AlignmentType.CENTER
                            })
                        ]
                    })
                )
            })
        ];

        rows.forEach((row) => {
            tableRows.push(
                new TableRow({
                    children: row.map((cell) =>
                        new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            children: [
                                this.paragraph(cell, {
                                    alignment: options.centerBody ? AlignmentType.CENTER : AlignmentType.LEFT
                                })
                            ]
                        })
                    )
                })
            );
        });

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
                bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
                left: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
                right: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
                insideVertical: { style: BorderStyle.SINGLE, size: 8, color: '000000' }
            },
            rows: tableRows
        });
    }

    static addTypewiseCountTable(events, types) {
        return this.createTable(
            ['S.No', 'Event Type', 'Attended'],
            types.map((type, index) => [
                String(index + 1),
                type,
                String(events.filter((event) => event?.eventType === type).length)
            ]),
            { centerBody: true }
        );
    }

    static addEventTable(events, heading, nameHeader) {
        if (!events.length) {
            return [];
        }

        const sortedEvents = this.sortedByDepartment(events);

        return [
            this.centerTitle(heading, 22),
            this.createTable(
                ['S.No', nameHeader, 'Departments', 'Title of the event (Online / Offline)', 'Details of the organizer with Place', 'Date'],
                sortedEvents.map((item, index) => [
                    String(index + 1),
                    item?.facultyName || item?.studentNames?.join(', ') || '',
                    item?.department || '',
                    `${item?.eventTitle || ''}${item?.onlineOffline ? ` (${item.onlineOffline})` : ''}`,
                    `${item?.organizerDetails || ''}${item?.placeOfEvent ? `, ${item.placeOfEvent}` : ''}`,
                    this.safeDate(item?.date)
                ])
            )
        ];
    }

    static buildFooter() {
        return new Footer({
            children: [
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
                        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 33, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
                                    },
                                    children: [
                                        this.paragraph('SNS TECH', {
                                            italics: true,
                                            alignment: AlignmentType.LEFT,
                                            size: 16
                                        })
                                    ]
                                }),
                                new TableCell({
                                    width: { size: 34, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
                                    },
                                    children: [
                                        this.paragraph('ANNUAL REPORT 2025-2026', {
                                            italics: true,
                                            alignment: AlignmentType.CENTER,
                                            size: 16
                                        })
                                    ]
                                }),
                                new TableCell({
                                    width: { size: 33, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
                                    },
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.RIGHT,
                                            children: [
                                                this.textRun('Page ', { italics: true, size: 16 }),
                                                new TextRun({
                                                    italics: true,
                                                    size: 16,
                                                    children: [PageNumber.CURRENT]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }

    static async generateDocument(pillar1Data, genericPillars = {}) {
        const blocks = [];

        const addSpacer = (after = 180) => blocks.push(this.paragraph('', { spacing: { after } }));

        blocks.push(this.centerTitle('Details Required for Annual Report preparation', 26));
        blocks.push(
            this.paragraph('(Details between 01.06.2025 to 31.03.2026)', {
                alignment: AlignmentType.CENTER,
                underline: true,
                size: 18,
                spacing: { after: 220 }
            })
        );
        blocks.push(this.sectionTitle('1. CENTER FOR LEARNING AND TEACHING'));

        const innovative = this.sortedByDepartment(pillar1Data.innovativeTeaching || []);
        if (innovative.length) {
            blocks.push(this.sectionTitle('1.1 Innovative Teaching Methodologies Followed (Best one per Department)'));
            for (const item of innovative) {
                blocks.push(this.paragraph(`Department : ${item.department || ''}`, { bold: true }));
                blocks.push(this.paragraph(`Course Code & Name : ${`${item.courseCode || ''} ${item.courseName || ''}`.trim()}`));
                blocks.push(this.paragraph(`Topic : ${item.topic || ''}`));
                blocks.push(this.paragraph(`Teaching Method : ${item.teachingMethod || ''}`));
                const imageBlock = await this.imageParagraph(item.imagePath, 220, 120);
                if (imageBlock) {
                    blocks.push(imageBlock);
                }
                addSpacer(120);
            }
            addSpacer();
        }

        const eContents = this.sortedByDepartment(pillar1Data.eContents || []);
        if (eContents.length) {
            blocks.push(this.sectionTitle('1.2 E-Contents Developed (Faculty & Students)'));
            blocks.push(
                this.createTable(
                    ['S.No', 'Branch', 'YouTube Lecture Videos', 'Other E Contents'],
                    eContents.map((item, index) => [
                        String(index + 1),
                        item.branch || '',
                        String(item.youtubeVideoCount || 0),
                        String((item.otherEContents || []).length)
                    ])
                )
            );
            addSpacer();
        }

        const guestLectures = this.sortedByDepartment(pillar1Data.guestLectures || []);
        const fdps = this.sortedByDepartment(pillar1Data.fdpsOrganized || []);
        const courseSessions = this.sortedByDepartment(pillar1Data.courseFacilitatorSessions || []);
        if (guestLectures.length || fdps.length || courseSessions.length) {
            blocks.push(this.sectionTitle('1.3 Workshops, Seminars, Guest Lectures, FDPs & Course Facilitator Sessions Organized'));
        }

        if (guestLectures.length) {
            blocks.push(this.centerTitle('Guest Lectures Organized'));
            blocks.push(this.paragraph(`Total Number of Guest Lectures Organized: ${guestLectures.length}`, { alignment: AlignmentType.CENTER, bold: true }));
            for (const item of guestLectures) {
                blocks.push(this.paragraph(`Department : ${item.department || ''}`, { bold: true }));
                blocks.push(this.paragraph(`Guest Lecture Title : ${item.workshopTitle || ''}`));
                blocks.push(this.paragraph(`Date : ${this.safeDate(item.date)}`));
                blocks.push(this.paragraph(`Guest : ${`${item.guestName || ''}${item.guestDesignation ? `, ${item.guestDesignation}` : ''}`}`));
                const imageBlock = await this.imageParagraph(item.imagePath);
                if (imageBlock) {
                    blocks.push(imageBlock);
                }
                addSpacer(120);
            }
            addSpacer();
        }

        if (fdps.length) {
            blocks.push(this.centerTitle("FDPs Organized"));
            blocks.push(this.paragraph(`Total Number of FDP's Organized: ${fdps.length}`, { alignment: AlignmentType.CENTER, bold: true }));
            for (const item of fdps) {
                blocks.push(this.paragraph(`Department : ${item.department || ''}`, { bold: true }));
                blocks.push(this.paragraph(`FDP Title : ${item.fdpTitle || ''}`));
                blocks.push(this.paragraph(`Date : ${this.safeDate(item.date)}`));
                blocks.push(this.paragraph(`Sponsored Agency : ${item.sponsoredAgency || ''}`));
                blocks.push(this.paragraph(`Sponsored Amount : ${item.sponsoredAmount || ''}`));
                blocks.push(this.paragraph(`Number of Beneficiary : ${item.numberOfBeneficiaries || 0}`));
                const imageBlock = await this.imageParagraph(item.imagePath);
                if (imageBlock) {
                    blocks.push(imageBlock);
                }
                addSpacer(120);
            }
            addSpacer();
        }

        if (courseSessions.length) {
            blocks.push(this.centerTitle('Course Facilitator Sessions Organized'));
            blocks.push(this.paragraph(`Total Number of Course Facilitator Session's Organized: ${courseSessions.length}`, { alignment: AlignmentType.CENTER, bold: true }));
            for (const item of courseSessions) {
                blocks.push(this.paragraph(`Department : ${item.department || ''}`));
                blocks.push(this.paragraph(`Course Name : ${item.courseName || ''}`));
                blocks.push(this.paragraph(`Date : ${this.safeDate(item.date)}`));
                blocks.push(this.paragraph(`Course Facilitator Details : ${`${item.facilitatorName || ''}${item.facilitatorDesignation ? `, ${item.facilitatorDesignation}` : ''}${item.facilitatorInstitution ? `, ${item.facilitatorInstitution}` : ''}`}`));
                blocks.push(this.paragraph(`Number of Students: ${item.numberOfStudents || 0}`));
                const imageBlock = await this.imageParagraph(item.imagePath);
                if (imageBlock) {
                    blocks.push(imageBlock);
                }
                addSpacer(120);
            }
            addSpacer();
        }

        const facultyEvents = this.sortedByDepartment(pillar1Data.facultyEvents || []);
        if (facultyEvents.length) {
            blocks.push(this.sectionTitle('1.4 Workshop, Seminar, Guest Lecture, FDP & other technical sessions attended by Faculty Members'));
            const eventTypes = ['Workshop', 'Seminar', 'Guest Lecture', 'FDP', 'Others'];
            blocks.push(this.addTypewiseCountTable(facultyEvents, eventTypes));

            blocks.push(...this.addEventTable(facultyEvents.filter((event) => event.eventType === 'Workshop'), 'Workshops Attended', 'Name of the faculty members'));
            blocks.push(...this.addEventTable(facultyEvents.filter((event) => event.eventType === 'Seminar'), 'Seminars Attended', 'Name of the faculty members'));
            blocks.push(...this.addEventTable(facultyEvents.filter((event) => event.eventType === 'Guest Lecture'), 'Guest Lectures Attended', 'Name of the faculty members'));

            const fdpRows = this.addEventTable(facultyEvents.filter((event) => event.eventType === 'FDP'), 'FDPs Attended', 'Name of the faculty members');
            if (fdpRows.length) {
                blocks.push(...fdpRows);
            }

            addSpacer();
        }

        const studentEvents = this.sortedByDepartment(pillar1Data.studentEvents || []);
        if (studentEvents.length) {
            blocks.push(this.sectionTitle('1.5 Workshop, Seminar, Guest Lecture & Course Facilitator Sessions Attended by Students'));
            const studentTypes = ['Workshop', 'Seminar', 'Guest Lecture', 'Course Facilitator Session'];
            blocks.push(this.addTypewiseCountTable(studentEvents, studentTypes));

            blocks.push(...this.addEventTable(studentEvents.filter((event) => event.eventType === 'Workshop'), 'Workshops Attended', 'Name of the students'));
            blocks.push(...this.addEventTable(studentEvents.filter((event) => event.eventType === 'Seminar'), 'Seminars Attended', 'Name of the students'));
            blocks.push(...this.addEventTable(studentEvents.filter((event) => event.eventType === 'Guest Lecture'), 'Guest Lectures Attended', 'Name of the students'));
            blocks.push(...this.addEventTable(studentEvents.filter((event) => event.eventType === 'Course Facilitator Session'), 'Course Facilitator Sessions Attended', 'Name of the students'));

            addSpacer();
        }

        const nptelMooc = this.sortedByDepartment(pillar1Data.nptelMooc || []);
        if (nptelMooc.length) {
            blocks.push(this.sectionTitle('1.6 NPTEL & MOOC Courses (Faculty & Students)'));
            const faculty = nptelMooc.filter((item) => item.category === 'Faculty');
            const students = nptelMooc.filter((item) => item.category === 'Student');

            if (faculty.length) {
                const faculty_sorted = this.sortedByDepartment(faculty);
                blocks.push(this.centerTitle('NPTEL/MOOC Courses (Faculty Members)', 22));
                blocks.push(
                    this.createTable(
                        ['S.No', 'Department', 'Number of courses completed'],
                        faculty_sorted.map((item, index) => [String(index + 1), item.classOrDepartment || '', '1']),
                        { centerBody: true }
                    )
                );
                addSpacer(100);
                blocks.push(this.centerTitle('Details of number of courses completed', 22));
                blocks.push(
                    this.createTable(
                        ['S.No', 'Departments', 'Name of the faculty members', 'Platform', 'Course Name', 'Duration', 'Score/Completed on'],
                        faculty_sorted.map((item, index) => [
                            String(index + 1),
                            item.classOrDepartment || '',
                            item.nameOfPerson || '',
                            item.platform || '',
                            item.courseName || '',
                            item.duration || '',
                            item.scoreOrCompletionDate || ''
                        ])
                    )
                );
                addSpacer(100);
            }

            if (students.length) {
                const students_sorted = this.sortedByDepartment(students);
                blocks.push(this.centerTitle('NPTEL/MOOC Courses (Students)', 22));
                blocks.push(
                    this.createTable(
                        ['S.No', 'Department', 'Number of courses completed'],
                        students_sorted.map((item, index) => [String(index + 1), item.classOrDepartment || '', '1']),
                        { centerBody: true }
                    )
                );
                addSpacer(100);
                blocks.push(this.centerTitle('Details of number of courses completed', 22));
                blocks.push(
                    this.createTable(
                        ['S.No', 'Class', 'Name of the Student members', 'Platform', 'Course Name', 'Duration', 'Score/Completed on'],
                        students_sorted.map((item, index) => [
                            String(index + 1),
                            item.classOrDepartment || '',
                            item.nameOfPerson || '',
                            item.platform || '',
                            item.courseName || '',
                            item.duration || '',
                            item.scoreOrCompletionDate || ''
                        ])
                    )
                );
                addSpacer(100);
            }

            addSpacer();
        }

        const achievements = this.sortedByDepartment(pillar1Data.academicAchievements || []);
        if (achievements.length) {
            blocks.push(this.sectionTitle('1.7 Academic Achievements'));
            blocks.push(
                this.paragraph(
                    'Our students achieved very good results in the End Semester Examinations. The graduation rate details are provided below:',
                    { spacing: { after: 140 } }
                )
            );
            blocks.push(
                this.createTable(
                    ['S.No', 'Branch', 'Appeared', 'Graduated', '% of Graduation'],
                    achievements.map((item, index) => {
                        const appeared = Number(item.appeared || 0);
                        const graduated = Number(item.graduated || 0);
                        const pct = appeared > 0 ? ((graduated / appeared) * 100).toFixed(2) : '0.00';
                        return [String(index + 1), item.branch || '', String(appeared), String(graduated), pct];
                    })
                )
            );

            blocks.push(
                this.paragraph(
                    'Slow learning students in various subjects have been identified and special coaching classes are being conducted to improve their academic performance.',
                    { spacing: { before: 140, after: 100 } }
                )
            );
        }

        await this.appendGenericPillar(blocks, 2, 'CENTER FOR CREATIVITY (CFC)', genericPillars?.[2] || []);
        await this.appendGenericPillar(blocks, 3, 'SKILL & CAREER DEVELOPMENT (SCD)', genericPillars?.[3] || []);
        await this.appendGenericPillar(blocks, 4, 'INDUSTRY INSTITUTE PARTNERSHIP CELL (IIPC)', genericPillars?.[4] || []);
        await this.appendGenericPillar(blocks, 5, 'SOCIAL RESPONSIBILITY INITIATIVES (SRI)', genericPillars?.[5] || []);

        if (!blocks.length) {
            blocks.push(this.paragraph('No data found to generate report. Please add records first.'));
        }

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    footers: {
                        default: this.buildFooter()
                    },
                    children: blocks
                }
            ]
        });
        const docBuffer = await Packer.toBuffer(doc);
        return docBuffer;
    }
}

export default DocumentGenerator;
