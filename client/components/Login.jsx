import React from 'react';
import Auth from '../services/AuthService'

export default class Login extends React.Component {

  constructor() {
    super()
  }

  login(e) {
    e.preventDefault();
    
    let self = this;
    
    Auth.login(this.refs.email.value, this.refs.password.value, (error) => {
      if(error) {
        return self.setState({error: error});
      } 
      
      self.setState({error: null});
      
      const { location, history } = self.props

      console.log("login done, start nav ...", location);
      
      if (location.state && location.state.nextPathname) {
        console.log("login nav", location.state.nextPathname);
        //self.context.router.replace(location.state.nextPathname)
        history.pushState(null, location.state.nextPathname);
      } else {
        console.log("login nav to home");
        //self.context.router.replace('/')
        history.pushState(null, '/');
      }
    });
    /*
      .catch(function(err) {
        alert("There's an error logging in");
        console.log("Error logging in", err);
      });
      */
  }

  render() {
    return (
      <div className="login jumbotron center-block">
        <h1>Login</h1>
        <form role="form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="text" className="form-control" id="email"  ref="email" placeholder="Username" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" className="form-control" id="password" ref="password" placeholder="Password" />
        </div>
        <button type="submit" className="btn btn-default" onClick={this.login.bind(this)}>Submit</button>
        <br />
        <span className="label label-danger">{this.state && this.state.error}</span>
      </form>
    </div>
    );
  }
}

