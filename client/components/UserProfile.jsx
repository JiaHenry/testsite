import React from 'react';
import Auth from '../services/AuthService';
//import AuthenticatedComponent from './AuthenticatedComponent';

export default //AuthenticatedComponent(
    class UserProfile extends React.Component {

  constructor(props) {
    super(props);
  
    this.state = {billto: {same: true}};
    this.updateContact = this.updateContact.bind(this);
    this.toggleBillto = this.toggleBillto.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.dirty = false;
  }

componentWillMount() {
  Auth.getProfile((data) => {
      this.setState(data);
    });
}

  toggleBillto(e) {
    this.setState({status: ""});
    this.setState({sameBillto: !this.state.sameBillto});
  }

  handleUpdate(name, data) {
    this.setState({status: ""});
    var contact = this.state[name];
    for(var key in data) {
      contact[key] = data[key];
    }
    this.setState(this.state);
  }

  updateContact(e) {
    e.preventDefault();
    
    this.setState({status: "Start update ..."});
    
    // collect contact information for update
    let sameBillto = this.refs.sameBillto.checked,
        shipto = this.refs.shipto,
        billto = this.refs.billto,
        data = {shipto: {}, sameBillto: sameBillto, billto: {} };
        
        this.getContatctInfo(shipto.refs, data.shipto);    
        
        if(!sameBillto) {
          this.getContatctInfo(billto.refs, data.billto);
        }
        
        console.log("contact for update", data);
        
      Auth.updateContact(data, () => {
        this.setState({status: "Done update"});
      });    
  }
  
  getContatctInfo(src, target) {
    for(var key in src) {
      target[key] = src[key].value;
    }
  }
  
  render() {
    return (
      <div className="login jumbotron center-block">
        <h4>Contact information</h4>
        <form role="form">
        <div>
          <div className="form-group columns-2" >
            <ContactInformation data={this.state.shipto}  name="shipto" ref="shipto" onChange={this.handleUpdate} />
          </div>
          <div className="form-group columns-2 columns-2-right" >
            <input type="checkbox" checked={ this.state.sameBillto } name="samebillto" id="samebillto" onChange={this.toggleBillto} ref="sameBillto" /> <label htmlFor="samebillto">Use Same Contact Info</label>
            { this.state.sameBillto ? "" : 
            
              <ContactInformation data={this.state.billto} email="true"  name="billto" ref="billto" onChange={this.handleUpdate} />
            }
          </div>
        </div>
        <br />
        <div>
          <button type="submit" className="btn btn-default" onClick={this.updateContact}>Submit</button>
        </div>
        <br />
        <span className="label label-success">{this.state.status}</span>
      </form>
    </div>
    );
  }
  }
//);

class ContactInformation extends React.Component {
  constructor(props) {
    super(props);
  
    this.state = props.data || {};
    this.name = props.name;
    this.onChange = props.onChange;
    this.onDataInput = this.onDataInput.bind(this);
    
  }
  
  componentWillReceiveProps(newProps) {
    this.state = newProps.data || {};
  }
  
  onDataInput(e) {
    let data = {[e.target.name]: e.target.value};
    this.setState(data);
    this.onChange(this.name, data);
  }
  
 render() {
   return (
     <div>
        { this.props.email ? 
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="text" className="form-control" ref="email" name="email" placeholder="Email"  value={this.state.email} onChange={this.onDataInput} />
          </div>
          : ""
        }
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input type="text" className="form-control" ref="firstName" name="firstName" placeholder="First Name"  value={this.state.firstName} onChange={this.onDataInput} />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input type="text" className="form-control" ref="lastName" name="lastName" placeholder="Last Name"  value={this.state.lastName} onChange={this.onDataInput} />
          </div>
          <div className="form-group">
          <label htmlFor="company">Company</label>
          <input type="text" className="form-control" ref="company" name="company" placeholder="Company"  value={this.state.company} onChange={this.onDataInput} />
          </div>
          <div className="form-group">
          <label htmlFor="address1">Address 1</label>
          <input type="text" className="form-control" ref="address1" name="address1" placeholder="Address 1"  value={this.state.address1} onChange={this.onDataInput} />
          </div>
          <div className="form-group">
          <label htmlFor="address2">Address 2</label>
          <input type="text" className="form-control" ref="address2" name="address2" placeholder="Address 2"  value={this.state.address2} onChange={this.onDataInput} />
          </div>
          <div className="form-group">
          <label htmlFor="city">City</label>
          <input type="text" className="form-control" ref="city" name="city" placeholder="City"  value={this.state.city} onChange={this.onDataInput} />
          </div>
          <div className="form-group">
          <label htmlFor="state">State/Province</label>
          <input type="text" className="form-control" ref="state" name="state" placeholder="State/Province"  value={this.state.state} onChange={this.onDataInput} />
          </div>
          <div className="form-group">
          <label htmlFor="postal">Postal Code</label>
          <input type="text" className="form-control" ref="postal" name="postal" placeholder="Postal Code"  value={this.state.postal} onChange={this.onDataInput} />
          </div>
          <div className="form-group">
          <label htmlFor="country">Country</label>
          <input type="text" className="form-control" ref="country" name="country" placeholder="Country"  value={this.state.country} onChange={this.onDataInput} />
          </div>
          <div className="form-group">
          <label htmlFor="telephone">Telephone</label>
          <input type="text" className="form-control" ref="telephone" name="telephone" placeholder="Telephone"  value={this.state.telephone} onChange={this.onDataInput} />
          </div>
        </div>
   );
 } 
}