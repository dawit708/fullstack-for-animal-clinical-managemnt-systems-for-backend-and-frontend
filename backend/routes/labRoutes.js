const express = require('express');
const router = express.Router();

// ============================================
// IMPORT CONTROLLER (as object)
// ============================================
const labController = require('../controllers/labController');

// ============================================
// IMPORT MIDDLEWARE
// ============================================
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ============================================
// ALL ROUTES: Auth + Lab/Admin
// ============================================
router.use(authMiddleware);
router.use(roleMiddleware('lab', 'admin', 'vet'));

// ============================================
// 1. DASHBOARD
// ============================================
router.get('/dashboard', labController.getDashboard);

// ============================================
// 2. SAMPLES
// ============================================
router.get('/samples', labController.getSampleTracking);
router.get('/samples/:id', labController.getSample);
router.put('/samples/:id/process', labController.startProcessing);
router.put('/samples/:id/validate', labController.validateResult);

// ============================================
// 3. REQUISITIONS
// ============================================
router.get('/requisitions', labController.getRequisitions);

// ============================================
// 4. FINDINGS
// ============================================
router.post('/findings/:id', labController.submitFindings);

// ============================================
// 5. AWAITING VALIDATION
// ============================================
router.get('/awaiting-validation', labController.getAwaitingValidation);

// ============================================
// 6. EQUIPMENT
// ============================================
router.get('/equipment', labController.getEquipment);

// ============================================
// 7. REAGENTS
// ============================================
router.get('/reagents', labController.getReagents);

// ============================================
// 8. REPORTS
// ============================================
router.get('/reports', labController.getReports);

// ============================================
// 9. QUALITY CONTROL
// ============================================
router.get('/quality-control', labController.getQualityControl);

// ============================================
// EXPORT
// ============================================
module.exports = router;