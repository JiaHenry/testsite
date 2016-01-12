import React from 'react';
import Auth from '../services/AuthService';
//import AuthenticatedComponent from './AuthenticatedComponent';

export default //AuthenticatedComponent(
    class UserProfile extends React.Component {

  constructor(props) {
    super(props);
  
    this.state = {firstName: '', lastName: ''};
    this.editProfile = this.editProfile.bind(this);
    this.onDataEdit = this.onDataEdit.bind(this);
    this.dirty = false;
  }

componentWillMount() {
  Auth.getProfile((data) => {
      this.setState({
        firstName: data.firstName || '', 
        lastName: data.lastName || ''
      });
    });  
}

  editProfile(e) {
    e.preventDefault();
    Auth.updateProfile({
      firstName: this.refs.firstName.value, 
      lastName: this.refs.lastName.value});
    this.dirty = false;
  }
  
  onDataEdit(e) {
    this.setState({[e.target.name]: e.target.value});
    this.dirty = true;
  }

  render() {
    return (
      <div className="login jumbotron center-block">
        <h1>Profile</h1>
        <form role="form">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input type="text" className="form-control" ref="firstName" name="firstName" placeholder="First Name"  value={this.state.firstName} onChange={this.onDataEdit} />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" className="form-control" ref="lastName" name="lastName" placeholder="Last Name"  value={this.state.lastName} onChange={this.onDataEdit} />
        </div>
        <button type="submit" className="btn btn-default" onClick={this.editProfile}>Submit</button>
      </form>
    </div>
    );
  }
}
//);
