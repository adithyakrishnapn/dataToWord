import mongoose from 'mongoose';

const courseFacilitatorSchema = new mongoose.Schema({
    serialNo: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    facilitatorName: {
        type: String,
        required: true
    },
    facilitatorDesignation: {
        type: String
    },
    facilitatorInstitution: {
        type: String
    },
    numberOfStudents: {
        type: Number
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

export default mongoose.model('CourseFacilitatorSession', courseFacilitatorSchema);
