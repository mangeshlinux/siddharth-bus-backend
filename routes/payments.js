const express = require('express');
const Student = require('../models/Student');
const Notice = require('../models/Notice');
const authMiddleware = require('../middleware/authMiddleware');
const ownerOnly = require('../middleware/ownerOnly');

const router = express.Router();

// ─── POST /api/payments/:studentId ───
// Owner only: Record a payment for a student
router.post('/:studentId', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { amount, mode = 'UPI', term = 'School Bus Transport Term Fee', clearedMonths = [], notes = '' } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Please provide a valid payment amount.' });
    }

    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    // Update fee details
    const newPaid = student.feeDetails.paidAmount + numericAmount;
    const newDue = Math.max(0, student.feeDetails.totalAnnualFee - newPaid);
    const newStatus = newDue === 0 ? 'PAID' : 'PARTIAL';

    // Recalculate Phase 1 & Phase 2
    const p1Target = student.feeDetails.phase1Amount || Math.round(student.feeDetails.totalAnnualFee / 2);
    const p2Target = student.feeDetails.totalAnnualFee - p1Target;
    const p1Paid = Math.min(newPaid, p1Target);
    const p2Paid = Math.max(0, newPaid - p1Target);

    const paymentRecord = {
      receiptNo,
      amount: numericAmount,
      date: today,
      mode,
      term,
      clearedMonths,
      notes
    };

    // Merge cleared months into student feeDetails
    if (Array.isArray(clearedMonths) && clearedMonths.length > 0) {
      if (!student.feeDetails.clearedMonthsList) student.feeDetails.clearedMonthsList = [];
      clearedMonths.forEach(m => {
        if (!student.feeDetails.clearedMonthsList.includes(m)) {
          student.feeDetails.clearedMonthsList.push(m);
        }
      });

      if (Array.isArray(student.feeDetails.monthlyCoverage) && student.feeDetails.monthlyCoverage.length > 0) {
        student.feeDetails.monthlyCoverage.forEach(item => {
          if (clearedMonths.includes(item.month) || clearedMonths.includes(item.fullName)) {
            item.status = 'PAID';
            item.paidAmount = item.targetAmount || 0;
            item.updatedAt = today;
          }
        });
      }
    }

    student.feeDetails.paidAmount = newPaid;
    student.feeDetails.dueAmount = newDue;
    student.feeDetails.status = newStatus;
    student.feeDetails.lastPaymentDate = today;
    student.feeDetails.lastReceiptNo = receiptNo;
    student.feeDetails.paymentMode = mode;
    student.feeDetails.phase1Paid = p1Paid;
    student.feeDetails.phase1Status = p1Paid >= p1Target ? 'PAID' : (p1Paid > 0 ? 'PARTIAL' : 'DUE');
    student.feeDetails.phase2Paid = p2Paid;
    student.feeDetails.phase2Status = p2Paid >= p2Target ? 'PAID' : (p2Paid > 0 ? 'PARTIAL' : 'DUE');
    student.feeDetails.nextDueDate = newDue === 0 ? 'Fully Paid for 2026-27' : '2026-10-15 (Phase 2 Due)';
    student.feeDetails.paymentsHistory.unshift(paymentRecord);

    await student.save();

    const result = student.toObject();
    result.id = result._id.toString();

    res.json({
      success: true,
      receiptNo,
      date: today,
      amount: numericAmount,
      student: result
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to record payment.' });
  }
});

module.exports = router;
