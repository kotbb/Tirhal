import 'core-js';
import 'regenerator-runtime/runtime';
import { displayMap } from './leaflet';
import { login } from './login';
import { logout } from './logout';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';
import { signup } from './signup';

const map = document.getElementById('map');
if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}

const loginForm = document.querySelector('.form.form--login');
const signupForm = document.querySelector('.form.form--signup');
const logoutBtn = document.querySelector('.nav__el.nav__el--logout');
const userDataForm = document.querySelector('.form.form-user-data');
const userSettingsForm = document.querySelector('.form.form-user-settings');
const bookTourBtn = document.getElementById('book-tour');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const role = document.getElementById('role').value;
    signup(name, email, password, passwordConfirm, role);
  })
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
}

if (userSettingsForm) {
  userSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (e) => {
    bookTourBtn.textContent = 'Processing...';
    const tourId = bookTourBtn.dataset.tourId;
    //console.log(tourId);
    bookTour(tourId);
  });
}
const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) {
  showAlert('success', alertMessage, 10);
  window.setTimeout(() => {
    window.location.href = '/my-tours';
  }, 10000);
}
