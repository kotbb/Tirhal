import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // 2) Create checkout form + charge credit card
    window.location.replace(session.data.session.url);
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
