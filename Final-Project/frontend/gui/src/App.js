import React, {Component} from 'react';
import { Spin, Alert } from 'antd';
import axios from 'axios';
import Routes from './Routes';

import 'antd/dist/antd.css';

//The high level component contained in all path
class App extends Component {

  constructor(props) {

    super(props);
    this.state = {isAuthenticated: false, userId: "000000", fold: false, open_playlist:false, open_service:false, isLoading:true}
    const istoken = localStorage.getItem("token");// check if token exists

    if(istoken){
      try {
        const authStr = "Token " + istoken;
        // check user token against token in the database
        axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/user/api/get_user_detials/', {'headers': {'Authorization': authStr}})
          .then(res => {
            if (res.status == 200) {
              this.setState({isAuthenticated: true})
            }
            this.setState({isLoading:false})
        });
      } catch (e) {
        alert(e.message);
      }
    }else{
      this.state.isLoading = false
    }

  }

  setAuthenticated = ()=>{
    this.setState({isAuthenticated:true});
  }

  handleLogout = ()=>{
    this.setState({ isAuthenticated: false });
    localStorage.removeItem('token');
  }

  //handle fold/unfold sider
  handleFold = () => {
      this.setState({fold: !this.state.fold, open_playlist: false, open_service:false}) // Set Open to false
  };

  //handle open/close submenu
  handleOpen = (item) =>{
    item == "playlist" ? this.setState({open_playlist: !this.state.open_playlist}) :
    this.setState({open_service: !this.state.open_service}) 
  }


  render() {
    //props to be passed to next level
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      handleLogout: this.handleLogout,
      handleFold: this.handleFold,
      fold: this.state.fold,
      open_playlist: this.state.open_playlist,
      open_service:this.state.open_service,
      handleOpen: this.handleOpen,
      setAuthenticated: this.setAuthenticated,
    };

    if (this.state.isLoading){
      return(
        <div style={{marginLeft: "50vw", marginTop: "50vh"}} ><Spin size="large"/></div>)
    }else{
      return(
      <div className="App">
          <Routes childProps={childProps}/>
      </div>);
    }
  }
}

export default App;
