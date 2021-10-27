import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './index.css';
import { handleError } from 'src/utils/alerts';

const app = createApp(App).use(router);

// --- Error handling ---
// Setup global error handling so any thrown errors are surfaced automatically to the user via an alert
// Source: https://stackoverflow.com/questions/52071212/how-to-implement-global-error-handling-in-vue

// Vue app errors. `info` is a Vue-specific error info, e.g. which lifecycle hook the error was found in
// More info: https://v3.vuejs.org/api/application-config.html#errorhandler
app.config.errorHandler = function (err, _vm, info) {
  console.log('Error info:', info);
  handleError(err as Error);
};

// General JS (non-Vue) error handler
// More info: https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
window.onerror = function (msg, url, line, col, err) {
  if (err) {
    console.error('Error params:', msg, url, line, col);
    handleError(err);
  }
};

// Handle promise rejections, where `event.promise` contains the promise object and `event.reason` contains the
// reason for the rejection
// More info: https://stackoverflow.com/questions/31472439/catch-all-unhandled-javascript-promise-rejections
window.addEventListener('unhandledrejection', function (event) {
  if (event.reason) {
    console.error('Rejection params:', event.reason);
    handleError(event.reason);
  }
});

// --- Setup complete, mount app ---
app.mount('#app');
