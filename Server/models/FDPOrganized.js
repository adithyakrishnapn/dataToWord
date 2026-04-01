import mongoose from 'mongoose';

const fdpOrganizedSchema = new mongoose.Schema({
    serialNo: {
        type: Number,
        required: false,
        default: null
    },
    department: {
        type: String,
        required: true
    },
    fdpTitle: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    sponsoredAgency: {
        type: String,
        required: true
    },
    sponsoredAmount: {
        type: String
    },
    numberOfBeneficiaries: {
        type: Number,
        required: true
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

export default mongoose.model('FDPOrganized', fdpOrganizedSchema);
