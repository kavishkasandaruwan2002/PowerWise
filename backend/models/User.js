const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');


const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // never return password in queries
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        incomeBracket: {
            type: String,
            enum: ['low', 'middle', 'high'],
            required: [true, 'Income bracket is required'],
        },
        household: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Household',
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        location: {
            lat: { type: Number, default: 6.9271 }, // Colombo Default
            lon: { type: Number, default: 79.8612 },
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },

    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for householdId compatibility
UserSchema.virtual('householdId').get(function() {
    return this.household;
});

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    console.log('HASHING PASSWORD FOR:', this.email);
    const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
<<<<<<< HEAD
    // next();
=======
    console.log('PASSWORD HASHED SUCCESSFULY');
>>>>>>> householder-frontend
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 mins)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);