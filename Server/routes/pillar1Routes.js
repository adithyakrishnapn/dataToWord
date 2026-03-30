import express from 'express';
import upload from '../config/multerConfig.js';
import InnovativeTeaching from '../models/InnovativeTeachingMethodology.js';
import EContent from '../models/EContent.js';
import GuestLecture from '../models/GuestLecture.js';
import FDPOrganized from '../models/FDPOrganized.js';
import CourseFacilitatorSession from '../models/CourseFacilitatorSession.js';
import FacultyEventAttended from '../models/FacultyEventAttended.js';
import StudentEventAttended from '../models/StudentEventAttended.js';
import NPTELMOOCCourse from '../models/NPTELMOOCCourse.js';
import AcademicAchievement from '../models/AcademicAchievement.js';
import DocumentGenerator from '../services/DocumentGenerator.js';

const router = express.Router();

function parseArrayField(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return [];
        }

        try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
        }
    }

    return [];
}

// ==================== SECTION 1: INNOVATIVE TEACHING METHODOLOGIES ====================
router.post('/innovative-teaching', upload.single('image'), async (req, res) => {
    try {
        const { department, courseCode, courseName, topic, teachingMethod } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const teaching = new InnovativeTeaching({
            department,
            courseCode,
            courseName,
            topic,
            teachingMethod,
            imagePath
        });

        await teaching.save();
        res.status(201).json({ message: 'Innovative teaching methodology added', data: teaching });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/innovative-teaching', async (req, res) => {
    try {
        const data = await InnovativeTeaching.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 2: E-CONTENTS ====================
router.post('/e-contents', async (req, res) => {
    try {
        const { serialNo, branch, youtubeVideoCount, youtubeVideoLinks, otherEContents } = req.body;

        const parsedYoutubeLinks = parseArrayField(youtubeVideoLinks).map((item) => String(item));
        const parsedOtherEContents = parseArrayField(otherEContents).map((item) => {
            if (typeof item === 'string') {
                return { title: item, link: '', type: 'other' };
            }

            return {
                title: item?.title || '',
                link: item?.link || '',
                type: item?.type || 'other'
            };
        });

        const eContent = new EContent({
            serialNo: Number(serialNo),
            branch,
            youtubeVideoCount: Number(youtubeVideoCount || 0),
            youtubeVideoLinks: parsedYoutubeLinks,
            otherEContents: parsedOtherEContents
        });

        await eContent.save();
        res.status(201).json({ message: 'E-content added', data: eContent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/e-contents', async (req, res) => {
    try {
        const data = await EContent.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 3.1: GUEST LECTURES ORGANIZED ====================
router.post('/guest-lectures', upload.single('image'), async (req, res) => {
    try {
        const { serialNo, department, workshopTitle, date, guestName, guestDesignation } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const lecture = new GuestLecture({
            serialNo,
            department,
            workshopTitle,
            date,
            guestName,
            guestDesignation,
            imagePath
        });

        await lecture.save();
        res.status(201).json({ message: 'Guest lecture added', data: lecture });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/guest-lectures', async (req, res) => {
    try {
        const data = await GuestLecture.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 3.2: FDPs ORGANIZED ====================
router.post('/fdps-organized', upload.single('image'), async (req, res) => {
    try {
        const { serialNo, department, fdpTitle, date, sponsoredAgency, sponsoredAmount, numberOfBeneficiaries } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const fdp = new FDPOrganized({
            serialNo,
            department,
            fdpTitle,
            date,
            sponsoredAgency,
            sponsoredAmount,
            numberOfBeneficiaries,
            imagePath
        });

        await fdp.save();
        res.status(201).json({ message: 'FDP added', data: fdp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/fdps-organized', async (req, res) => {
    try {
        const data = await FDPOrganized.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 3.3: COURSE FACILITATOR SESSIONS ====================
router.post('/course-facilitator-sessions', upload.single('image'), async (req, res) => {
    try {
        const { serialNo, department, courseName, date, facilitatorName, facilitatorDesignation, facilitatorInstitution, numberOfStudents } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const session = new CourseFacilitatorSession({
            serialNo,
            department,
            courseName,
            date,
            facilitatorName,
            facilitatorDesignation,
            facilitatorInstitution,
            numberOfStudents,
            imagePath
        });

        await session.save();
        res.status(201).json({ message: 'Course facilitator session added', data: session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/course-facilitator-sessions', async (req, res) => {
    try {
        const data = await CourseFacilitatorSession.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 4: FACULTY EVENTS ATTENDED ====================
router.post('/faculty-events', upload.single('certificate'), async (req, res) => {
    try {
        const { serialNo, facultyName, department, eventType, eventTitle, onlineOffline, organizerDetails, placeOfEvent, date } = req.body;
        const certificatePath = req.file ? `/uploads/${req.file.filename}` : null;

        const event = new FacultyEventAttended({
            serialNo,
            facultyName,
            department,
            eventType,
            eventTitle,
            onlineOffline,
            organizerDetails,
            placeOfEvent,
            date,
            certificatePath
        });

        await event.save();
        res.status(201).json({ message: 'Faculty event added', data: event });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/faculty-events', async (req, res) => {
    try {
        const data = await FacultyEventAttended.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 5: STUDENT EVENTS ATTENDED ====================
router.post('/student-events', async (req, res) => {
    try {
        const { serialNo, studentNames, department, eventType, eventTitle, onlineOffline, organizerDetails, placeOfEvent, date, numberOfStudentsAttended } = req.body;

        const event = new StudentEventAttended({
            serialNo,
            studentNames,
            department,
            eventType,
            eventTitle,
            onlineOffline,
            organizerDetails,
            placeOfEvent,
            date,
            numberOfStudentsAttended
        });

        await event.save();
        res.status(201).json({ message: 'Student event added', data: event });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/student-events', async (req, res) => {
    try {
        const data = await StudentEventAttended.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 6: NPTEL/MOOC COURSES ====================
router.post('/nptel-mooc', upload.single('certificate'), async (req, res) => {
    try {
        const { category, serialNo, nameOfPerson, classOrDepartment, platform, courseName, duration, scoreOrCompletionDate } = req.body;
        const certificatePath = req.file ? `/uploads/${req.file.filename}` : null;

        const course = new NPTELMOOCCourse({
            category,
            serialNo,
            nameOfPerson,
            classOrDepartment,
            platform,
            courseName,
            duration,
            scoreOrCompletionDate,
            certificatePath
        });

        await course.save();
        res.status(201).json({ message: 'NPTEL/MOOC course added', data: course });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/nptel-mooc', async (req, res) => {
    try {
        const data = await NPTELMOOCCourse.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SECTION 7: ACADEMIC ACHIEVEMENTS ====================
router.post('/academic-achievements', async (req, res) => {
    try {
        const { serialNo, branch, semesterYear, appeared, graduated } = req.body;

        const achievement = new AcademicAchievement({
            serialNo,
            branch,
            semesterYear,
            appeared,
            graduated,
            graduationPercentage: (graduated / appeared) * 100
        });

        await achievement.save();
        res.status(201).json({ message: 'Academic achievement added', data: achievement });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/academic-achievements', async (req, res) => {
    try {
        const data = await AcademicAchievement.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== DOCUMENT GENERATION ====================
router.get('/generate-report', async (req, res) => {
    try {
        // Fetch all data from all sections
        const [
            innovativeTeaching,
            eContents,
            guestLectures,
            fdpsOrganized,
            courseFacilitatorSessions,
            facultyEvents,
            studentEvents,
            nptelMooc,
            academicAchievements
        ] = await Promise.all([
            InnovativeTeaching.find(),
            EContent.find(),
            GuestLecture.find(),
            FDPOrganized.find(),
            CourseFacilitatorSession.find(),
            FacultyEventAttended.find(),
            StudentEventAttended.find(),
            NPTELMOOCCourse.find(),
            AcademicAchievement.find()
        ]);

        const pillar1Data = {
            innovativeTeaching,
            eContents,
            guestLectures,
            fdpsOrganized,
            courseFacilitatorSessions,
            facultyEvents,
            studentEvents,
            nptelMooc,
            academicAchievements
        };

        const docBuffer = await DocumentGenerator.generateDocument(pillar1Data);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename="Annual_Report_Learning_Teaching.docx"');
        res.send(docBuffer);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
