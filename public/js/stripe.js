import axios from 'axios';
import { showAlert } from './alert';
import Stripe from 'stripe';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51SAH5t3GKhc6jso5PGmB2DZJVOIvoz8yc3TjeTgBiwWEfnPtcsxa4cJJ6Z5K70DQMN8dwMRSfrRfCAJhpXd8yMQW007wQsLo9i'
    );
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    // 2) Create checkout form + charge credit card
    window.location.replace(session.data.session.url);
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
