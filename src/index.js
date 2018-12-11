import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import Footer from './components/Footer';
import Header from './components/Header';

ReactDOM.render(
    <Router>
        <div className="main-container">
            <Route component={Header} />
            <Route exact path='/' component={App} />
            <Footer />
        </div>
    </Router>,
    document.getElementById('root')
);
registerServiceWorker();