import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import parseTimeToMs from '../utils/parseTimeToMs.js';

// name, email, password, passwordConfirm, photo
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minlength: 8,
    select: false, 
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
    select: false, // This is to not show the passwordConfirm in the response
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  refreshToken: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// This middleware is used to not show the inactive users in the response, /^find/ is a regex to match all the find queries
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.select('-__v');
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  // this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// This middleware is used to update the passwordChangedAt property for the user befor saving the user in the database
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // 1 second before the token is issued to make it sure that the token is issued after the password is changed
  next();
});

// Instance methods are methods that are available on all documents of a certain collection
userSchema.methods.correctPassword = async function (
  inputPassword,
  userPassword
) {
  // inputPassword is not hashed, userPassword is hashed
  return await bcrypt.compare(inputPassword, userPassword);
};

// This method is used to check if the user has changed their password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // convert the passwordChangedAt to a timestamp like (1554234200)
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp; // 100 < 200
  }
  // False means NOT changed
  return false;
};

// This method is used to create a password reset token for the user
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires =
    Date.now() + parseTimeToMs(process.env.RESET_PASSWORD_EXPIRES_IN);

  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;
