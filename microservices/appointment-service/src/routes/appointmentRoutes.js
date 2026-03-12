const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const validate = require('../middleware/validate');

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorName
 *         - appointmentDate
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         patientId:
 *           type: string
 *           format: uuid
 *         doctorName:
 *           type: string
 *         appointmentDate:
 *           type: string
 *           format: date-time
 *         type:
 *           type: string
 *           enum: [consultation, follow_up, emergency, procedure, lab_test, imaging]
 *         status:
 *           type: string
 *           enum: [scheduled, confirmed, in_progress, completed, cancelled, no_show]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 */

const createValidation = [
    body('patientId').isUUID().withMessage('Valid patient ID is required'),
    body('doctorName').trim().notEmpty().withMessage('Doctor name is required'),
    body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
    body('type').optional().isIn(['consultation', 'follow_up', 'emergency', 'procedure', 'lab_test', 'imaging']),
    body('duration').optional().isInt({ min: 15, max: 240 }),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
];

const idValidation = [
    param('id').isUUID().withMessage('Invalid appointment ID')
];

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/', appointmentController.getAllAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 */
router.get('/:id', idValidation, validate, appointmentController.getAppointmentById);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 */
router.post('/', createValidation, validate, appointmentController.createAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
 */
router.put('/:id', idValidation, validate, appointmentController.updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Cancel appointment
 *     tags: [Appointments]
 */
router.delete('/:id', idValidation, validate, appointmentController.deleteAppointment);

/**
 * @swagger
 * /appointments/patient/{patientId}:
 *   get:
 *     summary: Get all appointments for a patient
 *     tags: [Appointments]
 */
router.get('/patient/:patientId',
    [param('patientId').isUUID()],
    validate,
    appointmentController.getPatientAppointments
);

/**
 * @swagger
 * /appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
 */
router.patch('/:id/status',
    [...idValidation, body('status').isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])],
    validate,
    appointmentController.updateStatus
);

module.exports = router;
