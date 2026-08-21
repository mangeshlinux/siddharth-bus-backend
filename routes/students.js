const express = require('express');
const Student = require('../models/Student');
const authMiddleware = require('../middleware/authMiddleware');
const ownerOnly = require('../middleware/ownerOnly');

const router = express.Router();

// ─── GET /api/students ───
// Owner: Get all students | Parent: Get only their children
router.get('/', authMiddleware, async (req, res) => {
  try {
    let students;

    if (req.user.role === 'OWNER') {
      students = await Student.find().sort({ createdAt: -1 }).lean();
    } else if (req.user.role === 'PARENT') {
      students = await Student.find({
        $or: [
          { parentPhone: req.user.phone },
          { alternatePhone: req.user.phone }
        ]
      }).lean();
    } else {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Map _id → id for frontend compatibility
    const result = students.map(s => ({ ...s, id: s._id.toString() }));
    res.json(result);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
});

// ─── GET /api/students/by-phone/:phone ───
// Get students linked to a specific parent phone
router.get('/by-phone/:phone', authMiddleware, async (req, res) => {
  try {
    const cleanPhone = req.params.phone.replace(/\D/g, '').slice(-10);
    const students = await Student.find({
      $or: [
        { parentPhone: cleanPhone },
        { alternatePhone: cleanPhone }
      ]
    }).lean();

    const result = students.map(s => ({ ...s, id: s._id.toString() }));
    res.json(result);
  } catch (error) {
    console.error('Get students by phone error:', error);
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
});

// ─── POST /api/students ───
// Owner only: Add a new student
router.post('/', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const data = req.body;

    // Clean phone number
    const cleanPhone = (data.parentPhone || '').replace(/\D/g, '').slice(-10);

    // Build fee details with Phase 1 / Phase 2
    const totalFee = Number(data.feeDetails?.totalAnnualFee || data.totalAnnualFee || 30000);
    const paidAmount = Number(data.feeDetails?.paidAmount || data.paidAmount || 0);
    const dueAmount = Math.max(0, totalFee - paidAmount);
    const p1Target = Math.round(totalFee / 2);
    const p2Target = totalFee - p1Target;
    const p1Paid = Math.min(paidAmount, p1Target);
    const p2Paid = Math.max(0, paidAmount - p1Target);

    const student = new Student({
      studentName: data.studentName,
      rollNo: data.rollNo || `NSK-${Date.now().toString().slice(-4)}`,
      parentName: data.parentName,
      parentPhone: cleanPhone,
      alternatePhone: data.alternatePhone ? data.alternatePhone.replace(/\D/g, '').slice(-10) : '',
      email: data.email || '',
      schoolName: data.schoolName,
      schoolId: data.schoolId || '',
      grade: data.grade || 'Grade 1',
      busNo: data.busNo || 'Bus #1',
      busPlate: data.busPlate || '',
      routeId: data.routeId || '',
      routeName: data.routeName || '',
      stopName: data.stopName || 'Designated Stop',
      pickupTime: data.pickupTime || '07:15 AM',
      dropTime: data.dropTime || '02:30 PM',
      liveStatus: data.liveStatus || {
        morningStatus: 'Scheduled',
        eveningStatus: 'Scheduled',
        isLiveOnBus: false
      },
      feeDetails: {
        totalAnnualFee: totalFee,
        paidAmount,
        dueAmount,
        status: dueAmount === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'DUE'),
        phase1Amount: p1Target,
        phase1Paid: p1Paid,
        phase1Status: p1Paid >= p1Target ? 'PAID' : (p1Paid > 0 ? 'PARTIAL' : 'DUE'),
        phase2Amount: p2Target,
        phase2Paid: p2Paid,
        phase2Status: p2Paid >= p2Target ? 'PAID' : (p2Paid > 0 ? 'PARTIAL' : 'DUE'),
        lastPaymentDate: paidAmount > 0 ? new Date().toISOString().split('T')[0] : null,
        lastReceiptNo: data.feeDetails?.lastReceiptNo || null,
        nextDueDate: data.feeDetails?.nextDueDate || '2026-10-15 (Phase 2 Due)',
        paymentMode: data.feeDetails?.paymentMode || 'UPI',
        paymentsHistory: data.feeDetails?.paymentsHistory || []
      }
    });

    await student.save();

    const result = student.toObject();
    result.id = result._id.toString();
    res.status(201).json(result);
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ error: 'Failed to add student.' });
  }
});

// ─── PUT /api/students/:id ───
// Owner only: Update a student's details
router.put('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const updates = req.body;

    // Clean phone if being updated
    if (updates.parentPhone) {
      updates.parentPhone = updates.parentPhone.replace(/\D/g, '').slice(-10);
    }

    // Recalculate fee fields if fee details are being updated
    if (updates.feeDetails) {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found.' });
      }

      const total = Number(updates.feeDetails.totalAnnualFee ?? student.feeDetails.totalAnnualFee);
      const paid = Number(updates.feeDetails.paidAmount ?? student.feeDetails.paidAmount);
      const due = Math.max(0, total - paid);

      updates.feeDetails = {
        ...student.feeDetails.toObject(),
        ...updates.feeDetails,
        totalAnnualFee: total,
        paidAmount: paid,
        dueAmount: due,
        status: due === 0 ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'DUE')
      };
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    updated.id = updated._id.toString();
    res.json(updated);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student.' });
  }
});

// ─── DELETE /api/students/:id ───
// Owner only: Delete a student
router.delete('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    res.json({ success: true, message: 'Student record deleted.' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student.' });
  }
});

// ─── POST /api/students/bulk-import ───
// Owner only: Import multiple students at once
router.post('/bulk-import', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { students: studentsList } = req.body;
    if (!Array.isArray(studentsList) || studentsList.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of students.' });
    }

    // Clean and format each student
    const formatted = studentsList.map(data => {
      const totalFee = Number(data.feeDetails?.totalAnnualFee || 30000);
      const paidAmount = Number(data.feeDetails?.paidAmount || 0);
      const dueAmount = Math.max(0, totalFee - paidAmount);
      const p1Target = Math.round(totalFee / 2);
      const p2Target = totalFee - p1Target;
      const p1Paid = Math.min(paidAmount, p1Target);
      const p2Paid = Math.max(0, paidAmount - p1Target);

      return {
        studentName: data.studentName,
        rollNo: data.rollNo || `NSK-IMP-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
        parentName: data.parentName || 'Parent',
        parentPhone: (data.parentPhone || '').replace(/\D/g, '').slice(-10),
        alternatePhone: data.alternatePhone || '',
        email: data.email || '',
        schoolName: data.schoolName || 'School',
        schoolId: data.schoolId || '',
        grade: data.grade || 'Grade 1',
        busNo: data.busNo || 'Bus #1',
        busPlate: data.busPlate || '',
        routeId: data.routeId || '',
        routeName: data.routeName || '',
        stopName: data.stopName || 'Designated Stop',
        pickupTime: data.pickupTime || '07:15 AM',
        dropTime: data.dropTime || '02:30 PM',
        liveStatus: data.liveStatus || { morningStatus: 'Scheduled', eveningStatus: 'Scheduled', isLiveOnBus: false },
        feeDetails: {
          totalAnnualFee: totalFee,
          paidAmount,
          dueAmount,
          status: dueAmount === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'DUE'),
          phase1Amount: p1Target,
          phase1Paid: p1Paid,
          phase1Status: p1Paid >= p1Target ? 'PAID' : (p1Paid > 0 ? 'PARTIAL' : 'DUE'),
          phase2Amount: p2Target,
          phase2Paid: p2Paid,
          phase2Status: p2Paid >= p2Target ? 'PAID' : (p2Paid > 0 ? 'PARTIAL' : 'DUE'),
          paymentMode: data.feeDetails?.paymentMode || 'Excel Import',
          paymentsHistory: data.feeDetails?.paymentsHistory || []
        }
      };
    });

    const inserted = await Student.insertMany(formatted);
    const result = inserted.map(s => {
      const obj = s.toObject();
      obj.id = obj._id.toString();
      return obj;
    });

    res.status(201).json({ success: true, count: result.length, students: result });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import students.' });
  }
});

// ─── PUT /api/students/bulk-fee ───
// Owner only: Set fee for multiple students
router.put('/bulk-fee', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { studentIds, totalAnnualFee } = req.body;
    const feeNum = Number(totalAnnualFee);

    if (!Array.isArray(studentIds) || !feeNum) {
      return res.status(400).json({ error: 'Please provide studentIds array and totalAnnualFee.' });
    }

    // Update each student individually to recalculate due correctly
    const updates = await Promise.all(
      studentIds.map(async (id) => {
        const student = await Student.findById(id);
        if (!student) return null;

        const paid = student.feeDetails.paidAmount;
        const due = Math.max(0, feeNum - paid);
        student.feeDetails.totalAnnualFee = feeNum;
        student.feeDetails.dueAmount = due;
        student.feeDetails.status = due === 0 ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'DUE');
        student.feeDetails.phase1Amount = Math.round(feeNum / 2);
        student.feeDetails.phase2Amount = feeNum - student.feeDetails.phase1Amount;
        await student.save();
        return student;
      })
    );

    res.json({ success: true, updated: updates.filter(Boolean).length });
  } catch (error) {
    console.error('Bulk fee error:', error);
    res.status(500).json({ error: 'Failed to update fees.' });
  }
});

// ─── PUT /api/students/bulk-stop ───
// Owner only: Set pickup stop for multiple students
router.put('/bulk-stop', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { studentIds, stopName } = req.body;

    if (!Array.isArray(studentIds) || !stopName) {
      return res.status(400).json({ error: 'Please provide studentIds array and stopName.' });
    }

    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { stopName } }
    );

    res.json({ success: true, message: `Updated ${studentIds.length} students.` });
  } catch (error) {
    console.error('Bulk stop error:', error);
    res.status(500).json({ error: 'Failed to update stops.' });
  }
});

module.exports = router;
