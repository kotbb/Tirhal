# Tirhal - Tour Booking Application

Tirhal is a tour booking application built with modern backend technologies. It features a complete server-side rendered website for users and a full RESTful API for developers. The project demonstrates advanced features including user authentication, payment processing, map integration, and automated email services.

## Live Demo

**View the live application here: [https://tirhal-kotb.vercel.app/](https://tirhal-kotb.vercel.app/)**

---

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: Pug, JavaScript, Axios, Leaflet.js
- **Authentication**: JSON Web Token (JWT), bcrypt.js
- **Payments**: Stripe
- **File Handling**: Multer, Sharp
- **Email**: Nodemailer, Brevo (Production)
- **Build Tools**: Parcel

## Features

### Authentication & Security

- **Complete Authentication System**: Secure user registration and login system.
- **JWT & Cookie-Based Sessions**: Uses JSON Web Tokens for stateless API authentication and `httpOnly` cookies for secure web sessions.
- **Password Management**: Provides secure password hashing with **bcrypt** and a full password reset flow via email.
- **Authorization**: Role-based access control for users, guides, lead-guides, and admins, protecting sensitive routes and actions.

---

### API Functionality

- **Advanced Querying**: The API supports complex filtering, sorting, field limiting, and pagination on all resources.
- **Geospatial Queries**: Users can find tours within a certain radius of their location and calculate distances to all tours.
- **Aggregation Pipeline**: Delivers calculated statistics and data insights, such as tour stats by difficulty and monthly plans.
- **RESTful Architecture**: Follows REST principles for a clean and predictable API.

---

### User & Data Management

- **Full CRUD Operations**: Complete create, read, update, and delete functionality for tours, users, reviews, and bookings.
- **Image Uploads & Processing**: Efficiently handles image uploads for user photos and tour images, with on-the-fly resizing and formatting using **Sharp**.
- **Data Validation**: Implements robust server-side validation to ensure data integrity.
- **Database Indexing**: Utilizes indexing on multiple fields for high-performance queries.

---

### Payments & Emails

- **Stripe Integration**: Securely processes credit card payments for tour bookings using the Stripe API.
- **Automated Email Service**: Sends beautiful, responsive HTML emails for key events like user registration and password resets. The system is configured for both development (via Mailtrap) and production (via Brevo) environments.

---

### Server-Side Rendered Website

- **Dynamic Templating**: The entire user-facing website is server-side rendered using **Pug** templates.
- **User Dashboards**: Includes dedicated account pages for users to manage their settings, bookings, and reviews.

---

### Client-Side Functionality

- **API Integration**: The front-end is fully integrated with the backend API using **Axios** to create a seamless Single-Page Application feel.
- **Interactive Maps**: Tour locations are dynamically rendered on an interactive map using **Leaflet.js**, complete with markers and popups for each stop.
- **Real-time User Feedback**: A custom alert system provides immediate feedback for actions like successful logins or failed updates.
- **Client-Side Authentication**: Handles user login and logout directly from the front-end, updating the UI accordingly.
- **Account Management**: Allows users to update their personal data (name, email, photo) and change their password without a page reload.
- **Stripe Checkout**: Integrates with the backend to fetch a Stripe checkout session and redirect the user to the payment page to book a tour.

## Deployment

This application is deployed on **Vercel**. The production build includes:

- Secure handling of environment variables for API keys and database credentials.
- Automatic HTTPS and SSL certificate management.
- A Content Security Policy (CSP) configured to work with Vercel's platform.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js & npm
- MongoDB (local or Atlas)

### Installation

1.  **Clone the repo**
    ```sh
    git clone [https://github.com/kotbb/tirhal.git](https://github.com/kotbb/tirhal.git)
    ```
2.  **Install NPM packages**
    ```sh
    npm install
    ```
3.  **Set up environment variables**

    Create a `config.env` file in the root directory and add the following variables:

    ```env
    NODE_ENV=development
    PORT=3000
    FRONTEND_ORIGIN=<Your Localhost:Port>

    # Database
    DATABASE=<Your MongoDB Connection String>
    DATABASE_PASSWORD=<Your MongoDB Password>

    # JWT
    JWT_SECRET=<A long, complex, and random string>
    JWT_EXPIRES_IN=90d

    # Stripe
    STRIPE_SECRET_KEY=<Your Stripe Secret Key>
    STRIPE_WEBHOOK_SECRET_PROD=<Your Stripe Webhook Secret Key>
    STRIPE_WEBHOOK_SECRET_DEV=<Your Stripe Webhook Secret Key>

    # Email (using Mailtrap for development)
    EMAIL_HOST=sandbox.smtp.mailtrap.io
    EMAIL_PORT=2525
    EMAIL_USERNAME=<Your Mailtrap Username>
    EMAIL_PASSWORD=<Your Mailtrap Password>
    EMAIL_FROM=Tirhal <noreply@tirhal.io>
    ```

4.  **Run the application**
    ```sh
    npm start
    ```
    **Run the Webhook Stripe Server**
    ```sh
    stripe listen --forward-to localhost:<Your PORT>/webhook-checkout
    ```

## API Endpoints

The application exposes the following RESTful endpoints:

- **Tours**: `/api/v1/tours`
- **Users**: `/api/v1/users`
- **Reviews**: `/api/v1/reviews` (also accessible via nested route `/api/v1/tours/:tourId/reviews`)
- **Bookings**: `/api/v1/bookings`

## Author

**Mohamed Kotb**
