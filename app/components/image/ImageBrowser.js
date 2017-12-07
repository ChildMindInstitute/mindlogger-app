import React, { Component } from 'react'
import {connect} from 'react-redux'
import { submit } from 'redux-form'
import { Image } from 'react-native'
import {Row, Col, Content, Button, Text,List, ListItem, Thumbnail, Left, Right, Icon, Body, Item} from 'native-base'
import {base, storageRef} from '../../firebase'

class ImageBrowser extends Component {
    componentWillMount() {
        let path = this.props.path || 'images'
        this.setState({path})
        this.rebind(path)
    }

    rebind(path) {
        if(this.ref)
            base.removeBinding(this.ref);
        this.ref = base.bindToState(path, {
            context: this,
            state: 'images',
            defaultValue: [],
            asArray: true
        });
    }

    imageSelect(image) {
        this.props.onSelectImage(image, this.state.path)
    }

    folderSelect(item) {
        let {path} = this.state
        console.log(item)
        path = path + "/" + item.key + "/images"
        this.setState({path})
        this.rebind(path)
    }

    toggleFolderForm = () => {
        this.setState({form: 'folder'})
    }

    toggleImageForm = () => {
        this.setState({form: 'image'})
        console.log(this.state)
    }

    upFolder = () => {
        let {path} = this.state
        let arr = path.split("/")
        if(arr.length>2) {
            arr.splice(-2,2)
            path = arr.join("/")
            this.setState({path})
            this.rebind(path)
        }
    }

    render () {
        const {path} = this.state
        const images = this.state.images || []
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
            {images.map( (item, idx) => 
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
    submitForm: name => dispatch(submit(name))
})

export default connect(null, mapDispatchToProps)(ImageBrowser);