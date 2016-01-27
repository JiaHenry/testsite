import React from 'react';
import { render } from 'react-dom';
import { Router, Route, RouteHandler, Link } from 'react-router';
import { IndexRoute } from 'react-router';
import { Redirect } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Home from './components/Home.jsx';
import UserProfile from './components/UserProfile.jsx';
import Auth from './services/AuthService';
import LocalStore from './LocalStore';

//import '../index.css';

const MainContainer = React.createClass({
  getInitialState() {
    console.log("mc_init");
      return { isLoggedIn: LocalStore.isLoggedIn() }
    },
    
  componentWillMount() {
    this.setState({ isLoggedIn: LocalStore.isLoggedIn()});
  },
  componentWillReceiveProps() {
    console.log("mc_rp");
    this.setState({ isLoggedIn: LocalStore.isLoggedIn()});
    console.log("mc_rp 2", this.state);
  },
   render() {
     console.log("main.render", LocalStore.isLoggedIn(), this.state);
     
     //var headers = this.headerItems();
     
     //console.log("main.render headers", headers);
     
    return (
      <div className="container">
        <div>
           {this.props.children}
        </div>
      </div>
    );
  },
  
  logout: function (e) {
    Auth.logout();
  },

  headerItems: function() {
    console.log("main.get headerItems", LocalStore.isLoggedIn());
    
    if (!LocalStore.isLoggedIn()) {
      return (
      <ul className="nav navbar-nav navbar-right">
        <li>
          <Link to="login">Login</Link>
        </li>
        <li>
          <Link to="signup">Signup</Link>
        </li>
      </ul>)
    } else {
      return (
      <ul className="nav navbar-nav navbar-right">
        <li>
          <Link to="home">Home</Link>
        </li>
        <li>
          <Link to="profile">Profile</Link>
        </li>
        <li>
          <a href="/" onClick={this.logout}>Logout</a>
        </li>
      </ul>)
    }
  }
});

function requireAuth(nextState, replace) {
    if (!LocalStore.isLoggedIn()) {
        // replace(state, pathname, query)  
        replace(
            { nextPathname: nextState.location.pathname },  // state
            '/home',    // pathname
            ''      // query
        )
    }
}

function requireEmail(nextState, replace) {
    if (!LocalStore.email) {
        replace(
            { nextPathname: nextState.location.pathname },  // state
            '/home',    // pathname
            ''      // query
        )   
    }
}

render((
    <Router history={createBrowserHistory()}>
        <Route path='/' component={MainContainer}>
          <IndexRoute component={Home} />
          <Route path='login' component={Login}  onEnter={requireEmail} >
            
          </Route>
          <Route path='signup' component={Signup} onEnter={requireEmail} />
          <Route path='home' component={Home} />
          <Route path='profile' component={UserProfile} onEnter={requireAuth} />
        </Route>
    </Router>
  ), document.getElementById('content')
);
