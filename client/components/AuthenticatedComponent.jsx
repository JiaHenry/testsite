import React from 'react';
import LocalStore from '../LocalStore';

export default (ComposedComponent) => {
  return class AuthenticatedComponent extends React.Component {

    static willTransitionTo(transition) {
      if (!LocalStore.isLoggedIn()) {
        transition.redirect('/login', {}, {'nextPath' : transition.path});
      }
    }

    constructor() {
      super()
      this.state = this._getLoginState();
    }

    _getLoginState() {
      return {
        userLoggedIn: LocalStore.isLoggedIn(),
        user: LocalStore.user,
        jwt: LocalStore.jwt
      };
    }

    componentDidMount() {
      //this.changeListener = this._onChange.bind(this);
      //LocalStore.addChangeListener(this.changeListener);
      this._onChange(this);
    }

    _onChange() {
      this.setState(this._getLoginState());
    }

    componentWillUnmount() {
      //LocalStore.removeChangeListener(this.changeListener);
    }

    render() {
      return (
      <ComposedComponent
        {...this.props}
       />
      );
    }
  }
};