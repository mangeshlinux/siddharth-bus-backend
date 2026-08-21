const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  location: { type: String },
  contact: { type: String },
  activeStudents: { type: Number, default: 0 },
  busAssigned: { type: [String], default: [] }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

schoolSchema.virtual('id').get(function () {
  return this._id.toString();
});

module.exports = mongoose.model('School', schoolSchema);
