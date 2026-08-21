const mongoose = require('mongoose');

const fleetSchema = new mongoose.Schema({
  busNo: { type: String, required: true },
  plate: { type: String, required: true },
  model: { type: String },
  driverName: { type: String },
  driverPhone: { type: String },
  routeId: { type: String },
  routeName: { type: String },
  status: { type: String, default: 'On Route' },
  speed: { type: String, default: '0 km/h' },
  currentLocation: { type: String },
  etaNextStop: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

fleetSchema.virtual('id').get(function () {
  return this._id.toString();
});

module.exports = mongoose.model('Fleet', fleetSchema);
