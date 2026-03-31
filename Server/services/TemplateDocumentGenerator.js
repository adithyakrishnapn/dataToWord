import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NS_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';

class TemplateDocumentGenerator {
    static templatePath() {
        return path.join(__dirname, '..', 'templates', 'Annual Report Format 2025-26.docx');
    }

    static sorted(items = []) {
        return [...items].sort((a, b) => Number(a?.serialNo || 0) - Number(b?.serialNo || 0));
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
        return `${day}.${month}.${year}`;
    }

    static resolveUploadPath(storedPath) {
        if (!storedPath || typeof storedPath !== 'string') {
            return null;
        }

        if (path.isAbsolute(storedPath)) {
            return storedPath;
        }

        const normalized = storedPath.replace(/^[/\\]+/, '');
        return path.join(__dirname, '..', 'public', normalized);
    }

    static normalizeText(value) {
        return String(value || '')
            .replace(/&amp;/gi, '&')
            .replace(/\s+/g, ' ')
            .replace(/[.:,_'"()/-]/g, '')
            .trim()
            .toLowerCase();
    }

    static textFromNode(node) {
        if (!node) return '';
        const texts = node.getElementsByTagName('w:t');
        let result = '';
        for (let i = 0; i < texts.length; i += 1) {
            result += texts[i].textContent || '';
        }
        return result;
    }

    static setNodeText(node, value) {
        const texts = node.getElementsByTagName('w:t');
        if (!texts.length) {
            return;
        }

        texts[0].textContent = String(value ?? '');
        for (let i = 1; i < texts.length; i += 1) {
            texts[i].textContent = '';
        }
    }

    static getDirectChildrenByTag(node, tagName) {
        const result = [];
        if (!node || !node.childNodes) {
            return result;
        }

        for (let i = 0; i < node.childNodes.length; i += 1) {
            const child = node.childNodes[i];
            if (child.nodeType === 1 && child.nodeName === tagName) {
                result.push(child);
            }
        }
        return result;
    }

    static tableHeaders(table) {
        const rows = this.getDirectChildrenByTag(table, 'w:tr');
        if (!rows.length) return [];
        const cells = this.getDirectChildrenByTag(rows[0], 'w:tc');
        return cells.map((cell) => this.normalizeText(this.textFromNode(cell)));
    }

    static findTablesByHeaders(doc, headerKeywords) {
        const tables = doc.getElementsByTagName('w:tbl');
        const matches = [];

        for (let i = 0; i < tables.length; i += 1) {
            const headers = this.tableHeaders(tables[i]);
            const ok = headerKeywords.every((keyword) =>
                headers.some((header) => header.includes(this.normalizeText(keyword)))
            );
            if (ok) {
                matches.push(tables[i]);
            }
        }

        return matches;
    }

    static setTableRows(table, rowsData = []) {
        const rows = this.getDirectChildrenByTag(table, 'w:tr');
        if (!rows.length) return;

        const headerRow = rows[0];
        const templateRow = rows[1] ? rows[1].cloneNode(true) : headerRow.cloneNode(true);

        for (let i = rows.length - 1; i >= 1; i -= 1) {
            table.removeChild(rows[i]);
        }

        const safeRows = rowsData.length ? rowsData : [['', '', '', '', '', '', '']];

        safeRows.forEach((dataRow) => {
            const newRow = templateRow.cloneNode(true);
            const cells = this.getDirectChildrenByTag(newRow, 'w:tc');
            for (let i = 0; i < cells.length; i += 1) {
                this.setNodeText(cells[i], dataRow[i] ?? '');
            }
            table.appendChild(newRow);
        });

        if (!headerRow.parentNode) {
            table.insertBefore(headerRow, table.firstChild);
        }
    }

    static replaceParagraphByPattern(doc, pattern, value, startIndex = 0) {
        const paragraphs = doc.getElementsByTagName('w:p');
        const normalizedPattern = this.normalizeText(pattern);

        for (let i = startIndex; i < paragraphs.length; i += 1) {
            const text = this.normalizeText(this.textFromNode(paragraphs[i]));
            if (text.includes(normalizedPattern)) {
                this.setNodeText(paragraphs[i], value);
                return i + 1;
            }
        }

        return startIndex;
    }

    static async replaceTemplateImages(zip, docXml, relsXml, pillar1Data) {
        const relsDoc = new DOMParser().parseFromString(relsXml, 'text/xml');
        const relNodes = relsDoc.getElementsByTagName('Relationship');
        const relMap = new Map();

        for (let i = 0; i < relNodes.length; i += 1) {
            const rel = relNodes[i];
            const relId = rel.getAttribute('Id');
            const relType = rel.getAttribute('Type') || '';
            const target = rel.getAttribute('Target') || '';
            if (relType.includes('/image') && relId && target) {
                relMap.set(relId, target);
            }
        }

        const embedIds = [];
        const embedRegex = /r:embed="(rId\d+)"/g;
        let match;
        while ((match = embedRegex.exec(docXml))) {
            if (!embedIds.includes(match[1])) {
                embedIds.push(match[1]);
            }
        }

        const uploadPaths = [];
        const innovative = this.sorted(pillar1Data.innovativeTeaching || []);
        const guestLectures = this.sorted(pillar1Data.guestLectures || []);
        const fdps = this.sorted(pillar1Data.fdpsOrganized || []);
        const courseSessions = this.sorted(pillar1Data.courseFacilitatorSessions || []);

        if (innovative[0]?.imagePath) uploadPaths.push(innovative[0].imagePath);
        if (guestLectures[0]?.imagePath) uploadPaths.push(guestLectures[0].imagePath);
        if (fdps[0]?.imagePath) uploadPaths.push(fdps[0].imagePath);
        if (courseSessions[0]?.imagePath) uploadPaths.push(courseSessions[0].imagePath);

        for (let i = 0; i < uploadPaths.length && i < embedIds.length; i += 1) {
            const srcPath = this.resolveUploadPath(uploadPaths[i]);
            if (!srcPath) continue;

            try {
                const imageBuffer = await fs.readFile(srcPath);
                const pngBuffer = await sharp(imageBuffer).png().toBuffer();
                const relTarget = relMap.get(embedIds[i]);
                if (!relTarget) continue;

                zip.file(`word/${relTarget}`, pngBuffer);
            } catch {
                // Skip invalid images and keep template media as fallback.
            }
        }
    }

    static buildFacultyRows(events) {
        return this.sorted(events).map((item, index) => [
            String(item.serialNo || index + 1),
            item.facultyName || '',
            item.department || '',
            `${item.eventTitle || ''}${item.onlineOffline ? ` (${item.onlineOffline})` : ''}`,
            `${item.organizerDetails || ''}${item.placeOfEvent ? `, ${item.placeOfEvent}` : ''}`,
            this.safeDate(item.date)
        ]);
    }

    static buildStudentRows(events) {
        return this.sorted(events).map((item, index) => [
            String(item.serialNo || index + 1),
            Array.isArray(item.studentNames) ? item.studentNames.join(', ') : item.studentNames || '',
            item.department || '',
            `${item.eventTitle || ''}${item.onlineOffline ? ` (${item.onlineOffline})` : ''}`,
            `${item.organizerDetails || ''}${item.placeOfEvent ? `, ${item.placeOfEvent}` : ''}`,
            this.safeDate(item.date)
        ]);
    }

    static countRows(events, types) {
        return types.map((type, index) => [
            String(index + 1),
            type,
            String(events.filter((event) => event?.eventType === type).length)
        ]);
    }

    static async generateDocument(pillar1Data) {
        const templateBuffer = await fs.readFile(this.templatePath());
        const zip = await JSZip.loadAsync(templateBuffer);

        const docXml = await zip.file('word/document.xml').async('string');
        const relsXml = await zip.file('word/_rels/document.xml.rels').async('string');
        const doc = new DOMParser().parseFromString(docXml, 'text/xml');

        const innovative = this.sorted(pillar1Data.innovativeTeaching || []);
        const eContents = this.sorted(pillar1Data.eContents || []);
        const guestLectures = this.sorted(pillar1Data.guestLectures || []);
        const fdps = this.sorted(pillar1Data.fdpsOrganized || []);
        const courseSessions = this.sorted(pillar1Data.courseFacilitatorSessions || []);
        const facultyEvents = this.sorted(pillar1Data.facultyEvents || []);
        const studentEvents = this.sorted(pillar1Data.studentEvents || []);
        const nptelMooc = this.sorted(pillar1Data.nptelMooc || []);
        const achievements = this.sorted(pillar1Data.academicAchievements || []);

        let cursor = 0;
        if (innovative.length) {
            cursor = this.replaceParagraphByPattern(doc, 'Department', `Department\t\t: ${innovative[0].department || ''}`, cursor);
            cursor = this.replaceParagraphByPattern(doc, 'Course Code & Name', `Course Code & Name\t: ${`${innovative[0].courseCode || ''} ${innovative[0].courseName || ''}`.trim()}`, cursor);
            cursor = this.replaceParagraphByPattern(doc, 'Topic', `Topic\t\t\t: ${innovative[0].topic || ''}`, cursor);
            cursor = this.replaceParagraphByPattern(doc, 'Teaching Method', `Teaching Method\t: ${innovative[0].teachingMethod || ''}`, cursor);
        }

        cursor = this.replaceParagraphByPattern(doc, 'Total Number of Guest Lectures Organized', `Total Number of Guest Lectures Organized: ${guestLectures.length}`, 0);
        cursor = this.replaceParagraphByPattern(doc, "Total Number of FDP's Organized", `Total Number of FDP's Organized: ${fdps.length}`, 0);
        cursor = this.replaceParagraphByPattern(doc, "Total Number of Course Facilitator Session's Organized", `Total Number of Course Facilitator Session's Organized: ${courseSessions.length}`, 0);

        if (guestLectures.length) {
            cursor = this.replaceParagraphByPattern(doc, 'Guest Lecture Title', `Guest Lecture Title\t: ${guestLectures[0].workshopTitle || ''}`, 0);
            cursor = this.replaceParagraphByPattern(doc, 'Date', `Date\t\t\t: ${this.safeDate(guestLectures[0].date)}`, cursor);
            cursor = this.replaceParagraphByPattern(doc, 'Guest', `Guest\t\t\t: ${`${guestLectures[0].guestName || ''}${guestLectures[0].guestDesignation ? `, ${guestLectures[0].guestDesignation}` : ''}`}`, cursor);
        }

        if (fdps.length) {
            cursor = this.replaceParagraphByPattern(doc, 'FDP Title', `FDP Title\t\t: ${fdps[0].fdpTitle || ''}`, 0);
            cursor = this.replaceParagraphByPattern(doc, 'Sponsored Agency', `Sponsored Agency\t: ${fdps[0].sponsoredAgency || ''}`, cursor);
            cursor = this.replaceParagraphByPattern(doc, 'Sponsored Amount', `Sponsored Amount\t: ${fdps[0].sponsoredAmount || ''}`, cursor);
            cursor = this.replaceParagraphByPattern(doc, 'Number of Beneficiary', `Number of Beneficiary: ${fdps[0].numberOfBeneficiaries || 0}`, cursor);
        }

        if (courseSessions.length) {
            cursor = this.replaceParagraphByPattern(doc, 'Course Name', `Course Name\t\t: ${courseSessions[0].courseName || ''}`, 0);
            cursor = this.replaceParagraphByPattern(
                doc,
                'Course Facilitator Details',
                `Course Facilitator Details\t: ${`${courseSessions[0].facilitatorName || ''}${courseSessions[0].facilitatorDesignation ? `, ${courseSessions[0].facilitatorDesignation}` : ''}${courseSessions[0].facilitatorInstitution ? `, ${courseSessions[0].facilitatorInstitution}` : ''}`}`,
                cursor
            );
        }

        const eContentTables = this.findTablesByHeaders(doc, ['s.no', 'branch', 'youtube', 'other']);
        if (eContentTables[0]) {
            this.setTableRows(
                eContentTables[0],
                eContents.map((item, index) => [
                    String(item.serialNo || index + 1),
                    item.branch || '',
                    String(item.youtubeVideoCount || 0),
                    String((item.otherEContents || []).length)
                ])
            );
        }

        const countTables = this.findTablesByHeaders(doc, ['s.no', 'event type', 'attended']);
        if (countTables[0]) {
            this.setTableRows(countTables[0], this.countRows(facultyEvents, ['Workshop', 'Seminar', 'Guest Lecture', 'Faculty Development Programs', 'Others']));
        }
        if (countTables[1]) {
            this.setTableRows(countTables[1], this.countRows(studentEvents, ['Workshop', 'Seminar', 'Guest Lecture', 'Course Facilitator Sessions']));
        }

        const facultyDetailTables = this.findTablesByHeaders(doc, ['name of the faculty members', 'departments']);
        const facultyByType = {
            Workshop: facultyEvents.filter((event) => event.eventType === 'Workshop'),
            Seminar: facultyEvents.filter((event) => event.eventType === 'Seminar'),
            'Guest Lecture': facultyEvents.filter((event) => event.eventType === 'Guest Lecture'),
            FDP: facultyEvents.filter((event) => event.eventType === 'FDP')
        };

        const facultyOrder = ['Workshop', 'Seminar', 'Guest Lecture', 'FDP'];
        facultyOrder.forEach((type, index) => {
            if (facultyDetailTables[index]) {
                this.setTableRows(facultyDetailTables[index], this.buildFacultyRows(facultyByType[type]));
            }
        });

        const studentDetailTables = this.findTablesByHeaders(doc, ['name of the students', 'departments']);
        const studentByType = {
            Workshop: studentEvents.filter((event) => event.eventType === 'Workshop'),
            Seminar: studentEvents.filter((event) => event.eventType === 'Seminar'),
            'Guest Lecture': studentEvents.filter((event) => event.eventType === 'Guest Lecture'),
            'Course Facilitator Session': studentEvents.filter((event) => event.eventType === 'Course Facilitator Session')
        };

        const studentOrder = ['Workshop', 'Seminar', 'Guest Lecture', 'Course Facilitator Session'];
        studentOrder.forEach((type, index) => {
            if (studentDetailTables[index]) {
                this.setTableRows(studentDetailTables[index], this.buildStudentRows(studentByType[type]));
            }
        });

        const nptelFaculty = nptelMooc.filter((item) => item.category === 'Faculty');
        const nptelStudents = nptelMooc.filter((item) => item.category === 'Student');

        const nptelSummaryTables = this.findTablesByHeaders(doc, ['s.no', 'department', 'number of courses completed']);
        if (nptelSummaryTables[0]) {
            this.setTableRows(
                nptelSummaryTables[0],
                nptelFaculty.map((item, index) => [String(index + 1), item.classOrDepartment || '', '1'])
            );
        }
        if (nptelSummaryTables[1]) {
            this.setTableRows(
                nptelSummaryTables[1],
                nptelStudents.map((item, index) => [String(index + 1), item.classOrDepartment || '', '1'])
            );
        }

        const nptelFacultyDetailTables = this.findTablesByHeaders(doc, ['name of the faculty members', 'platform', 'course name']);
        if (nptelFacultyDetailTables[0]) {
            this.setTableRows(
                nptelFacultyDetailTables[0],
                nptelFaculty.map((item, index) => [
                    String(item.serialNo || index + 1),
                    item.classOrDepartment || '',
                    item.nameOfPerson || '',
                    item.platform || '',
                    item.courseName || '',
                    item.duration || '',
                    item.scoreOrCompletionDate || ''
                ])
            );
        }

        const nptelStudentDetailTables = this.findTablesByHeaders(doc, ['name of the student members', 'platform', 'course name']);
        if (nptelStudentDetailTables[0]) {
            this.setTableRows(
                nptelStudentDetailTables[0],
                nptelStudents.map((item, index) => [
                    String(item.serialNo || index + 1),
                    item.classOrDepartment || '',
                    item.nameOfPerson || '',
                    item.platform || '',
                    item.courseName || '',
                    item.duration || '',
                    item.scoreOrCompletionDate || ''
                ])
            );
        }

        const achievementTables = this.findTablesByHeaders(doc, ['s.no', 'branch', 'appeared', 'graduated']);
        if (achievementTables[0]) {
            this.setTableRows(
                achievementTables[0],
                achievements.map((item, index) => {
                    const appeared = Number(item.appeared || 0);
                    const graduated = Number(item.graduated || 0);
                    const pct = appeared > 0 ? ((graduated / appeared) * 100).toFixed(2) : '0.00';
                    return [String(item.serialNo || index + 1), item.branch || '', String(appeared), String(graduated), pct];
                })
            );
        }

        const updatedDocXml = new XMLSerializer().serializeToString(doc);
        zip.file('word/document.xml', updatedDocXml);
        await this.replaceTemplateImages(zip, updatedDocXml, relsXml, pillar1Data);

        return zip.generateAsync({ type: 'nodebuffer' });
    }
}

export default TemplateDocumentGenerator;
