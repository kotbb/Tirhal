import axios from 'axios';
import { showAlert } from './alert';

export const signup = async (name, email, password, passwordConfirm, role) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/users/signup`,
      withCredentials: true,
      data: {
        name,
        email,
        password,
        passwordConfirm,
        role,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Sign up successful');
      window.setTimeout(() => (window.location.href = '/'), 1000);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
