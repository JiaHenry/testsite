import React from 'react';
import { render } from 'react-dom';
import { Router, Route, RouteHandler, Link } from 'react-router';
import { IndexRoute } from 'react-router';
import { Redirect } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import UserProfile from './components/UserProfile';
import Auth from './services/AuthService';
import LocalStore from './LocalStore';

const MainContainer = React.createClass({
  getInitialState() {
    console.log("mc_init");
      return { isLoggedIn: LocalStore.isLoggedIn() }
    },
    
  componentWillMount() {
    //if (this._isLoggedIn !== LocalStore.isLoggedIn()) {
      //this._isLoggedIn !== LocalStore.isLoggedIn();
      this.setState({ isLoggedIn: LocalStore.isLoggedIn()});
    //}
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
        <nav className="navbar navbar-default">
          <div className="navbar-header">
            <a className="navbar-brand" href="/">Home</a>
          </div>
          {this.headerItems()}
        </nav>
        <div>
        <div>
           {this.props.children}
        </div>
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

const Welcome = React.createClass({
  render() {
    return <div>Welcome to the app!</div>
  }
});

const App = React.createClass({
    render() {
        return (
            <div>
                <h1>App</h1>
                <ul>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/inbox">Inbox</Link></li>
                </ul>
                {this.props.children}
            </div>
        )
    }
});

const About = React.createClass({
   render() {
       return (<h3>About</h3>)
   } 
});

const Inbox = React.createClass({
   render(){
       return (
           <div>
             <h2>Inbox</h2>
             {this.props.children || "Welcome to your inbox"}
            </div>
       )
   } 
});


const User = React.createClass({
    getInitialState: function() {
      return { data: undefined }
    },
    getData: function(id) {
      let self = this;
      this.setState({ data: undefined });
      setTimeout(() => {
      $.post(
        "getUser", 
        {id: id, fields: ["id", "name"]}, 
        function(data) {
          console.log(JSON.stringify(data));
          self.setState({data: data});
      })
      }, 3000);
    },
    componentWillMount: function() {
      console.log("msg:componentWillMount");
      this.getData(this.props.params.id);
    },
    componentWillReceiveProps: function(nextProps){
      console.log("msg:componentWillReceiveProps");
      this.getData(nextProps.params.id);
    },
    render() {
      console.log("message:render", Date.now());
      if (this.state.data === undefined) {
        return <div>Loading ....</div>
      }
      
      if (!this.state.data) {
        return <div>No matched data</div>
      }
      
      return <div><pre>{JSON.stringify(this.state.data)}</pre></div>         
    }
});

function requireAuth(nextState, replace) {
  if (!LocalStore.isLoggedIn()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname }
    })
    
  }
}

render((
    <Router history={createBrowserHistory()}>
        <Route path='/' component={MainContainer}>
          <IndexRoute component={Home} />
          <Route path='login' component={Login}>
            
          </Route>
          <Route path='signup' component={Signup} />
          <Route path='about' component={About} />
          <Route path='home' component={Home} />
          <Route path='profile' component={UserProfile} onEnter={requireAuth} />
        </Route>
    </Router>
  ), document.getElementById('content')
);

/*
<Route path='profile' component={UserProfile} />
            <Route path='user' component={User} >
                <Route path='profile' component={UserProfile} />
            </Route>

*/