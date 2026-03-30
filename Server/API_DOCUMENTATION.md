# DataToWord Backend - Pillar 1 API Documentation

## Project Structure
```
Server/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── env.js             # Environment variables
│   └── multerConfig.js    # Image upload configuration
├── models/                # Mongoose schemas for all 7 sections
│   ├── InnovativeTeachingMethodology.js
│   ├── EContent.js
│   ├── GuestLecture.js
│   ├── FDPOrganized.js
│   ├── CourseFacilitatorSession.js
│   ├── FacultyEventAttended.js
│   ├── StudentEventAttended.js
│   ├── NPTELMOOCCourse.js
│   └── AcademicAchievement.js
├── routes/
│   ├── pillar1Routes.js   # All Pillar 1 endpoints
│   └── index.js           # Route aggregation
├── services/
│   └── DocumentGenerator.js  # .docx file generation
├── src/
│   ├── app.js             # Express app setup
│   └── server.js          # Server startup
└── public/
    └── uploads/           # Image storage directory
```

## Database Connection
The backend connects to MongoDB Atlas using Mongoose. Ensure your `.env` file contains:
```
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
PORT=5000
```

## API Endpoints

### BASE URL: `http://localhost:5000/pillar1`

---

## SECTION 1: INNOVATIVE TEACHING METHODOLOGIES

### Add Innovative Teaching Method
**POST** `/innovative-teaching`
- **Form Data:**
  - `department` (text): Department name
  - `courseCode` (text): Course code
  - `courseName` (text): Course name
  - `topic` (text): Topic taught
  - `teachingMethod` (text): Method used (Mindmapping, Flipped Classroom, etc.)
  - `image` (file): Optional image file

**Example cURL:**
```bash
curl -X POST http://localhost:5000/pillar1/innovative-teaching \
  -F "department=Aerospace" \
  -F "courseCode=AERO101" \
  -F "courseName=Aircraft Wing Design" \
  -F "topic=Wing Design" \
  -F "teachingMethod=Mindmapping" \
  -F "image=@path_to_image.jpg"
```

### Get All Innovative Teaching Methods
**GET** `/innovative-teaching`

---

## SECTION 2: E-CONTENTS DEVELOPED

### Add E-Content
**POST** `/e-contents`
- **JSON Body:**
```json
{
  "serialNo": 1,
  "branch": "Aerospace",
  "youtubeVideoCount": 5,
  "youtubeVideoLinks": [
    "https://youtube.com/watch?v=...",
    "https://youtube.com/watch?v=..."
  ],
  "otherEContents": [
    {
      "title": "Advanced Wing Design",
      "link": "https://...",
      "type": "pdf"
    },
    {
      "title": "Aerodynamics Simulation",
      "link": "https://...",
      "type": "video"
    }
  ]
}
```

### Get All E-Contents
**GET** `/e-contents`

---

## SECTION 3.1: GUEST LECTURES ORGANIZED

### Add Guest Lecture
**POST** `/guest-lectures`
- **Form Data:**
  - `serialNo` (number): Serial number
  - `department` (text): Department name
  - `workshopTitle` (text): Title of guest lecture
  - `date` (date): Date of event (YYYY-MM-DD)
  - `guestName` (text): Guest speaker name
  - `guestDesignation` (text): Guest speaker designation
  - `image` (file): Event photograph

---

## SECTION 3.2: FDPs ORGANIZED

### Add FDP Organized
**POST** `/fdps-organized`
- **Form Data:**
  - `serialNo` (number): Serial number
  - `department` (text): Department name
  - `fdpTitle` (text): FDP title
  - `date` (date): Date (YYYY-MM-DD)
  - `sponsoredAgency` (text): Sponsoring agency
  - `sponsoredAmount` (text): Amount sponsored
  - `numberOfBeneficiaries` (number): Number of participants
  - `image` (file): Event photograph

---

## SECTION 3.3: COURSE FACILITATOR SESSIONS

### Add Course Facilitator Session
**POST** `/course-facilitator-sessions`
- **Form Data:**
  - `serialNo` (number): Serial number
  - `department` (text): Department name
  - `courseName` (text): Course name
  - `date` (date): Date (YYYY-MM-DD)
  - `facilitatorName` (text): Facilitator name
  - `facilitatorDesignation` (text): Facilitator designation
  - `facilitatorInstitution` (text): Institution name
  - `numberOfStudents` (number): Students participated
  - `image` (file): Session photograph

---

## SECTION 4: FACULTY EVENTS ATTENDED

### Add Faculty Event
**POST** `/faculty-events`
- **Form Data:**
  - `serialNo` (number): Serial number
  - `facultyName` (text): Faculty member name
  - `department` (text): Department
  - `eventType` (enum): Workshop | Seminar | Guest Lecture | FDP | Others
  - `eventTitle` (text): Event title
  - `onlineOffline` (enum): Online | Offline
  - `organizerDetails` (text): Organizer name and details
  - `placeOfEvent` (text): Event location
  - `date` (date): Date (YYYY-MM-DD)
  - `certificate` (file): Certificate of participation

### Get All Faculty Events
**GET** `/faculty-events`

---

## SECTION 5: STUDENT EVENTS ATTENDED

### Add Student Event
**POST** `/student-events`
- **JSON Body:**
```json
{
  "serialNo": 1,
  "studentNames": ["Name1", "Name2", "Name3"],
  "department": "Aerospace",
  "eventType": "Workshop",
  "eventTitle": "Advanced Aerodynamics Workshop",
  "onlineOffline": "Offline",
  "organizerDetails": "IUCEE",
  "placeOfEvent": "IIT Delhi",
  "date": "2023-09-15",
  "numberOfStudentsAttended": 25
}
```

### Get All Student Events
**GET** `/student-events`

---

## SECTION 6: NPTEL/MOOC COURSES

### Add NPTEL/MOOC Course
**POST** `/nptel-mooc`
- **Form Data:**
  - `category` (enum): Faculty | Student
  - `serialNo` (number): Serial number
  - `nameOfPerson` (text): Name of faculty/student
  - `classOrDepartment` (text): Department or class
  - `platform` (text): NPTEL | Coursera | edX | etc.
  - `courseName` (text): Course name
  - `duration` (text): Duration (e.g., "4 weeks")
  - `scoreOrCompletionDate` (text): Score or completion date
  - `certificate` (file): Certificate file

### Get All NPTEL/MOOC Courses
**GET** `/nptel-mooc`

---

## SECTION 7: ACADEMIC ACHIEVEMENTS

### Add Academic Achievement
**POST** `/academic-achievements`
- **JSON Body:**
```json
{
  "serialNo": 1,
  "branch": "B.S Aerospace",
  "semesterYear": "Even 2023-24",
  "appeared": 150,
  "graduated": 142
}
```
*Note: graduationPercentage is calculated automatically*

### Get All Academic Achievements
**GET** `/academic-achievements`

---

## DOCUMENT GENERATION

### Generate Complete Report (.docx)
**GET** `/generate-report`

This endpoint:
1. Fetches all data from all 7 sections
2. Generates a formatted Word document with tables
3. Returns a .docx file for download

**Response Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="Annual_Report_Learning_Teaching.docx"
```

**Example:**
```bash
curl -X GET http://localhost:5000/pillar1/generate-report \
  -o Annual_Report.docx
```

---

## Image Upload Details

- **Location:** Uploaded images are stored in `Server/public/uploads/`
- **Max Size:** 5MB per image
- **Allowed Formats:** JPEG, PNG, GIF, WebP
- **Access:** Images are accessible via `/uploads/{filename}`

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- **200**: Success
- **201**: Resource created successfully
- **400**: Bad request (validation error)
- **500**: Server error

**Error Response Format:**
```json
{
  "error": "Error message describing the issue"
}
```

---

## Testing the API

### Using Postman:
1. Import the endpoints as shown above
2. Set request type (GET/POST)
3. Add form data or JSON body as specified
4. For file uploads, select "File" type in form data
5. Send request and verify response

### Using cURL:
See examples provided above for each endpoint

### Using Node.js fetch():
```javascript
const formData = new FormData();
formData.append('department', 'Aerospace');
formData.append('courseCode', 'AERO101');
formData.append('courseName', 'Aircraft Design');
formData.append('topic', 'Wing Design');
formData.append('teachingMethod', 'Mindmapping');
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:5000/pillar1/innovative-teaching', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

---

## Next Steps for Additional Pillars

When ready to add the remaining 4 pillars, simply:
1. Create new model files for each pillar's sections
2. Create new route files (pillar2Routes.js, pillar3Routes.js, etc.)
3. Update DocumentGenerator.js to include new sections
4. Register new routes in index.js

The structure is scalable and follows the same pattern for consistency.
