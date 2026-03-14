// server/models/Scan.js - MongoDB Schema for crop disease scans
const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
    userId: { type: String, default: 'anonymous' },
    imageUrl: { type: String, default: '' },
    detectedDisease: { type: String, required: true },
    confidence: { type: Number, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
    source: { type: String, enum: ['Local Trained Model', 'Gemini AI Fallback'], required: true },
    causes: [{ type: String }],
    treatment: [{ type: String }],
    prevention: [{ type: String }],
    pesticides: [{
        name: { type: String },
        description: { type: String },
        purchaseLink: { type: String },
        usageSteps: [{ type: String }],
        priceRange: { type: String },
    }],
    modelError: { type: String, default: null },
    isHealthy: { type: Boolean, default: false },
    affectedAreaPercent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Scan', ScanSchema);
