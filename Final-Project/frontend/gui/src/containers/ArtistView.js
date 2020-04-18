import React, {Component} from 'react';
import 'antd/dist/antd.css';

import CustomLayout from './Layout'
import ArtistList from './ArtistListView'

// The view for artists page
class ArtistView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="ArtistView">
                <CustomLayout app={this.props}>
                    <ArtistList props={this.props}/>
                </CustomLayout>
            </div>
        );
    }
}

export default ArtistView;
