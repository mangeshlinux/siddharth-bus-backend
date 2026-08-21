const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  target: { type: String, default: 'All Parents' },
  type: { type: String, default: 'INFO' },
  date: { type: String },
  time: { type: String },
  urgent: { type: Boolean, default: false },
  sentVia: { type: [String], default: ['In-App Broadcast'] },
  isPaymentReceipt: { type: Boolean, default: false },
  receiptData: { type: mongoose.Schema.Types.Mixed, default: null }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

noticeSchema.virtual('id').get(function () {
  return this._id.toString();
});

module.exports = mongoose.model('Notice', noticeSchema);
