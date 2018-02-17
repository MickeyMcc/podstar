import React from 'react';
import { PaneStyle, ButtonStyle, InputStyle } from '../styles.jsx';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    }
  }

  userNameEntry(event) {
    this.setState({ username: event.target.value });
  }

  passwordEntry(event) {
    this.setState({ password: event.target.value });
  }

  handleSubmit(event) {
    this.props.login(this.state.username, this.state.password);
  }

  render() {

    return (
      <div style={PaneStyle} >
        <div style={{ width: '100%' }}>
          <h3 style={{ martinTop: '10px' }}>Log In Here</h3>
          <h5>Username</h5>
          <input style = {InputStyle} type='text' placeholder= 'username' 
            value={this.state.username} onChange={this.userNameEntry.bind(this)} />
          <h5>Password</h5>
          <input style={InputStyle} type='password' placeholder= 'password' 
            value={this.state.password} onChange={this.passwordEntry.bind(this)} />
          <br/>
          <button style={ButtonStyle} onClick={this.handleSubmit.bind(this)} > Login </button>
        </div>
      </div>
    )
  }
}

export default Login;