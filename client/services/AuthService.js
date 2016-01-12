import request from 'reqwest';
import constants from '../constants/LoginConstants';
import LocalStore from '../LocalStore';

class AuthService {

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

  signup(email, password, profile) {
    request({
      url: constants.SIGNUP_URL,
      method: 'POST',
      crossOrigin: true,
      type: 'json',
      data: {
        email, password, profile
      }
    })
      .then(this.handleAuth);
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
          id, fields: ['firstName', 'lastName']
        }
      })
        .then((response) => {
          cb(response.profile || {});
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
