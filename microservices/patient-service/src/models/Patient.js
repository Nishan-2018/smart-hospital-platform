const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/connection');

const Patient = sequelize.define('Patient', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
    },
    dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    state: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    zipCode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    insuranceProvider: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    insurancePolicyNumber: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    emergencyContactName: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    emergencyContactPhone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    bloodType: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
        allowNull: true
    },
    allergies: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const val = this.getDataValue('allergies');
            return val ? JSON.parse(val) : [];
        },
        set(val) {
            this.setDataValue('allergies', JSON.stringify(val));
        }
    },
    medicalHistory: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const val = this.getDataValue('medicalHistory');
            return val ? JSON.parse(val) : [];
        },
        set(val) {
            this.setDataValue('medicalHistory', JSON.stringify(val));
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'deceased'),
        defaultValue: 'active'
    }
}, {
    tableName: 'patients',
    timestamps: true,
    paranoid: true, // Soft deletes
    indexes: [
        { fields: ['lastName', 'firstName'] },
        { fields: ['email'] },
        { fields: ['status'] }
    ]
});

module.exports = Patient;
