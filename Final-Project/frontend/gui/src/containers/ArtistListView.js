import React from 'react';
import axios from 'axios';

import Artists from '../components/Artist'

class ArtistList extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            artists: []
        };
    }

    //handle click on the album
    handleClick(item) {
        var id = item.id;
        this.props.props.history.push("/artists_songs?id=" + id);
    }

    //send get request to the server for the artists list
    componentDidMount() {
        this.setState({loading:true});
        const authStr = "Token " + localStorage.getItem("token");
        axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/artists/', {'headers': {'Authorization': authStr}})
        .then(res => {
            this.setState({
                artists: res.data,
                loading:false
            })
        })
    }

    render() {
        return (
            <Artists data={this.state.artists} loading={this.state.loading} func={this.handleClick}/>
        )
    }
}

export default ArtistList
