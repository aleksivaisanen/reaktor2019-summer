import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import Footer from './components/Footer';
import Header from './components/Header';

import { createStore } from 'redux';
import { Provider } from 'react-redux'
import rootReducer from './reducers/rootReducer'

export let store = createStore(rootReducer)

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <div className="main-container">
                <Route component={Header} />
                <Route exact path='/' component={App} />
                <Footer />
            </div>
        </Router>
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();