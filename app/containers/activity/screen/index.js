import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Content, Text } from 'native-base';
import {
  Player,
  MediaStates
} from 'react-native-audio-toolkit';

import {randomLink} from '../../../helper';
import TextEntry from './TextEntry';
import ScreenButton from './ScreenButton';
import SurveySection from './survey';
import GImage from '../../../components/image/Image';

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
    this.setState({
      answer: this.props.answer && this.props.answer.data,
      validated: true
    });
  }
  componentDidMount() {
    let {screen: {meta: data}} = this.props;
    data = data || {};
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

  setAnswer(data, validated) {
    let {answer} = this.state;
    answer = {...answer, ...data};
    if (validated == undefined) {
      this.setState({answer});
    } else {
      this.setState({answer, validated});
    }
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
    const {screen: {meta: data}, onNext, path} = this.props;
    onNext({'@id': path, data: undefined}, data.skipToScreen);
  }

  handleNext = () => {
    const {screen, onNext, path} = this.props;
    const {meta: data} = screen;
    const {answer, nextScreen, validated} = this.state;
    onNext({'@id': path, data: answer}, nextScreen);
    
  }

  renderButtons() {
    let {
      screen: {meta: data},
      globalConfig,
      length,
    } = this.props;
    data = data || {};
    const {answer, nextScreen, validated} = this.state;
    const {surveyType, canvasType} = data;

    const isFinal = (nextScreen || (this.props.index + 1)) >= length;

    // Configuration
    const permission = globalConfig.permission || {};
    const skippable = data.skippable || permission.skip;
    const prevable = permission.prev;

    let buttonText = 'Take';
    const spinner = false;
    if (answer) {
      buttonText = 'Redo';
      return (<View style={styles.footer}>
        { prevable ? 
          <ScreenButton transparent onPress={this.handlePrev} text="<"/>
          :
          <ScreenButton transparent/>
        }
        <ScreenButton onPress={this.handleReset} text={buttonText}/>
        {
          validated ?
            <ScreenButton transparent onPress={this.handleNext} text={isFinal ? "Done" : ">"}/>
            :
            <ScreenButton transparent/>
        }
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
    let {screen: {meta: data}, globalConfig} = this.props;
    data = data || {};
    
    return (
      <View style={{flex: 1}}>
        <Content style={{ flex: 1}}>
          { data.pictureVideo && data.pictureVideo.display && data.pictureVideo.files.length > 0 &&
            <GImage file={data.pictureVideo.files} style={{width: '100%', height: 200, resizeMode: 'cover'}} />
          }
          <View style={styles.paddingContent}>
            <Text style={styles.text}>{data.text}</Text>
            {
              data.surveyType && <SurveySection
                type={data.surveyType}
                config={data.survey}
                answer={this.answer('survey')}
                onChange={(survey, validated) => this.setAnswer({survey}, validated)}
                onNextChange={this.onNextChange}
                />
            }
            {
              data.textEntry && data.textEntry.display && 
              <TextEntry
                style={styles.text}
                config={data.textEntry}
                answer={this.answer('text')}
                onChange={text => this.setAnswer({text})}/>
            }
          </View>
        </Content>
        {this.renderButtons()}
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  screen: state.core.objects && state.core.objects[`folder/${ownProps.path}`][`item/${ownProps.name}`] || {meta:{}},
  answers: state.core.answerData && state.core.answerData[ownProps.path],
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(Screen)
