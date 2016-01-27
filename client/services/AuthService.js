import request from 'reqwest';
import constants from '../constants/LoginConstants';
import LocalStore from '../LocalStore';

class AuthService {

  checkEmail(email, cb) {
    // TODO, check email local before send to server
    email = email.toLowerCase();
    
    request({
      url: 'checkEmail',
      method: 'POST',
      crossOrigin: true,
      type: 'json',
      data: {
        email
      }
    })
      .then((response) => {
        response = response || {};
        let error = response.error;

        if (!error) {
            LocalStore.saveEmail(email);
            cb(null, response);
        } else {
          cb(error);
        }
      });
  }
  
  login(email, password, cb) {
    request({
      url: constants.LOGIN_URL,
      method: 'POST',
      crossOrigin: true,
      type: 'json',
      data: {
        email, password
      }
    })
      .then((response) => {
        let error = response.error;

        if (!error) {
          response.email = email;
          this.handleAuth(response);
          cb(null);
        } else {
          cb(error);
        }
      });
  }

  logout() {
    LocalStore.logout();
  }

  signup(email, password, extra, cb) {
    request({
      url: constants.SIGNUP_URL,
      method: 'POST',
      crossOrigin: true,
      type: 'json',
      data: {
        email, password, extra
      }
    })
      .then((response) => {
        let error = response.error;

        if (!error) {
          response.email = email;
          this.handleAuth(response);
          cb(null);
        } else {
          cb(error);
        }
      });
  }
 
  updateContact(contact, cb) {
    let email = LocalStore.user.email;

    console.log('service.updateContact', contact);
    
    request({
      url: "updateContacts",
      method: 'POST',
      crossOrigin: true,
      type: 'json',
      data: {
        email, contacts: contact
      }
    })
    .then((response) => {
          cb();
        });
  }

  getContact(cb) {
    let email = LocalStore.user && LocalStore.user.email;

    if (email == null) {
      cb({});
    } else {
      request({
        url: "getContacts",
        method: 'POST',
        crossOrigin: true,
        type: 'json',
        data: {
          email
        }
      })
        .then((response) => {
          cb(response || {});
        });
    }
  }

  handleAuth(response) {
    var data = response;
      
    //if (data.error) { return data.error;}
      
    LocalStore.saveToken(data);

    return data.jwt;
  }
}

export default new AuthService()
