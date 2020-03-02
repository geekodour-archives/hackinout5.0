import React, { Component } from 'react';
import logo from './logo.svg';
import './css/app.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Home from './components/Home'
import About from './components/About'
import Redeem from './components/Redeem'
import Transfer from './components/Transfer'

class App extends Component {
  render() {
    return (
      <Router>
        <div className="">
          <nav className="db dtc-ns v-mid w-100 tl tr-ns mt2 mt0-ns">
      <Link to="/"
          className="f6 fw6 hover-blue link black-70 mr2 mr3-m mr4-l dib">
        Home
      </Link>
      <Link to="/transfer"
          className="f6 fw6 hover-blue link black-70 mr2 mr3-m mr4-l dib">
        Transfer
      </Link>
      <Link to="/redeem"
          className="f6 fw6 hover-blue link black-70 mr2 mr3-m mr4-l dib">
        Redeem
      </Link>
    </nav>
          <Route exact path="/" component={Home} />
          <Route exact path="/about" component={About} />
          <Route exact path="/transfer" component={Transfer} />
          <Route exact path="/redeem" component={Redeem} />
        </div>
      </Router>
    );
  }
}

export default App;
