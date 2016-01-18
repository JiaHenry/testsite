import React from 'react';
import LocalStore from '../LocalStore';
import Auth from '../services/AuthService'

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.checkEmail = this.checkEmail.bind(this);
  }
  
  checkEmail(e) {
    e.preventDefault();
    
    let email = this.refs.email.value;
    Auth.checkEmail(email, (error, data) => {
      if (error) {
        return this.setState({error: error});
      }
      
      this.setState({error: null});
      
      const { history } = this.props;
    
      history.email = email;
    
      if(data.id == null ) {  
        history.pushState(null, '/signup');
      } else {
        history.pushState(null, '/login');
      }
    });
  }
    
  render() {
    return (
      <div className="login jumbotron center-block">
        <h4>Enter Your Email to Get Started</h4>
        <form role="form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="text" className="form-control" ref="email" placeholder="email" />
        </div>
        <button type="submit" className="btn btn-default" onClick={this.checkEmail}>Submit</button>
        <br />
        <span className="label label-danger">{this.state && this.state.error}</span>
      </form>
    </div>
    );
  }
}
