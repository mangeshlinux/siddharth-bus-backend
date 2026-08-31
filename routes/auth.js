const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Owner config (from env with safe fallbacks)
const JWT_SECRET = process.env.JWT_SECRET || 'siddharth-bus-jwt-secret-2026-nashik-secure';

const getOwnerConfig = () => ({
  name: 'Siddharth Kailas Shardul',
  businessName: 'Siddharth School Bus & Travels',
  primaryPhone: '8446391127',
  whatsappNumber: '918446391127',
  email: 'siddharthshardul96@gmail.com',
  instagram: 'https://www.instagram.com/siddhshardul2?igsi=MWRnaTM5aWF0c25hdg==',
  instagramHandle: '@siddhshardul2',
  officeAddress: 'Plot No 49, Vithu Mauli Colony Lane No 1, Swami Vivekanand Nagar, Makhamalabad, Nashik',
  adminPin: process.env.OWNER_PIN || '0081',
  secretPass: process.env.OWNER_SECRET_PASS || 'siddhu',
  estYear: '2017',
  city: 'Nashik'
});

// ─── POST /api/auth/parent-login ───
// No OTP — just check if phone exists in student records
router.post('/parent-login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
    }

    // Find all students linked to this phone number
    const matchedStudents = await Student.find({
      $or: [
        { parentPhone: cleanPhone },
        { alternatePhone: cleanPhone }
      ]
    }).lean();

    if (matchedStudents.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No student records found for this mobile number. Please check the number or contact Siddharth Travels.'
      });
    }

    // Issue JWT token (7 days for parents)
    const token = jwt.sign(
      {
        role: 'PARENT',
        phone: cleanPhone,
        parentName: matchedStudents[0].parentName,
        studentIds: matchedStudents.map(s => s._id.toString())
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Map _id to id for frontend compatibility
    const studentsWithId = matchedStudents.map(s => ({ ...s, id: s._id.toString() }));

    res.json({
      success: true,
      token,
      user: {
        role: 'PARENT',
        phone: cleanPhone,
        parentName: matchedStudents[0].parentName,
        studentIds: matchedStudents.map(s => s._id.toString())
      },
      students: studentsWithId,
      count: matchedStudents.length
    });
  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error during login.' });
  }
});

// ─── POST /api/auth/owner-login ───
router.post('/owner-login', async (req, res) => {
  try {
    const { pin } = req.body;
    const config = getOwnerConfig();

    const isPinValid = (config.adminPin && pin === config.adminPin) || (config.secretPass && pin === config.secretPass);

    if (!isPinValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Owner Access PIN / Password.'
      });
    }

    // Issue JWT token (24 hours for owner)
    const token = jwt.sign(
      {
        role: 'OWNER',
        name: config.name,
        businessName: config.businessName,
        phone: config.primaryPhone
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const allStudents = await Student.find().sort({ createdAt: -1 }).lean();
    const studentsWithId = allStudents.map(s => ({ ...s, id: s._id.toString() }));

    res.json({
      success: true,
      token,
      user: {
        role: 'OWNER',
        name: config.name,
        businessName: config.businessName,
        phone: config.primaryPhone
      },
      students: studentsWithId
    });
  } catch (error) {
    console.error('Owner login error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error during login.' });
  }
});

// ─── GET /api/auth/me ───
// Verify token and return current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userData = { ...req.user };

    // If owner, fetch all students
    if (req.user.role === 'OWNER') {
      const students = await Student.find().sort({ createdAt: -1 }).lean();
      const studentsWithId = students.map(s => ({ ...s, id: s._id.toString() }));
      return res.json({ success: true, user: userData, students: studentsWithId });
    }

    // If parent, also fetch their latest student data
    if (req.user.role === 'PARENT') {
      const students = await Student.find({
        $or: [
          { parentPhone: req.user.phone },
          { alternatePhone: req.user.phone }
        ]
      }).lean();

      const studentsWithId = students.map(s => ({ ...s, id: s._id.toString() }));
      userData.studentIds = students.map(s => s._id.toString());

      return res.json({ success: true, user: userData, students: studentsWithId });
    }

    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Auth /me error:', error);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = router;
