const Appointment = require('../models/Appointment');
const { Op } = require('sequelize');
const { publishEvent } = require('../messaging/rabbitmq');
const axios = require('axios');
const logger = require('../utils/logger');

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3001/api/v1';

class AppointmentController {
    // Verify patient exists
    async verifyPatient(patientId) {
        try {
            const response = await axios.get(`${PATIENT_SERVICE_URL}/patients/${patientId}`, {
                timeout: 5000
            });
            return response.data.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            logger.warn('Patient service unavailable, proceeding without verification');
            return { id: patientId, verified: false };
        }
    }

    // GET /appointments
    async getAllAppointments(req, res, next) {
        try {
            const {
                page = 1,
                limit = 20,
                sortBy = 'appointmentDate',
                sortOrder = 'ASC',
                status,
                patientId,
                doctorName,
                dateFrom,
                dateTo
            } = req.query;

            const offset = (page - 1) * limit;
            const where = {};

            if (status) where.status = status;
            if (patientId) where.patientId = patientId;
            if (doctorName) where.doctorName = { [Op.iLike]: `%${doctorName}%` };
            if (dateFrom || dateTo) {
                where.appointmentDate = {};
                if (dateFrom) where.appointmentDate[Op.gte] = new Date(dateFrom);
                if (dateTo) where.appointmentDate[Op.lte] = new Date(dateTo);
            }

            const { count, rows } = await Appointment.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [[sortBy, sortOrder.toUpperCase()]]
            });

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

    // GET /appointments/:id
    async getAppointmentById(req, res, next) {
        try {
            const appointment = await Appointment.findByPk(req.params.id);
            if (!appointment) {
                return res.status(404).json({ success: false, error: 'Appointment not found' });
            }
            res.json({ success: true, data: appointment });
        } catch (error) {
            next(error);
        }
    }

    // POST /appointments
    async createAppointment(req, res, next) {
        try {
            // Verify patient exists
            const patient = await new AppointmentController().verifyPatient(req.body.patientId);
            if (!patient) {
                return res.status(400).json({
                    success: false,
                    error: 'Patient not found. Please provide a valid patient ID.'
                });
            }

            const appointment = await Appointment.create(req.body);
            logger.info(`Created appointment: ${appointment.id}`);

            // Publish event to RabbitMQ
            await publishEvent('appointment.created', {
                id: appointment.id,
                patientId: appointment.patientId,
                doctorName: appointment.doctorName,
                appointmentDate: appointment.appointmentDate,
                type: appointment.type,
                status: appointment.status
            });

            res.status(201).json({
                success: true,
                data: appointment,
                message: 'Appointment created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /appointments/:id
    async updateAppointment(req, res, next) {
        try {
            const appointment = await Appointment.findByPk(req.params.id);
            if (!appointment) {
                return res.status(404).json({ success: false, error: 'Appointment not found' });
            }

            const previousStatus = appointment.status;
            await appointment.update(req.body);
            logger.info(`Updated appointment: ${appointment.id}`);

            // Publish event if status changed
            if (req.body.status && req.body.status !== previousStatus) {
                await publishEvent('appointment.updated', {
                    id: appointment.id,
                    patientId: appointment.patientId,
                    doctorName: appointment.doctorName,
                    appointmentDate: appointment.appointmentDate,
                    previousStatus,
                    newStatus: appointment.status
                });
            }

            res.json({
                success: true,
                data: appointment,
                message: 'Appointment updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /appointments/:id
    async deleteAppointment(req, res, next) {
        try {
            const appointment = await Appointment.findByPk(req.params.id);
            if (!appointment) {
                return res.status(404).json({ success: false, error: 'Appointment not found' });
            }

            await appointment.destroy();
            logger.info(`Deleted appointment: ${appointment.id}`);

            await publishEvent('appointment.cancelled', {
                id: appointment.id,
                patientId: appointment.patientId,
                doctorName: appointment.doctorName,
                appointmentDate: appointment.appointmentDate
            });

            res.json({ success: true, message: 'Appointment cancelled successfully' });
        } catch (error) {
            next(error);
        }
    }

    // GET /appointments/patient/:patientId
    async getPatientAppointments(req, res, next) {
        try {
            const appointments = await Appointment.findAll({
                where: { patientId: req.params.patientId },
                order: [['appointmentDate', 'DESC']]
            });

            res.json({ success: true, data: appointments });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /appointments/:id/status
    async updateStatus(req, res, next) {
        try {
            const appointment = await Appointment.findByPk(req.params.id);
            if (!appointment) {
                return res.status(404).json({ success: false, error: 'Appointment not found' });
            }

            const previousStatus = appointment.status;
            await appointment.update({ status: req.body.status });

            await publishEvent('appointment.status_changed', {
                id: appointment.id,
                patientId: appointment.patientId,
                previousStatus,
                newStatus: req.body.status
            });

            res.json({
                success: true,
                data: appointment,
                message: 'Appointment status updated'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AppointmentController();
