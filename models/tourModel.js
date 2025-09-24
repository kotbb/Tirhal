const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');
//const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  // Schema
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [5, 'A tour name must have more or equal than 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.6667 -> 46.667 -> 47 -> 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only works on save() and create()
          // this only points to the current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price', // {VALUE} is replaced with the value of the field that belongs to the mongoose validator
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], // array of strings
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // [longitude, latitude] but in maps it is [latitude, longitude]
      address: String,
      description: String,
    },
    locations: [
      {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // Child reference to the User model
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  // Options, to allow virtual properties to be included in the output like durationWeeks because virtual properties are not stored in the database
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexing, 1 -> ascending, -1 -> descending
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); //2dSphere in GeoSpatial data

// Virtual Property is not stored in the database but is calculated and added to the document
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review', // Model
  foreignField: 'tour', // Field in the Review model
  localField: '_id', // Field in the Tour model that stored in the tour field of the Review model
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
// THIS keyword is not available in arrow functions
// THIS keyword is used to access the document that is being saved
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embed guides to the created tour document but not the sufficient way.
/* tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
}) */

/* tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
}); */

// QUERY MIDDLEWARE
// Here we will create filter for secretTour and we will not show it in the output like the other fields
tourSchema.pre(/^find/, function (next) {
  // ^find -> all queries start with find
  this.find({ secretTour: { $ne: true } }); // $ne -> not equal
  this.start = Date.now();
  next();
});

// POPULATE
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// AGGREGATION MIDDLEWARE
/* tourSchema.pre('aggregate', function (next) {
  // we will add the filter for secretTour to the pipeline
  // UNSHIFT -> add the filter to the beginning of the pipeline
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
}); */

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
