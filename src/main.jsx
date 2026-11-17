import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

window.addEventListener('error', (e) => {
  document.body.innerHTML = `<pre style="padding:16px;color:#b91c1c;white-space:pre-wrap;font-family:monospace;">Runtime Error:\n${e.message}\n${e.filename}:${e.lineno}</pre>`;
});

import('./PatagoniaWTrekHub.jsx')
  .then(({ default: App }) => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((err) => {
    document.body.innerHTML = `<pre style="padding:16px;color:#b91c1c;white-space:pre-wrap;font-family:monospace;">Import Error:\n${err.message}\n${err.stack}</pre>`;
  });
