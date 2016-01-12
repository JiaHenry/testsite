import React from 'react';
//import AuthenticatedComponent from './AuthenticatedComponent';
import LocalStore from '../LocalStore';

export default //AuthenticatedComponent(
  class Home extends React.Component {
  render() {
    let user = LocalStore.user;
    
    return (<h1>Hello {user ? user.email : ''}</h1>);
  }
}
//);