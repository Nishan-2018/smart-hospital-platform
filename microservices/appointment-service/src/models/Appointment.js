const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    doctorName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true }
    },
    doctorSpecialty: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        validate: { min: 15, max: 240 }
    },
    type: {
        type: DataTypes.ENUM('consultation', 'follow_up', 'emergency', 'procedure', 'lab_test', 'imaging'),
        allowNull: false,
        defaultValue: 'consultation'
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
        defaultValue: 'scheduled'
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
    }
}, {
    tableName: 'appointments',
    timestamps: true,
    paranoid: true,
    indexes: [
        { fields: ['patientId'] },
        { fields: ['appointmentDate'] },
        { fields: ['status'] },
        { fields: ['doctorName'] }
    ]
});

module.exports = Appointment;
