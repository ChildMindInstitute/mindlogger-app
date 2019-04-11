import React, { Component } from 'react';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import { Image } from 'react-native';
import { Row, Col, Content, Button, Text, List, ListItem, Thumbnail, Left, Right, Icon, Body, Item } from 'native-base';
// import config from '../../config';
// import { getFiles } from '../../state/api/api.actions';


class ImageBrowser extends Component {
  componentWillMount() {
    const path = 'images/';
    this.setState({ path });
    // this.props.getFiles('');
  }

    upFolder = () => {
      let { path } = this.state;
      const arr = path.split('/');
      if (arr.length > 2) {
        arr.splice(-2, 2);
        arr.push('');
        path = arr.join('/');
        this.setState({ path });
      }
    }

    folderSelect(item) {
      let { path } = this.state;
      path = item.file;
      this.setState({ path });
    }

    imageSelect(image) {
      this.props.onFile(image);
    }

    render() {
      const { path, loading } = this.state;
      const { files } = this.props;
      const count = path.split('/').length;
      const list = [];
      files.forEach((file) => {
        const arr = file.split('/');
        if (file !== path && file.startsWith(path) && (arr.length - count <= 1)) {
          const item = {};
          if (file.endsWith('/')) {
            item.is_folder = true;
            item.name = arr[arr.length - 2];
          } else {
            item.name = arr[arr.length - 1];
          }
          list.push(item);
        }
      });
      return (
        <Content padder style={{ backgroundColor: 'white' }}>
          <Item>
            <Left>
              <Button iconLeft transparent onPress={this.upFolder}>
                <Icon name="arrow-round-up" />
                <Text>Up</Text>
              </Button>
            </Left>
            <Body>
              <Text>{path}</Text>
            </Body>
            <Right>
              <Button transparent onPress={() => this.imageSelect(null)}>
                <Icon name="close" />
              </Button>
            </Right>
          </Item>
          <List>
            {list.map((item, idx) => (item.is_folder ? (
              <ListItem key={idx} onPress={() => this.folderSelect(item)}>
                {}
                <Left>
                  <Icon name="folder" />
                </Left>
                <Body>
                  <Text>{item.name}</Text>
                </Body>
              </ListItem>
            )
              : (
                <ListItem key={idx} onPress={() => this.imageSelect(item)}>
                  <Left>
                    <Thumbnail square source={{ uri: item.image_url }} />
                  </Left>
                  <Body>
                    <Text>{item.name}</Text>
                  </Body>

                </ListItem>
              ))) }
          </List>
        </Content>
      );
    }
}

const mapDispatchToProps = dispatch => ({
  submitForm: name => dispatch(submit(name)),
  // getFiles: path => dispatch(getFiles(path)),
});

const mapStateToProps = state => ({
  files: state.core.files || [],
});

export default connect(mapStateToProps, mapDispatchToProps)(ImageBrowser);
