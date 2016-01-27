class LocalStore {
  constructor() {
    console.log("ls:cc");
    let data = localStorage.getItem('user');
    this._user = data && JSON.parse(data);
    this._email = this._user && this._user.email;
  }
  
  get user() {
    return this._user;
  }
  
  get email() {
      return this._email;
  }
  
  get jwt() {
    return localStorage.getItem('jwt');
  }
  
  isLoggedIn() {
    return !!this._user;
  }
  
  saveEmail(email) {
      this._email = email;
  }
  
  saveToken(data) {
    this._user = data;
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('user', JSON.stringify(data));
  }
  
  logout() {
    this._user = null;
    this._email = null;
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  }
}

export default new LocalStore();