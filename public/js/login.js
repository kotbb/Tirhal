import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      //console.log(res.data);
      showAlert('success', 'Login successful');
      window.setTimeout(() => (window.location.href = '/'), 1000);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully');
      location.reload(true);
      window.location.href = '/';
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
