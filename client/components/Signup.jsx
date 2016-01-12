import React from 'react';
import Auth from '../services/AuthService'

export default class Signup extends React.Component {

  constructor() {
    super()
  }

  signup(e) {
    e.preventDefault();
    Auth.signup(this.refs.email.value, this.refs.password.value, 
      {firstName: this.refs.firstName.value, lastName: this.refs.lastName.value})
      .catch(function(err) {
        alert("There's an error signup");
        console.log("Error signup", err);
      });
  }

  render() {
    return (
      <div className="login jumbotron center-block">
        <h1>Signup</h1>
        <form role="form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="text" className="form-control" id="email" ref="email" placeholder="email" />
        </div>
      <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" className="form-control" id="password" ref="password" placeholder="Password" />
      </div>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input type="text" className="form-control" id="firstName" ref="firstName" placeholder="First Name" />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" className="form-control" id="lastName" ref="lastName" placeholder="Last Name" />
        </div>
        <button type="submit" className="btn btn-default" onClick={this.signup.bind(this)}>Submit</button>
      </form>
    </div>
    );
  }
}


