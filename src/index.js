import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom"

import App from './App';
import { FirebaseProvider } from "./hooks"

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
