import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { Layout, Menu, Icon, Button, Input, Modal, Form, message, BackTop} from 'antd';
import axios from 'axios';

import logo from "../Logo.png";

const { Header, Content, Footer, Sider} = Layout;
const SubMenu = Menu.SubMenu;
const FormItem = Form.Item;
const Search = Input.Search;
const MyIcon = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_892123_7nh39oitpz3.js', 
});

// The layout of the website (SiderBar, Header, Footer)
class CustomLayout extends Component {
  constructor(props){
    super(props);
    this.state = {playlists:[], 
      visible: false, //The visibility of add playlist modal
      authStr:"Token " + localStorage.getItem("token"), 
      services:{
        has_spotyfy:false,
        has_youtube:false,
      }
    }
  }

  componentDidMount() {
    this.getPlaylist();
    this.getService();
  }

  // send request to get playlists of current user
  getPlaylist(){
    axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/myplaylists/', { 'headers': { 'Authorization': this.state.authStr } })
    .then( res => {
      this.setState({playlists:res.data, visible:false});
    });
  }

  //get user's services
  getService(){
    axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/user/api/myservices/', { 'headers': { 'Authorization': this.state.authStr } })
    .then( res => {
      var has_spotify = false
      var has_youtube = false
      if (res.data.find((item)=>item.service_name == "Spotify") != null){
        has_spotify = true
      }
      if (res.data.find((item)=>item.service_name == "Youtube") != null){
        has_youtube = true
      }
      console.log(has_spotify)
      this.setState({services:{has_youtube:has_youtube, has_spotify:has_spotify}, visible:false});
    });
  }



  // TODO: handle the search reaults from youtube
  handleSearch = (value)=>{
    this.props.app.history.push("/search?keyword=" + value)
  }

  // Post the new playlist to server to add it to database 
  handleSubmit = async event=> {
    event.preventDefault();
    try {
      axios.post('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/add_playlist/', {'name': this.state.newPlaylist }  ,{'headers': { 'Authorization': this.state.authStr }})
      .then(res => {
        if (res.status == 200) {
          this.getPlaylist();
          message.success(this.state.newPlaylist + " is added to your playlists!")
        }
      })
    } catch (e) {
        message.error(e.message);
    }
  }

  //send request to add service, authorise in the pop up window
  handleAddService = (service) =>{
    var backend = 'http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/' + service + "/auth/"
    try {
      axios.get(backend ,{'headers': { 'Authorization': this.state.authStr }})
        .then(res => {
            if (res.status == 200) {
              window.open(res.data.redirect_url);
            }
        })
    } catch (e) {
        message.error(e.message);
    }
  }

  addedService(item){
    message.info("you already added " + item)
  }

  render(){
    var playlists = this.state.playlists;
    var services = this.state.services;
    var openkey = [] //current opened submenu keys
    var has_spotify = this.state.services.has_spotify
    var has_youtube = this.state.services.has_youtube

    if (this.props.app.open_playlist) openkey.push("/playlists")
    if (this.props.app.open_service) openkey.push("/services")
    console.log(this.props.app)
    return (
      <Layout>
        {/* Sider Starts*/}
        <Sider 
          collapsible  
          collapsed={this.props.app.fold}
          trigger={null}
          style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}
        >
          {/* Logo */}
          <div className="logo"><img style={{ width: 80, height: 80, marginLeft: this.props.app.fold ? 0 : 60}}src={logo} /></div>
          
          {/* Modal to add new playlist */}
          <Modal
            title="Add new playlist"
            maskClosable
            visible={this.state.visible}
            okText="Add"
            onOk={e=>this.handleSubmit(e)}
            onCancel={()=>{this.setState({visible: false,});}}
          >
          <Form id="addForm" onSubmit={this.handleSubmit}>
            <FormItem label="Name">
              <Input onChange={(event) => {this.state.newPlaylist= event.target.value}}/>
            </FormItem>
          </Form>
          </Modal>

        {/* Menu */}
          <Menu 
            theme="dark" 
            mode="inline"
            selectedKeys={[this.props.app.location.pathname + this.props.app.location.search]}
            openKeys={openkey}
          >
            
            {/* Songs */}
            <Menu.Item key="/songs">
              <Link to="/songs">
                <Icon type="caret-right" theme="outlined" />
                <span className="nav-text">Songs</span>
              </Link>
            </Menu.Item>

            {/* Playlists */}
            <SubMenu key="/playlists" onTitleClick = {() => this.props.app.handleOpen("playlist")}
            title={<span><Icon type="customer-service" theme="outlined"/><span>Playlists</span></span>}>
              {
                this.state.playlists.length != 0 ? 
                playlists.map(item=>(
                  <Menu.Item key={"/playlist?playlist_id=" + item.id}>
                    <Link to={"/playlist?playlist_id=" + item.id}>
                      <span className="nav-text">{item.name}</span>
                    </Link>
                  </Menu.Item>
                  )) : <Menu.Item> Loading... </Menu.Item>
              }

              {/* Button to add new playlist */}
              <Menu.Item>
                <Button style={{paddingLeft:4, marginRight:4}} ghost size="small" shape="circle" icon="plus" 
                onClick={()=>{this.setState({visible: true,});}}/> Add
              </Menu.Item>
            </SubMenu>

            {/* Artists */}
            <Menu.Item key="/artists">
              <Link to="/artists">
                <Icon type="user" theme="outlined" />
                <span className="nav-text">Artists</span>
              </Link>
            </Menu.Item>

            {/* Albums */}
            <Menu.Item key="/albums">
              <Link to="/albums">
                <Icon type="switcher" theme="outlined" />
                <span className="nav-text">Albums</span>
              </Link>
            </Menu.Item>

            {/* Services */}
            <SubMenu key="/services" onTitleClick = {() => this.props.app.handleOpen("services")}
            title={<span><Icon type="upload"/><span>Services</span></span>}>
              <Menu.Item onClick={()=>{has_spotify 
                ? this.addedService("Spotify")
                : this.handleAddService("spotify")}}>
                <MyIcon type={has_spotify ? "icon-social-spotify" : "icon-405-spotify"} />
                Spotify
              </Menu.Item>
               <Menu.Item onClick={()=>{has_youtube
                ? this.addedService("Youtube")
                : this.handleAddService("youtube")}}>
                <MyIcon type={has_youtube ? "icon-social-youtube" : "icon-socialyoutube"} />
                Youtube
              </Menu.Item>
            </SubMenu>

          </Menu>
        </Sider>
        {/* Sider Ends*/}

        {/* Logout Button */}
        <Button style={{ marginLeft: this.props.app.fold ? 20 : 60, position: 'fixed', bottom: '10vh'}} 
        icon={this.props.app.fold ? "logout" : null}
        type="danger" onClick={this.props.app.handleLogout}>{
          this.props.app.fold ? "" : "Log out"}
        </Button>

        {/* Fold/Unfold Button */}
        <Button
              shape="circle"
              ghost
              style={{position:'fixed', top: "50vh", marginLeft: this.props.app.fold ? 20 : 150, position: 'fixed', bottom: 60}}
              className="trigger"
              icon={this.props.app.fold ? 'double-right' : 'double-left'}
              onClick={this.props.app.handleFold}
            />  

        <Layout style={{ marginLeft: this.props.app.fold ? 80 : 200 }}>
          <Header style={{ background: '#fff', padding: 0 }}>

            {/* Seach Bar */}
            <Search
              placeholder="Search on Youtube"
              enterButton="Search"
              style={{ width: 400, marginLeft: 40}}
              size="large"
              onSearch={value => this.handleSearch(value)}
            />
          </Header>

          {/* Content */}
          <Content style={{overflow: 'initial' }}>
            <div style={{ padding: 24, background: '#fff', textAlign: 'center' }}>
              {this.props.children}
            </div>
            <BackTop/>
          </Content>
          
          {/* Footer */}
          <Footer style={{ textAlign: 'center' }}>
            Bird player 2018
          </Footer>
        </Layout>
      </Layout>
    )
  }
}

export default CustomLayout;