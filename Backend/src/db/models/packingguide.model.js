import mongoose from 'mongoose';

const essentialItemSchema = new mongoose.Schema({
  item: { type: String, required: true, trim: true },
  icon: { type: String, default: '📦' },
  required: { type: Boolean, default: true },
}, { _id: false });

const clothingItemSchema = new mongoose.Schema({
  item: { type: String, required: true, trim: true },
  notes: { type: String, trim: true },
}, { _id: false });

const safetyTipSchema = new mongoose.Schema({
  tip: { type: String, required: true, trim: true },
  severity: { type: String, enum: ['info', 'warning', 'danger'], default: 'info' },
}, { _id: false });

const packingGuideSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  activityType: {
    type: String,
    enum: ['diving', 'hiking', 'desert', 'beach', 'cultural', 'adventure', 'wellness', 'general'],
    required: true,
  },

  // Priority: experience > destination > activityType (template)
  experience: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experience',
    default: null,
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    default: null,
  },

  essentials: [essentialItemSchema],
  clothing:   [clothingItemSchema],

  safetyTips: [safetyTipSchema],

  emergencyContacts: {
    police:       { type: String, default: '122' },
    ambulance:    { type: String, default: '123' },
    coastGuard:   { type: String, default: '16666' },
    localHospital:{ type: String, default: '' },
  },

  difficultyLevel: {
    type: String,
    enum: ['easy', 'moderate', 'challenging', 'expert'],
    default: 'moderate',
  },

  physicalRequirements: { type: String, trim: true, default: '' },
  weatherWarnings: [{ type: String, trim: true }],
}, { timestamps: true });

export const PackingGuide = mongoose.model('PackingGuide', packingGuideSchema);
