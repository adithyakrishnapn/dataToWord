import mongoose from 'mongoose';

const studentEventSchema = new mongoose.Schema({
    serialNo: {
        type: Number,
        required: true
    },
    studentNames: [{
        type: String
    }],
    department: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        enum: ['Workshop', 'Seminar', 'Guest Lecture', 'Course Facilitator Session', 'Others'],
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
    numberOfStudentsAttended: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('StudentEventAttended', studentEventSchema);
