const mongoose = require('mongoose');
const algoliaService = require('../services/algoliaService');

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      enum: ['Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Nothing', 'Motorola', 'Nokia', 'Other'],
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    specs: {
      ram: { type: String },
      storage: { type: String },
      color: { type: String },
      displaySize: { type: String },
      processor: { type: String },
      camera: { type: String },
      battery: { type: String },
      os: { type: String },
      year: { type: Number },
      imei: { type: String, select: false },
      isBlacklisted: { type: Boolean, default: false },
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['Like New', 'Excellent', 'Good', 'Fair', 'Poor'],
    },
    price: {
      asking: { type: Number, required: [true, 'Asking price is required'], min: 0 },
      original: { type: Number, min: 0 },
      negotiable: { type: Boolean, default: true },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    location: {
      city: String,
      state: String,
      country: { type: String, default: 'India' },
    },
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      }
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'active', 'reserved', 'sold', 'rejected', 'inactive'],
      default: 'pending_approval',
    },
    inspectionStatus: {
      type: String,
      enum: ['not_requested', 'requested', 'assigned', 'completed'],
      default: 'not_requested',
    },
    inspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InspectionReport',
      default: null,
    },
    views: { type: Number, default: 0 },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isAdminApproved: { type: Boolean, default: false },
    adminNote: String,
    verifiedByTrustifi: { type: Boolean, default: false },
    verificationReport: { type: String, default: null }, // URL to uploaded report (PDF/image)
    offers: [
      {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: Number,
        status: { type: String, enum: ['pending', 'accepted', 'rejected', 'expired'], default: 'pending' },
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: primary image
listingSchema.virtual('primaryImage').get(function () {
  if (!this.images || !Array.isArray(this.images)) return null;
  const primary = this.images.find((img) => img.isPrimary);
  return primary ? primary.url : this.images[0]?.url || null;
});

// Index for search
listingSchema.index({ geo: '2dsphere' });
listingSchema.index({ brand: 1, status: 1 });
listingSchema.index({ 'price.asking': 1 });
listingSchema.index({ title: 'text', model: 'text', description: 'text' });


// --- Algolia Sync Hooks ---

// Sync on save (Create & Update)
listingSchema.post('save', function (doc) {
  // Fire-and-forget
  algoliaService.saveListingToAlgolia(doc);
});

// Sync on deletion
listingSchema.post('deleteOne', { document: true, query: false }, function (doc) {
  algoliaService.deleteListingFromAlgolia(doc._id.toString());
});

listingSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    algoliaService.deleteListingFromAlgolia(doc._id.toString());
  }
});

// Sync on findOneAndUpdate (used in many controllers)
listingSchema.post('findOneAndUpdate', async function (doc) {
  // If we have the doc, sync it
  if (doc) {
    // Note: To get the UPDATED doc, the controller should use { new: true }
    // If not, we might need to fetch it or just sync what we have.
    // Most controllers in this project don't use { new: true } yet.
    // However, findOneAndUpdate post hook receives the doc that was found.
    algoliaService.saveListingToAlgolia(doc);
  }
});

module.exports = mongoose.model('Listing', listingSchema);
