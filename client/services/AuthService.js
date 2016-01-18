import request from 'reqwest';
import constants from '../constants/LoginConstants';
import LocalStore from '../LocalStore';

class AuthService {

  checkEmail(email, cb) {
    // TODO, check email local before send to server
    
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

  updateProfile(profile) {
    let id = LocalStore.user.id;

    console.log('service.updateProfile', profile);
    
    request({
      url: "updateProfile",
      method: 'POST',
      crossOrigin: true,
      type: 'json',
      data: {
        id, profile
      }
    });
  }
  
  updateContact(contact, cb) {
    let id = LocalStore.user.id;

    console.log('service.updateContact', contact);
    
    request({
      url: "updateContact",
      method: 'POST',
      crossOrigin: true,
      type: 'json',
      data: {
        id, contacts: contact
      }
    })
    .then((response) => {
          cb();
        });
  }

  getProfile(cb) {
    let id = LocalStore.user && LocalStore.user.id;

    if (id == null) {
      cb({});
    } else {

      request({
        url: "getProfile",
        method: 'POST',
        crossOrigin: true,
        type: 'json',
        data: {
          id, fields: [
            'shipto {firstName, lastName, company, address1, address2, city, state, postal, country, telephone} ', 
            'billto {firstName, lastName, company, address1, address2, city, state, postal, country, telephone, email}',
            'sameBillto']
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
