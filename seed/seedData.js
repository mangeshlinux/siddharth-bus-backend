/**
 * Database Seeder — Siddharth School Bus & Travels
 * 
 * Populates MongoDB Atlas with the initial mock data:
 * - 5 Students (with Phase 1/2 fees and payment history)
 * - 4 Schools
 * - 4 Fleet Buses
 * - 2 Notices
 * 
 * Usage: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Student = require('../models/Student');
const School = require('../models/School');
const Fleet = require('../models/Fleet');
const Notice = require('../models/Notice');

// ─── Seed Data (mirrors frontend/src/services/mockData.js) ───

// ─── Seed Data (mirrors frontend/src/services/mockData.js) ───

const SCHOOLS = [
  {
    name: "Shree Chatrapati Shivaji Maharaj Vidhaylay Makhamalabad.",
    code: "SCSMV",
    location: "Makhamalabad, Nashik",
    contact: "+91 84463 91127",
    activeStudents: 48,
    busAssigned: ["MH-15-RN-4501", "MH-15-RN-4504"]
  },
  {
    name: "New Grace Academy, Akta Nagar,Borgad Nashik",
    code: "NGA",
    location: "Akta Nagar, Borgad, Nashik",
    contact: "+91 84463 91127",
    activeStudents: 42,
    busAssigned: ["MH-15-RN-4502"]
  },
  {
    name: "Kaka Saheb Deodhar English Medium School, Reliance Pump Dindori Road.Nashik",
    code: "KSDEMS",
    location: "Reliance Pump, Dindori Road, Nashik",
    contact: "+91 84463 91127",
    activeStudents: 56,
    busAssigned: ["MH-15-RN-4503"]
  }
];

const FLEET = [
  {
    busNo: "Bus #1",
    plate: "MH-15-RN-4501",
    model: "Tata Winger Executive (22 Seater)",
    driverName: "Siddharth Kailas Shardul",
    driverPhone: "8446391127",
    routeId: "R1",
    routeName: "Route 1: Borgad - Adarsh Nagar - Omkar Nagar - Swami Vivekanand Nagar",
    status: "On Route",
    speed: "32 km/h",
    currentLocation: "Near Swami Vivekanand Nagar Stop",
    etaNextStop: "4 mins"
  },
  {
    busNo: "Bus #2",
    plate: "MH-15-RN-4502",
    model: "Tata Winger Deluxe (20 Seater)",
    driverName: "Ramesh Shinde",
    driverPhone: "9823567890",
    routeId: "R2",
    routeName: "Route 2: Makhamalabad - Swami Vivekanand Nagar - Adarsh Nagar",
    status: "On Route",
    speed: "28 km/h",
    currentLocation: "Near Adarsh Nagar Corner",
    etaNextStop: "6 mins"
  },
  {
    busNo: "Bus #3",
    plate: "MH-15-RN-4503",
    model: "Eicher Starline (32 Seater)",
    driverName: "Dnyaneshwar Shinde",
    driverPhone: "9823876543",
    routeId: "R3",
    routeName: "Route 3: Dindori Road - Akta Nagar - Borgad",
    status: "On Route",
    speed: "24 km/h",
    currentLocation: "Akta Nagar Signal",
    etaNextStop: "8 mins"
  },
  {
    busNo: "Bus #4",
    plate: "MH-15-RN-4504",
    model: "Force Traveller Royale (26 Seater)",
    driverName: "Vijay Jadhav",
    driverPhone: "9823987123",
    routeId: "R4",
    routeName: "Route 4: Omkar Nagar - Makhamalabad Road - Borgad",
    status: "School Bay",
    speed: "0 km/h",
    currentLocation: "Makhamalabad School Bus Bay",
    etaNextStop: "Next Trip 01:45 PM"
  }
];

const STUDENTS = [
  {
    studentName: "Aarav Sharma",
    rollNo: "SCSMV-7A-14",
    parentName: "Rajesh Sharma",
    parentPhone: "9876543210",
    alternatePhone: "9876543211",
    email: "rajesh.sharma@example.com",
    schoolName: "Shree Chatrapati Shivaji Maharaj Vidhaylay Makhamalabad.",
    schoolId: "SCH01",
    grade: "Grade 7-A",
    busNo: "Bus #1",
    busPlate: "MH-15-RN-4501",
    routeId: "R1",
    routeName: "Route 1: Borgad - Adarsh Nagar - Omkar Nagar - Swami Vivekanand Nagar",
    stopName: "Swami Vivekanand Nagar Gate",
    pickupTime: "07:15 AM",
    dropTime: "02:45 PM",
    liveStatus: { morningStatus: "Boarded (07:18 AM)", eveningStatus: "Expected Boarding (02:30 PM)", isLiveOnBus: true },
    feeDetails: {
      totalAnnualFee: 33000,
      paidAmount: 33000,
      dueAmount: 0,
      status: "PAID",
      phase1Amount: 16500,
      phase1Paid: 16500,
      phase1Status: "PAID",
      phase2Amount: 16500,
      phase2Paid: 16500,
      phase2Status: "PAID",
      lastPaymentDate: "2026-06-15",
      lastReceiptNo: "REC-2026-0891",
      nextDueDate: "Fully Settled (June–April)",
      paymentMode: "UPI / PhonePe",
      paymentsHistory: [
        { receiptNo: "REC-2026-0891", amount: 16500, date: "2026-06-15", mode: "UPI", term: "Phase 2 (Term 2) Transport Fee" },
        { receiptNo: "REC-2026-0122", amount: 16500, date: "2026-04-10", mode: "Bank Transfer", term: "Phase 1 (Term 1) Transport Fee" }
      ]
    }
  },
  {
    studentName: "Ananya Sharma",
    rollNo: "SCSMV-3B-08",
    parentName: "Rajesh Sharma",
    parentPhone: "9876543210",
    alternatePhone: "9876543211",
    email: "rajesh.sharma@example.com",
    schoolName: "Shree Chatrapati Shivaji Maharaj Vidhaylay Makhamalabad.",
    schoolId: "SCH01",
    grade: "Grade 3-B",
    busNo: "Bus #1",
    busPlate: "MH-15-RN-4501",
    routeId: "R1",
    routeName: "Route 1: Borgad - Adarsh Nagar - Omkar Nagar - Swami Vivekanand Nagar",
    stopName: "Swami Vivekanand Nagar Gate",
    pickupTime: "07:15 AM",
    dropTime: "02:45 PM",
    liveStatus: { morningStatus: "Boarded (07:18 AM)", eveningStatus: "Expected Boarding (02:30 PM)", isLiveOnBus: true },
    feeDetails: {
      totalAnnualFee: 33000,
      paidAmount: 16500,
      dueAmount: 16500,
      status: "DUE",
      phase1Amount: 16500,
      phase1Paid: 16500,
      phase1Status: "PAID",
      phase2Amount: 16500,
      phase2Paid: 0,
      phase2Status: "DUE",
      lastPaymentDate: "2026-04-10",
      lastReceiptNo: "REC-2026-0123",
      nextDueDate: "2026-10-15 (Phase 2 Due)",
      paymentMode: "Net Banking",
      paymentsHistory: [
        { receiptNo: "REC-2026-0123", amount: 16500, date: "2026-04-10", mode: "Net Banking", term: "Phase 1 (Term 1) Transport Fee" }
      ]
    }
  },
  {
    studentName: "Vihaan Deshmukh",
    rollNo: "NGA-9C-22",
    parentName: "Makarand Deshmukh",
    parentPhone: "9823012345",
    alternatePhone: "9823012346",
    email: "m.deshmukh@tcs.com",
    schoolName: "New Grace Academy, Akta Nagar,Borgad Nashik",
    schoolId: "SCH02",
    grade: "Grade 9-C",
    busNo: "Bus #2",
    busPlate: "MH-15-RN-4502",
    routeId: "R2",
    routeName: "Route 2: Makhamalabad - Swami Vivekanand Nagar - Adarsh Nagar",
    stopName: "Adarsh Nagar Corner",
    pickupTime: "06:50 AM",
    dropTime: "03:15 PM",
    liveStatus: { morningStatus: "Dropped at School (07:42 AM)", eveningStatus: "Waiting at School", isLiveOnBus: false },
    feeDetails: {
      totalAnnualFee: 33000,
      paidAmount: 33000,
      dueAmount: 0,
      status: "PAID",
      phase1Amount: 16500,
      phase1Paid: 16500,
      phase1Status: "PAID",
      phase2Amount: 16500,
      phase2Paid: 16500,
      phase2Status: "PAID",
      lastPaymentDate: "2026-07-02",
      lastReceiptNo: "REC-2026-1104",
      nextDueDate: "Fully Settled (June–April)",
      paymentMode: "Google Pay",
      paymentsHistory: [
        { receiptNo: "REC-2026-1104", amount: 33000, date: "2026-07-02", mode: "Google Pay", term: "Full Academic Year (June to April)" }
      ]
    }
  },
  {
    studentName: "Aditi Kulkarni",
    rollNo: "KSDEMS-5A-11",
    parentName: "Sunil Kulkarni",
    parentPhone: "9988776655",
    alternatePhone: "9988776656",
    email: "sunil.kulkarni@infosys.com",
    schoolName: "Kaka Saheb Deodhar English Medium School, Reliance Pump Dindori Road.Nashik",
    schoolId: "SCH03",
    grade: "Grade 5-A",
    busNo: "Bus #3",
    busPlate: "MH-15-RN-4503",
    routeId: "R3",
    routeName: "Route 3: Dindori Road - Akta Nagar - Borgad",
    stopName: "Omkar Nagar Chowk",
    pickupTime: "07:30 AM",
    dropTime: "02:15 PM",
    liveStatus: { morningStatus: "Boarded (07:32 AM)", eveningStatus: "In Transit", isLiveOnBus: true },
    feeDetails: {
      totalAnnualFee: 33000,
      paidAmount: 11000,
      dueAmount: 22000,
      status: "DUE",
      phase1Amount: 16500,
      phase1Paid: 11000,
      phase1Status: "PARTIAL",
      phase2Amount: 16500,
      phase2Paid: 0,
      phase2Status: "DUE",
      lastPaymentDate: "2026-04-05",
      lastReceiptNo: "REC-2026-0044",
      nextDueDate: "2026-10-15 (Phase 1 & 2 Dues)",
      paymentMode: "Cash Receipt",
      paymentsHistory: [
        { receiptNo: "REC-2026-0044", amount: 11000, date: "2026-04-05", mode: "Cash", term: "Phase 1 Partial Installment" }
      ]
    }
  },
  {
    studentName: "Tanvi More",
    rollNo: "SCSMV-10A-02",
    parentName: "Prashant More",
    parentPhone: "8446391127",
    alternatePhone: "9890123456",
    email: "prashant.more@siddharth.com",
    schoolName: "Shree Chatrapati Shivaji Maharaj Vidhaylay Makhamalabad.",
    schoolId: "SCH01",
    grade: "Grade 10-A",
    busNo: "Bus #1",
    busPlate: "MH-15-RN-4501",
    routeId: "R1",
    routeName: "Route 1: Borgad - Adarsh Nagar - Omkar Nagar - Swami Vivekanand Nagar",
    stopName: "Plot No 49, Swami Vivekanand Nagar",
    pickupTime: "07:30 AM",
    dropTime: "02:30 PM",
    liveStatus: { morningStatus: "Dropped at School (07:50 AM)", eveningStatus: "En Route to Stop", isLiveOnBus: true },
    feeDetails: {
      totalAnnualFee: 33000,
      paidAmount: 33000,
      dueAmount: 0,
      status: "PAID",
      phase1Amount: 16500,
      phase1Paid: 16500,
      phase1Status: "PAID",
      phase2Amount: 16500,
      phase2Paid: 16500,
      phase2Status: "PAID",
      lastPaymentDate: "2026-05-10",
      lastReceiptNo: "REC-2026-0399",
      nextDueDate: "Fully Settled (June–April)",
      paymentMode: "UPI / PhonePe",
      paymentsHistory: [
        { receiptNo: "REC-2026-0399", amount: 33000, date: "2026-05-10", mode: "UPI", term: "Annual Full (June to April)" }
      ]
    }
  }
];

const NOTICES = [
  {
    title: "Bus #1 Running on Time - Makhamalabad & Borgad Cleared",
    content: "All morning school bus routes in Borgad, Adarsh Nagar, Omkar Nagar, and Swami Vivekanand Nagar are operating normally on schedule. Drivers and attendants are actively monitoring stop halts.",
    target: "All Parents",
    type: "INFO",
    date: "2026-08-20",
    time: "07:30 AM",
    urgent: false
  },
  {
    title: "Phase 2 (Term 2) Bus Transport Fees Notice (June to April Session)",
    content: "Phase 2 transportation fee cycle for the 11-month academic session (June to April) is now active. Parents with pending balances can clear fees online via UPI (8446391127@upi) or offline cash to instantly download approved paper receipts.",
    target: "Parents with Due Fees",
    type: "FEE_REMINDER",
    date: "2026-08-18",
    time: "10:30 AM",
    urgent: false
  }
];

// ─── Run Seeder ───
async function seed() {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // Clear existing data
    await Student.deleteMany({});
    await School.deleteMany({});
    await Fleet.deleteMany({});
    await Notice.deleteMany({});
    console.log('   ✓ Cleared existing data');

    // Insert seed data
    const schools = await School.insertMany(SCHOOLS);
    console.log(`   ✓ Inserted ${schools.length} schools`);

    const fleet = await Fleet.insertMany(FLEET);
    console.log(`   ✓ Inserted ${fleet.length} buses`);

    const students = await Student.insertMany(STUDENTS);
    console.log(`   ✓ Inserted ${students.length} students`);

    const notices = await Notice.insertMany(NOTICES);
    console.log(`   ✓ Inserted ${notices.length} notices`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('   Demo Parent Login: 9876543210 (Rajesh Sharma, 2 children)');
    console.log('   Demo Owner Login PIN: 9999');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
