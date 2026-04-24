const mongoose = require('mongoose');

const inspectionReportSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    scheduledDate: Date,
    completedDate: Date,
    
    // IMEI Verification
    imei: {
      number: { type: String, select: false },
      status: { type: String, enum: ['clean', 'blocked', 'reported', 'unknown'], default: 'unknown' },
      verified: { type: Boolean, default: false },
      registeredCountry: String,
      networkLock: { type: Boolean, default: false },
    },

    // Hardware Condition
    hardware: {
      screenCondition: { type: Number, min: 0, max: 10 },
      bodyCondition: { type: Number, min: 0, max: 10 },
      portsFunctional: { type: Boolean, default: true },
      buttonsFunctional: { type: Boolean, default: true },
      speakerMicFunctional: { type: Boolean, default: true },
      cameraFunctional: { type: Boolean, default: true },
      notes: String,
    },

    // Battery Health
    battery: {
      healthPercentage: { type: Number, min: 0, max: 100 },
      cycleCount: Number,
      isOriginal: { type: Boolean, default: true },
      estimatedLife: String,
    },

    // Parts Authenticity
    parts: {
      screenOriginal: { type: Boolean, default: true },
      batteryOriginal: { type: Boolean, default: true },
      backPanelOriginal: { type: Boolean, default: true },
      cameraOriginal: { type: Boolean, default: true },
      chargingPortOriginal: { type: Boolean, default: true },
      notes: String,
    },

    // Performance Benchmarks
    performance: {
      overallScore: { type: Number, min: 0, max: 100 },
      cpuScore: { type: Number, min: 0, max: 100 },
      gpuScore: { type: Number, min: 0, max: 100 },
      ramScore: { type: Number, min: 0, max: 100 },
      storageSpeed: String,
      antutuScore: Number,
      notes: String,
    },

    // Trust Score (auto-calculated)
    trustScore: {
      overall: { type: Number, min: 0, max: 100 },
      breakdown: {
        imeiScore: { type: Number, min: 0, max: 25 },
        hardwareScore: { type: Number, min: 0, max: 25 },
        batteryScore: { type: Number, min: 0, max: 25 },
        partsScore: { type: Number, min: 0, max: 25 },
      },
      grade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'] },
      verifiedAt: Date,
    },

    // Inspector notes & recommendations
    summary: String,
    recommendations: [String],
    redFlags: [String],
    photos: [String],

    // Admin override
    adminOverride: {
      active: { type: Boolean, default: false },
      newScore: Number,
      reason: String,
      overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InspectionReport', inspectionReportSchema);
