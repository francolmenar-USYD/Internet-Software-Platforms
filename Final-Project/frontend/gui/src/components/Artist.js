import React from 'react';
import {List, Card} from 'antd';
import axios from "axios";

const {Meta} = Card;

// Album class renders artists in a list of cards form
const Artists = (props) => {
    return (
        <List loading={props.loading}
            grid={{gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3}}
            dataSource={props.data}
            renderItem={item => (
                <List.Item onClick={() => props.func(item)}>
                    <Card
                        hoverable
                    >
                        <Meta
                            title={item.name}
                        />
                    </Card>
                </List.Item>
            )}
        />
    )
}
export default Artists;
