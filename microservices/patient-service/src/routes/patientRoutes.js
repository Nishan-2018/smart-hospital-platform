const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const patientController = require('../controllers/patientController');
const validate = require('../middleware/validate');

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - dateOfBirth
 *         - gender
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [male, female, other, prefer_not_to_say]
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         bloodType:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *         status:
 *           type: string
 *           enum: [active, inactive, deceased]
 */

const createValidation = [
    body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 100 }),
    body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 100 }),
    body('dateOfBirth').notEmpty().withMessage('Date of birth is required').isDate(),
    body('gender').notEmpty().withMessage('Gender is required').isIn(['male', 'female', 'other', 'prefer_not_to_say']),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
];

const updateValidation = [
    body('firstName').optional().trim().isLength({ min: 1, max: 100 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 100 }),
    body('dateOfBirth').optional().isDate(),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
    body('email').optional().isEmail(),
    body('phone').optional().isMobilePhone()
];

const idValidation = [
    param('id').isUUID().withMessage('Invalid patient ID format')
];

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of patients
 */
router.get('/', patientController.getAllPatients);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Patient details
 *       404:
 *         description: Patient not found
 */
router.get('/:id', idValidation, validate, patientController.getPatientById);

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Patient created successfully
 */
router.post('/', createValidation, validate, patientController.createPatient);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update a patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: Patient updated
 */
router.put('/:id', [...idValidation, ...updateValidation], validate, patientController.updatePatient);

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Delete a patient (soft delete)
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Patient deleted
 */
router.delete('/:id', idValidation, validate, patientController.deletePatient);

/**
 * @swagger
 * /patients/{id}/status:
 *   patch:
 *     summary: Update patient status
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, deceased]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status',
    [...idValidation, body('status').isIn(['active', 'inactive', 'deceased'])],
    validate,
    patientController.updatePatientStatus
);

module.exports = router;
