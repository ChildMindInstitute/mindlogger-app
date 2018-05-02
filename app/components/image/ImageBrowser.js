import React, { Component } from 'react'
import {connect} from 'react-redux'
import { submit } from 'redux-form'
import { Image } from 'react-native'
import {Row, Col, Content, Button, Text,List, ListItem, Thumbnail, Left, Right, Icon, Body, Item} from 'native-base'
import config from '../../config';
import { getFiles } from '../../actions/api';


class ImageBrowser extends Component {
    componentWillMount() {
        let path = 'images/'
        this.setState({path})
        this.props.getFiles('')
        
    }
    imageSelect(image) {
        this.props.onFile(image)
    }

    folderSelect(item) {
        let {path} = this.state
        path = item.file
        this.setState({path})
    }

    upFolder = () => {
        let {path} = this.state
        let arr = path.split("/")
        if(arr.length>2) {
            arr.splice(-2,2)
            arr.push('')
            path = arr.join("/")
            this.setState({path})
        }
    }

    render () {
        const {path, loading} = this.state
        const {files} = this.props
        let count = path.split("/").length
        let list = []
        files.forEach(file => {
            let arr = file.split("/")
            if (file != path && file.startsWith(path) && (arr.length - count <= 1)) {
                let item = {path: `https://${config.s3_image.bucket}.s3.amazonaws.com/${file}`}
                if (file.endsWith("/")) {
                    item.is_folder = true
                    item.name = arr[arr.length-2]
                } else {
                    item.name = arr[arr.length-1]
                }
                list.push(item)
            }
        })
        return (
        <Content padder style={{backgroundColor: 'white'}}>
            <Item>
                <Left>
                    <Button iconLeft transparent onPress={this.upFolder}>
                        <Icon name='arrow-round-up' />
                        <Text>Up</Text>
                    </Button>
                </Left>
                <Body>
                    <Text>{path}</Text>
                </Body>
                <Right>
                    <Button transparent onPress={() => this.imageSelect(null)}>
                        <Icon name='close' />
                    </Button>
                </Right>
            </Item>
            <List>
            {list.map( (item, idx) => 
                item.is_folder ? (<ListItem key={idx} onPress={() => this.folderSelect(item)}>
                    {//<Image source="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFfSURBVGhD7ZK9LkRRFEZPodGI+IufKJDcufS8A57Bo5BMLyq9MVHdhJGIQYgCCXM1k4lSotXRoPuOfWSX+4w7MsZO7JWsbvbJ+nLHGYZhGMZvgIpbwo7b8hWXFZF+X0XVjfG5DiiqTHG+U2n4g5oxFLMqRRZVzRj6GjUpsBNVjKEhza+gvT7vDwe9Pxr+kTgeecb5ZL1rnk3soj60wJnfQ0Navjbg/V3ifZ6qErcJcDq+zantQdb/KD2iSZyMrnFuHFxMvUjHmsTl9BPnxsHVzLt0rElqfOPcOLie/ZCONRkaOTeODemhhYb4m7lX6ViV1Mi5cdBIW+KxIkMj58axIT3UhmjThmjThmjThmjThmjThmjznw3J06Z0rMnQyLlxkJcOpGNNolHa59w4uJ9fkY41iTxZ5tz20KfboP8hpEf+0tBErnNmMWj1Ig3apAcyDYaW0MR5hmEYhtFFnPsEarLYUOTpRhkAAAAASUVORK5CYII=" onPress={() => this.folderSelect(item)}/>
                    }
                    <Left>
                        <Icon name='folder' />
                    </Left>
                    <Body>
                        <Text>{item.name}</Text>
                    </Body>
                </ListItem>) :
                (<ListItem key={idx} onPress={() => this.imageSelect(item)}>
                    <Left>
                      <Thumbnail square source={{uri: item.image_url}} />
                    </Left>
                    <Body>
                        <Text>{item.name}</Text>
                    </Body>
                    
                </ListItem>)
                ) }
            </List>
        </Content>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    submitForm: name => dispatch(submit(name)),
    getFiles: path => dispatch(getFiles(path))
})

const mapStateToProps = (state) => ({
    files: state.core.files || [],
})

export default connect(mapStateToProps, mapDispatchToProps)(ImageBrowser);