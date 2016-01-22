import React from 'react';
import Auth from '../services/AuthService'

export default class Signup extends React.Component {

  constructor(props) {
    super(props)

    const { history } = this.props;
    
    console.log("signup-cc history", history);
    
    this.email = history.email;    
    
    this.signup = this.signup.bind(this);
  }

  signup(e) {
    e.preventDefault();
    
    this.setState({error: null});
    
    let password = this.refs.password.value,
        password2 = this.refs.confirmpassword.value;
        
    if (password !== password2) {
      return this.setState({error: 'Password mismatch'});
    }
        
    Auth.signup(this.email, password,  {username: this.refs.username.value}, 
      (error, data) => {
          if(error) {
              return this.setState({error: error});
            }
            
             const { history } = this.props;
         
         history.pushState(null, '/profile');    
      });
  }

  render() {
    return (
      <div className="login jumbotron center-block">
        <h4>Create Account</h4>
        <form role="form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input type="text" className="form-control" ref="username" placeholder="Username" />
        </div>
      <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" className="form-control" ref="password" placeholder="Password" />
      </div>
      <div className="form-group">
          <label htmlFor="confirmpassword">Confirm Password</label>
          <input type="password" className="form-control" ref="confirmpassword" placeholder="Retype Password" />
      </div>
        <button type="submit" className="btn btn-default" onClick={this.signup}>Submit</button>
        <span className="label label-danger">{this.state && this.state.error}</span>
      </form>
    </div>
    );
  }
}


