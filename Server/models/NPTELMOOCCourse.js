import mongoose from 'mongoose';

const nptelMoocSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['Faculty', 'Student'],
        required: true
    },
    serialNo: {
        type: Number,
        required: true
    },
    nameOfPerson: {
        type: String,
        required: true
    },
    classOrDepartment: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: true // NPTEL, Coursera, edX, etc.
    },
    courseName: {
        type: String,
        required: true
    },
    duration: {
        type: String
    },
    scoreOrCompletionDate: {
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

export default mongoose.model('NPTELMOOCCourse', nptelMoocSchema);
