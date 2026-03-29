class APIFeatures {
  // query is the mongoose query (Tour.find())
  // queryString is the request query string (req.query)
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // 1A) Filtering
    //const queryObj = req.query;  makes hard copy of the object not shallow copy
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const filters = JSON.parse(queryStr);

    // { difficulty: 'easy', duration: { gte: 5 } }   -> query object
    // { difficulty: 'easy', duration: { $gte: 5 } }  -> filtering
    // gte, gt, lte, lt
    this.query = this.query.find(filters);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      // we need to separte fields by space because-> sort('price ratingsAverage')
      const sortBy = this.queryString.sort.split(',').join('');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // minus will exclude the field
    }
    return this;
  }
  paginate() {
    // page=2&limit=10  page 1 -> skip 0, page 2 -> skip 10, page 3 -> skip 20
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
export default APIFeatures;
