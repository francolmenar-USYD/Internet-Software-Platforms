import React from 'react';
import { List, Card } from 'antd';

const { Meta } = Card;

// Album class renders albums in a list of cards form
const Albums = (props) => {
  return (
    <List loading={props.loading}
      grid={{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3 }}
      dataSource={props.data}
      renderItem={item => (
        <List.Item onClick={() => props.func(item)}>
            <Card
              hoverable
              cover={<img alt="art" src={item.album_cover_url} />}
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
export default Albums;
