import mongoose from 'mongoose';

const guestLectureSchema = new mongoose.Schema({
    serialNo: {
        type: Number,
        required: false,
        default: null
    },
    department: {
        type: String,
        required: true
    },
    workshopTitle: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    guestName: {
        type: String,
        required: true
    },
    guestDesignation: {
        type: String
    },
    academicYear: {
        type: String,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('GuestLecture', guestLectureSchema);
