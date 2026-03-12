const Patient = require('../models/Patient');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class PatientController {
    // GET /patients
    async getAllPatients(req, res, next) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'createdAt',
                sortOrder = 'DESC',
                search,
                status
            } = req.query;

            const offset = (page - 1) * limit;
            const where = {};

            if (search) {
                where[Op.or] = [
                    { firstName: { [Op.iLike]: `%${search}%` } },
                    { lastName: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } }
                ];
            }

            if (status) {
                where.status = status;
            }

            const { count, rows } = await Patient.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [[sortBy, sortOrder.toUpperCase()]]
            });

            logger.info(`Retrieved ${rows.length} patients (page ${page})`);

            res.json({
                success: true,
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /patients/:id
    async getPatientById(req, res, next) {
        try {
            const patient = await Patient.findByPk(req.params.id);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    error: 'Patient not found'
                });
            }

            logger.info(`Retrieved patient: ${patient.id}`);
            res.json({ success: true, data: patient });
        } catch (error) {
            next(error);
        }
    }

    // POST /patients
    async createPatient(req, res, next) {
        try {
            const patient = await Patient.create(req.body);
            logger.info(`Created patient: ${patient.id}`);

            res.status(201).json({
                success: true,
                data: patient,
                message: 'Patient created successfully'
            });
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors.map(e => ({
                        field: e.path,
                        message: e.message
                    }))
                });
            }
            next(error);
        }
    }

    // PUT /patients/:id
    async updatePatient(req, res, next) {
        try {
            const patient = await Patient.findByPk(req.params.id);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    error: 'Patient not found'
                });
            }

            await patient.update(req.body);
            logger.info(`Updated patient: ${patient.id}`);

            res.json({
                success: true,
                data: patient,
                message: 'Patient updated successfully'
            });
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors.map(e => ({
                        field: e.path,
                        message: e.message
                    }))
                });
            }
            next(error);
        }
    }

    // DELETE /patients/:id
    async deletePatient(req, res, next) {
        try {
            const patient = await Patient.findByPk(req.params.id);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    error: 'Patient not found'
                });
            }

            await patient.destroy(); // Soft delete
            logger.info(`Deleted patient: ${patient.id}`);

            res.json({
                success: true,
                message: 'Patient deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /patients/:id/status
    async updatePatientStatus(req, res, next) {
        try {
            const { status } = req.body;
            const patient = await Patient.findByPk(req.params.id);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    error: 'Patient not found'
                });
            }

            await patient.update({ status });
            logger.info(`Updated patient status: ${patient.id} -> ${status}`);

            res.json({
                success: true,
                data: patient,
                message: 'Patient status updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PatientController();
