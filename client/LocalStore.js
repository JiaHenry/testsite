class LocalStore {
  constructor() {
    console.log("ls:cc");
    this._user = null;
  }
  
  get user() {
    return this._user;
  }
  
  get jwt() {
    return localStorage.getItem('jwt');
  }
  
  isLoggedIn() {
    return !!this._user;
  }
  
  saveToken(data) {
    this._user = data;
    localStorage.setItem('jwt', data.jwt);
  }
  
  logout() {
    this._user = null;
    localStorage.removeItem('jwt');
  }
}

export default new LocalStore();