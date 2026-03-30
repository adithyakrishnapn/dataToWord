# Quick Start Guide - DataToWord Backend

## What's Been Built

✅ **Complete Pillar 1 Implementation** for "Center for Learning and Teaching" with:
- 9 MongoDB schemas for all 7 sections
- 30+ API endpoints for data collection
- Automatic .docx document generation with formatted tables
- Image upload system (5MB limit per file)
- Full documentation and code examples

---

## To Start Using the Backend

### 1. Fix MongoDB Connection
```bash
# In MongoDB Atlas:
1. Log in to https://cloud.mongodb.com
2. Go to Network Access
3. Add your current IP address OR use 0.0.0.0/0 (not recommended for production)
4. Verify DB_URL in .env file is correct
```

### 2. Start the Server
```bash
cd d:\Projects\DataToWord\Server
npm run dev
```

**Expected Output:**
```
Server is running on port 5000
Connected to DB
```

### 3. Test an Endpoint (Using Postman or cURL)

**Example: Add Innovative Teaching Method**
```bash
POST http://localhost:5000/pillar1/innovative-teaching

Form Data:
- department: Aerospace
- courseCode: AERO101
- courseName: Aircraft Design
- topic: Wing Design
- teachingMethod: Mindmapping
- image: (upload image file)
```

### 4. Generate Document
```bash
GET http://localhost:5000/pillar1/generate-report
# Downloads Annual_Report_Learning_Teaching.docx
```

---

## API Endpoints Overview

### Data Collection (All at `/pillar1/` base URL)

| Section | POST Endpoint | GET Endpoint |
|---------|---------------|--------------|
| 1 | `/innovative-teaching` | `/innovative-teaching` |
| 2 | `/e-contents` | `/e-contents` |
| 3.1 | `/guest-lectures` | `/guest-lectures` |
| 3.2 | `/fdps-organized` | `/fdps-organized` |
| 3.3 | `/course-facilitator-sessions` | `/course-facilitator-sessions` |
| 4 | `/faculty-events` | `/faculty-events` |
| 5 | `/student-events` | `/student-events` |
| 6 | `/nptel-mooc` | `/nptel-mooc` |
| 7 | `/academic-achievements` | `/academic-achievements` |
| **Report** | — | `/generate-report` |

---

## File Organization

- **Uploaded Images:** Stored in `Server/public/uploads/`
- **Access via URL:** `http://localhost:5000/uploads/image-name.jpg`
- **Database References:** Image paths stored in MongoDB

---

## Database Schema Example

```javascript
// InnovativeTeachingMethodology Document
{
  _id: ObjectId("..."),
  department: "Aerospace",
  courseCode: "AERO101",
  courseName: "Aircraft Wing Design",
  topic: "Wing Design",
  teachingMethod: "Mindmapping",
  imagePath: "/uploads/image-1711788000000-123456789.jpg",
  createdAt: "2024-03-30T10:00:00.000Z"
}
```

---

## Document Output Sample

When you call `/generate-report`, it generates a Word document with:

```
ANNUAL REPORT - CENTER FOR LEARNING AND TEACHING

1. INNOVATIVE TEACHING METHODOLOGIES
[Table with Department | Course | Topic | Method]

2. E-CONTENTS DEVELOPED (FACULTY & STUDENTS)
[Table with Branch | YouTube Videos | E-Contents]

3.1 GUEST LECTURES ORGANIZED
[Table with Department | Title | Guest | Date]

3.2 FDP'S ORGANIZED
[Table with Department | Title | Agency | Beneficiaries | Date]

3.3 COURSE FACILITATOR SESSIONS ORGANIZED
[Table with Department | Course | Facilitator | Date]

4. FACULTY EVENTS ATTENDED
[Multiple tables by event type]

5. STUDENT EVENTS ATTENDED
[Multiple tables by event type]

6.1 NPTEL/MOOC COURSES (FACULTY)
[Table with Faculty | Platform | Course | Score]

6.2 NPTEL/MOOC COURSES (STUDENTS)
[Table with Student | Platform | Course | Score]

7. ACADEMIC ACHIEVEMENTS
[Table with Branch | Appeared | Graduated | %]
```

---

## Common Workflows

### Workflow 1: Add Single Record
```
1. POST to `/innovative-teaching` → Record saved to DB
2. GET `/innovative-teaching` → Retrieve all records
3. Record automatically included in next report
```

### Workflow 2: Generate Complete Report
```
1. Enter data across all sections
2. GET `/generate-report`
3. Document generated with all data
4. .docx file automatically downloaded
```

### Workflow 3: Upload Images
```
1. Attach image in form POST request
2. Multer validates (JPEG/PNG/GIF/WebP, max 5MB)
3. Image saved to /public/uploads/
4. Path stored in DB document
```

---

## Required Environment Variables

In `.env` file (already configured):
```
DB_URL=mongodb+srv://adithya:AS-zVCy3PQU7Lh-@cluster0.lriezn4.mongodb.net/?appName=Cluster0
PORT=5000
```

---

## Adding More Data (For Remaining 4 Pillars)

Following the same structure for Pillar 2-5:

1. Create models in `/models/` directory
2. Create routes in `/routes/pillar2Routes.js` (etc.)
3. Update DocumentGenerator.js for new sections
4. Import in `/routes/index.js`

---

## Documentation Files

📄 **API_DOCUMENTATION.md** - Complete endpoint reference with cURL examples
📄 **IMPLEMENTATION_GUIDE.md** - System architecture and technical details

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "ECONNREFUSED" MongoDB | Add IP to MongoDB Atlas Network Access |
| Images not uploading | Check file size (<5MB) and format (JPEG/PNG/GIF/WebP) |
| Port 5000 already in use | Change PORT in .env or kill existing process |
| Module not found error | Run `npm install` in Server directory |
| Static files not accessible | Check `express.static()` path in app.js |

---

## Next: Frontend Development

When ready to build the frontend, the endpoints are fully ready to accept:
- Form submissions
- Image uploads
- Data retrieval
- Document downloads

Example form submission (HTML + Fetch):
```javascript
const formData = new FormData();
formData.append('department', document.getElementById('dept').value);
formData.append('courseCode', document.getElementById('code').value);
formData.append('courseName', document.getElementById('name').value);
formData.append('topic', document.getElementById('topic').value);
formData.append('teachingMethod', document.getElementById('method').value);
formData.append('image', document.getElementById('imageFile').files[0]);

fetch('http://localhost:5000/pillar1/innovative-teaching', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

---

**Status:** ✅ Pillar 1 Backend Complete & Ready for Testing
