import mongoose from 'mongoose';

const facultyEventSchema = new mongoose.Schema({
    serialNo: {
        type: Number,
        required: false,
        default: null
    },
    facultyName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        enum: ['Workshop', 'Seminar', 'Guest Lecture', 'FDP', 'Others'],
        required: true
    },
    eventTitle: {
        type: String,
        required: true
    },
    onlineOffline: {
        type: String,
        enum: ['Online', 'Offline'],
        required: true
    },
    organizerDetails: {
        type: String,
        required: true
    },
    placeOfEvent: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    academicYear: {
        type: String,
        enum: ['1st year', '2nd year', '3rd year', 'final year'],
        required: true
    },
    month: {
        type: String,
        required: true
    },
    certificatePath: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('FacultyEventAttended', facultyEventSchema);
