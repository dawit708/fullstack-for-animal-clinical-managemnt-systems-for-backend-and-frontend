const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getDashboard,
  getTodaySchedule,
  getPatientQueue,
  getResultsToReview,
  getFollowUps,
  getPatients,
  getPatientDetail,
  createSoapNote,
  getSoapNote,
  orderLabTest,
  createPrescription,
} = require('../controllers/vetController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes need auth + vet/admin role
router.use(authMiddleware);
router.use(roleMiddleware('vet', 'admin'));

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard', getDashboard);

// ============================================
// SCHEDULE & QUEUE
// ============================================
router.get('/schedule/today', getTodaySchedule);
router.get('/patient-queue', getPatientQueue);

// ============================================
// REVIEWS & FOLLOW-UPS
// ============================================
router.get('/results-to-review', getResultsToReview);
router.get('/follow-ups', getFollowUps);

// ============================================
// PATIENTS
// ============================================
router.get('/patients', getPatients);
router.get('/patients/:id', getPatientDetail);

// ============================================
// SOAP NOTES
// ============================================
router.post('/soap-notes', createSoapNote);
router.get('/soap-notes/:id', getSoapNote);

// ============================================
// ACTIONS
// ============================================
router.post('/lab-order', orderLabTest);
router.post('/prescription', createPrescription);
module.exports = router;