import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {CachedImage} from "react-native-img-cache";
import { Content, Text } from 'native-base';
import {
  Player,
  MediaStates
} from 'react-native-audio-toolkit';

import {randomLink} from '../../../helper';
import TextEntry from './TextEntry';
import ScreenButton from './ScreenButton';
import SurveySection from './survey';

const styles = StyleSheet.create({
  content: {
    flexDirection: 'column'
  },
  padding: {
    padding: 20,
  },
  paddingContent: {
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'column',
    flexGrow: 1,
  },
  text: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
})
class Screen extends Component {
  static propTypes = {
    path: PropTypes.string
  }
  componentWillMount() {
    this.setState({answer: this.props.answer && this.props.answer.data});
  }
  componentDidMount() {
    const {screen: {meta: data}} = this.props;
    if(data.audio && data.audio.display && data.audio.files.length > 0) {
      this.player = new Player(randomLink(data.audio.files), {
        autoDestroy: true
      }).prepare((err) => {
          if (err) {
              console.log('error at _reloadPlayer():');
              console.log(err);
          } else {
              this.player.playPause((err, playing) => {
              })
          }
      });
    }
  }

  setAnswer(data) {
    let {answer} = this.state;
    answer = {...answer, ...data};
    this.setState({answer});
  }

  answer(key) {
    return this.state.answer && this.state.answer[key];
  }

  onNextChange = (nextScreen) => {
    this.setState({nextScreen})

  }

  handleReset = () => {
    this.setState({answer:undefined});
  }

  handlePrev = () => {
    this.props.onPrev();
  }

  handleSkip = () => {
    const {screen: {meta: data}, onSkip} = this.props;
    onNext({'@id': path, data: undefined}, data.skipToScreen);
  }

  handleNext = () => {
    const {screen, onNext, path} = this.props;
    const {meta: data} = screen;
    const {answer, nextScreen} = this.state;
    onNext({'@id': path, data: answer}, nextScreen);
  }

  renderButtons() {
    const {screen: {meta: data}} = this.props;
    const {answer} = this.state;
    const {surveyType, canvasType, skippable} = data;
    let buttonText = 'Take';
    const spinner = false;
    if (answer) {
      buttonText = 'Redo';
      return (<View style={styles.footer}>
        <ScreenButton transparent onPress={this.handlePrev} text="<"/>
        <ScreenButton onPress={this.handleReset} text={buttonText}/>
        <ScreenButton transparent onPress={this.handleNext} text=">"/>
      </View>);
    } else {
      return (<View style={styles.footer}>
        <ScreenButton transparent onPress={this.handlePrev} text="<"/>
        { canvasType ? 
        (<ScreenButton onPress={this.handleAction} text={buttonText}>{spinner && <Spinner />}</ScreenButton>)
        :
        <ScreenButton transparent/>
        }
        { skippable ?
          <ScreenButton transparent onPress={this.handleSkip} text="Skip"/>
          :
          <ScreenButton transparent/>
        }
      </View>);
    }
  }


  render() {
    const {screen: {meta: data}} = this.props;
    return (
      <View style={{flex: 1}}>
        <Content style={{ flex: 1}}>
          { data.pictureVideo && data.pictureVideo.display && data.pictureVideo.files.length > 0 &&
            <CachedImage style={{width: '100%', height: 200, resizeMode: 'cover'}} source={{uri: randomLink(data.pictureVideo.files)}}/>
          }
          <View style={styles.paddingContent}>
            <Text style={styles.text}>{data.text}</Text>
            {
              data.textEntry && data.textEntry.display && 
              <TextEntry
                config={data.textEntry}
                answer={this.answer('text')}
                onChange={text => this.setAnswer({text})}/>
            }
            {
              data.surveyType && <SurveySection
                type={data.surveyType}
                config={data.survey}
                answer={this.answer('survey')}
                onChange={survey => this.setAnswer({survey})}
                onNextChange={this.onNextChange}
                />
            }
          </View>
        </Content>
        {this.renderButtons()}
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  screen: state.core.data && state.core.data[ownProps.path] || {meta:{}},
  answers: state.core.answerData && state.core.answerData[ownProps.path],
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(Screen)
