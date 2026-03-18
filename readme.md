## Tirhal

Tirhal is a full-stack tour booking web application built with Node.js, Express, and MongoDB.  
It allows users to explore tours, view them on a map, book securely with Stripe, and manage their accounts in a smooth experience.

Live Demo: https://tirhal-kotb.vercel.app

---

## Tech Stack

**Backend**
- Node.js
- Express.js
- MongoDB (Mongoose)

**Frontend**
- Pug
- JavaScript
- Axios
- Leaflet

**Authentication & Security**
- JSON Web Token (JWT)
- bcrypt
- Cookie-based sessions

**Other Tools**
- Stripe (payments)
- Multer & Sharp (file uploads and image processing)
- Nodemailer & Brevo (emails)
- Parcel (bundler)

---

## Features

### Authentication & Authorization
- Secure user signup and login
- JWT-based authentication with httpOnly cookies
- Password hashing and reset via email
- Role-based access control (user, guide, admin)

### Tours & API
- Browse tours with filtering, sorting, and pagination
- Geospatial queries to find nearby tours and distances
- Aggregation for statistics and insights
- RESTful API design

### User & Data Management
- Full CRUD operations for tours, users, reviews, and bookings
- Image upload and optimization
- Server-side validation and database indexing

### Payments & Emails
- Secure tour booking with Stripe
- Automated emails for account actions (signup, password reset)

### Website
- Server-side rendering with Pug templates
- User dashboard for managing bookings and account settings

### Client-Side Functionality
- API integration with Axios for smooth interactions
- Interactive maps using Leaflet
- Real-time alerts and feedback
- Update profile data and password without page reload
- Stripe checkout integration

---

## API Routes

- `/api/v1/tours`
- `/api/v1/users`
- `/api/v1/reviews`
- `/api/v1/bookings`

---

## Author

Mohamed Kotb