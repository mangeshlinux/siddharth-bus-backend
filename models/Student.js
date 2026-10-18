const mongoose = require('mongoose');

const paymentRecordSchema = new mongoose.Schema({
  receiptNo: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  mode: { type: String, default: 'UPI' },
  term: { type: String, default: 'School Bus Transport Term Fee' },
  clearedMonths: [{ type: String }],
  notes: { type: String, default: '' }
}, { _id: true });

const monthCoverageItemSchema = new mongoose.Schema({
  month: { type: String, required: true },
  fullName: { type: String, required: true },
  monthIndex: { type: Number },
  status: { type: String, enum: ['PAID', 'DUE', 'PARTIAL', 'WAIVED'], default: 'DUE' },
  paidAmount: { type: Number, default: 0 },
  targetAmount: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  updatedAt: { type: String, default: null }
}, { _id: false });

const feeDetailsSchema = new mongoose.Schema({
  totalAnnualFee: { type: Number, default: 30000 },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 30000 },
  status: { type: String, enum: ['PAID', 'PARTIAL', 'DUE'], default: 'DUE' },
  clearedMonthsList: [{ type: String }],
  monthlyCoverage: [monthCoverageItemSchema],
  phase1Amount: { type: Number },
  phase1Paid: { type: Number, default: 0 },
  phase1Status: { type: String, enum: ['PAID', 'PARTIAL', 'DUE'], default: 'DUE' },
  phase2Amount: { type: Number },
  phase2Paid: { type: Number, default: 0 },
  phase2Status: { type: String, enum: ['PAID', 'PARTIAL', 'DUE', 'UPCOMING'], default: 'DUE' },
  lastPaymentDate: { type: String, default: null },
  lastReceiptNo: { type: String, default: null },
  nextDueDate: { type: String, default: '2026-10-15 (Phase 2 Due)' },
  paymentMode: { type: String, default: 'UPI' },
  paymentsHistory: [paymentRecordSchema]
}, { _id: false });

const liveStatusSchema = new mongoose.Schema({
  morningStatus: { type: String, default: 'Scheduled' },
  eveningStatus: { type: String, default: 'Scheduled' },
  isLiveOnBus: { type: Boolean, default: false }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  rollNo: { type: String, unique: true, sparse: true },
  parentName: { type: String, required: true, trim: true },
  parentPhone: { type: String, required: true, index: true },
  alternatePhone: { type: String, default: '' },
  email: { type: String, default: '' },
  schoolName: { type: String, required: true },
  schoolId: { type: String, default: '' },
  grade: { type: String, default: 'Grade 1' },
  busNo: { type: String, default: 'Bus #1' },
  busPlate: { type: String, default: '' },
  routeId: { type: String, default: '' },
  routeName: { type: String, default: '' },
  stopName: { type: String, default: 'Designated Stop' },
  pickupTime: { type: String, default: '07:15 AM' },
  dropTime: { type: String, default: '02:30 PM' },
  liveStatus: { type: liveStatusSchema, default: () => ({}) },
  feeDetails: { type: feeDetailsSchema, default: () => ({}) }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-compute phase amounts before save if not set
studentSchema.pre('save', function (next) {
  const fee = this.feeDetails;
  if (!fee.phase1Amount) {
    fee.phase1Amount = Math.round(fee.totalAnnualFee / 2);
  }
  if (!fee.phase2Amount) {
    fee.phase2Amount = fee.totalAnnualFee - fee.phase1Amount;
  }
  fee.dueAmount = Math.max(0, fee.totalAnnualFee - fee.paidAmount);
  fee.status = fee.dueAmount === 0 ? 'PAID' : (fee.paidAmount > 0 ? 'PARTIAL' : 'DUE');
  next();
});

// Virtual 'id' field that maps _id to match frontend expectations
studentSchema.virtual('id').get(function () {
  return this._id.toString();
});

module.exports = mongoose.model('Student', studentSchema);
