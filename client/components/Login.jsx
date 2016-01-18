import React from 'react';
import Auth from '../services/AuthService'

export default class Login extends React.Component {

  constructor(props) {
    super(props)
   
    const { history } = this.props;
    
    console.log("login-cc history", history);
    
    this.email = history.email;
  }

  login(e) {
    e.preventDefault();
    
    let self = this;
    
    Auth.login(this.email, this.refs.password.value, (error, data) => {
      if(error) {
        return self.setState({error: error});
      } 
      
      self.setState({error: null});
      
      const { location, history } = self.props

      console.log("email check done, start nav ...");
      
      if (location.state && location.state.nextPathname) {
        console.log("login nav", location.state.nextPathname);
        //self.context.router.replace(location.state.nextPathname)
        history.pushState(null, location.state.nextPathname);
      } else {
        console.log("login nav to profile");
        //self.context.router.replace('/')
        history.pushState(null, '/profile');
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
        <h4>Account Login</h4>
        <form role="form">
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

