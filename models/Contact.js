const mongoose = require("mongoose");

// Sub-schema for store location with map coordinates
const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
});

// Sub-schema for uploaded images (store photos)
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String },
  filename: { type: String },
});

const contactSchema = new mongoose.Schema(
  {
    storeName: { 
      type: String, 
      required: true 
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, default: 'India' }
    },
    location: {
      type: locationSchema,
      index: '2dsphere' // Enable geospatial queries
    },
    phone: { type: String },
    email: { type: String },
    images: [imageSchema], // Store photos
    workingHours: {
      monday: { type: String, default: '9:00 AM - 6:00 PM' },
      tuesday: { type: String, default: '9:00 AM - 6:00 PM' },
      wednesday: { type: String, default: '9:00 AM - 6:00 PM' },
      thursday: { type: String, default: '9:00 AM - 6:00 PM' },
      friday: { type: String, default: '9:00 AM - 6:00 PM' },
      saturday: { type: String, default: '9:00 AM - 2:00 PM' },
      sunday: { type: String, default: 'Closed' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
