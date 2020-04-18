import React from 'react';
import axios from 'axios';

import Albums from '../components/Album'

class AlbumList extends React.Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    state = {
        albums: []
    };

    //send get request to the server for the albums list
    componentDidMount() {
        this.setState({loading:true})
        const authStr = "Token " + localStorage.getItem("token");
        axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/albums/', {'headers': {'Authorization': authStr}})
        .then(res => {
            this.setState({
                albums: res.data,
                loading: false,
            });
        })
    }

    //handle the click on the album
    handleClick(item) {
        var id = item.id;
        this.props.props.history.push("/albums_songs?id=" + id);
    };

    render() {
        return (
            <Albums loading={this.state.loading} data={this.state.albums} func={this.handleClick}/>
        )
    }
}

export default AlbumList
