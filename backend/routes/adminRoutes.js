const express = require('express');
const router = express.Router();

const {
  // Dashboard
  getDashboard,
  getSystemStats,
  
  // Users
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  
  // Branches
  getBranches,
  createBranch,
  updateBranch,
  
  // Invitations
  getInvitations,
  sendInvitation,
  cancelInvitation,
  
  // Services & Pricing
  getServices,
  createService,
  updateService,
  deleteService,        // 🆕
  
  // Security
  getSecurity,
  
  // Backups
  getBackups,
  createBackup,
  downloadBackup,
  restoreBackup,
  deleteBackup,         // 🆕
  
  // System
  getSystemLogs,
  getMaintenance
} = require('../controllers/adminController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes: auth + admin role only
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard', getDashboard);
router.get('/stats', getSystemStats);

// ============================================
// USERS
// ============================================
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ============================================
// BRANCHES
// ============================================
router.get('/branches', getBranches);
router.post('/branches', createBranch);
router.put('/branches/:id', updateBranch);

// ============================================
// INVITATIONS
// ============================================
router.get('/invitations', getInvitations);
router.post('/invitations', sendInvitation);
router.delete('/invitations/:id', cancelInvitation);

// ============================================
// SERVICES & PRICING
// ============================================
router.get('/services', getServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);    // 🆕

// ============================================
// SECURITY
// ============================================
router.get('/security', getSecurity);

// ============================================
// BACKUPS
// ============================================
router.get('/backups', getBackups);
router.post('/backups', createBackup);
router.get('/backups/:id/download', downloadBackup);
router.post('/backups/:id/restore', restoreBackup);
router.delete('/backups/:id', deleteBackup);       // 🆕

// ============================================
// SYSTEM LOGS
// ============================================
router.get('/logs', getSystemLogs);

// ============================================
// MAINTENANCE
// ============================================
router.get('/maintenance', getMaintenance);

module.exports = router;