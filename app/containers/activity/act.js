import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StatusBar} from 'react-native';
import { Container } from 'native-base';
import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import packageJson from '../../../package.json'

import baseTheme from '../../themes/baseTheme';
import { getItems, getObject, addFolder, addItem } from '../../actions/api';
import { setAnswer, addQueue } from '../../actions/coreActions';
import ActHeader from '../../components/header';
import ActProgress from '../../components/progress';
import Screen from './screen';


class Act extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    const {answers, setAnswer} = this.props;
    this.setState({index: 0});
    if(answers.length == 0) {
      setAnswer([]);
    }
  }

  showInfoScreen = () => {
    Actions.push("about_act");
  }

  render() {
    const {act, info, answers} = this.props;
    const {meta: data} = act;
    const {index} = this.state;
    return (
      <Container>
        <StatusBar barStyle='light-content'/>
        <ActHeader title={act.name} onInfo={info && this.showInfoScreen}/>
        { data.display && data.display.progress && <ActProgress index={index} length={data.screens.length} /> }
        <Screen
          key={index}
          index={index}
          path={act._id}
          name={data.screens[index]['name']}
          answer={answers[index]}
          onPrev={this.prev}
          onNext={this.next}
          globalConfig={data}
          length={data.screens.length}
          />
      </Container>
      );
  }

  prev = (answer) => {
    const {setAnswer, answers} = this.props;
    let {index} = this.state;
    answers[index] = answer;
    setAnswer(answers);
    let prevIndex = index - 1;
    while(prevIndex>=0) {
      if(answers[prevIndex]['@id']) {
        this.setState({index: prevIndex});
        return;
      }
      prevIndex = prevIndex - 1;
    }
    if (prevIndex<0) {
      Actions.pop();
    }
  }

  next = (answer, index) => {
    const {answers, setAnswer, act: {meta: data}} = this.props;
    const oldIndex = this.state.index;
    answers[oldIndex] = answer;
    const newIndex = index || oldIndex+1;
    if (newIndex<data.screens.length) {
      for (let i = oldIndex + 1; i < newIndex; i++) {
        answers[i] = {}
      }
      setAnswer(answers);
      this.setState({index: newIndex});
    } else {
      this.postAnswer(answers);
      setAnswer(undefined);
      Actions.pop();
    }
  }

  postAnswer(answers) {
    const {act, addFolder, actOptions, resCollection, volume, addItem, addQueue} = this.props;
    const payload = {
      ...actOptions,
      activity: {
        "@id": `folder/${act._id}`,
        name: act.name
      },
      "devices:os":`devices:${DeviceInfo.getSystemName()}`,
      "devices:osversion":DeviceInfo.getSystemVersion(),
      "deviceModel":DeviceInfo.getModel(),
      "appVersion": packageJson.name + packageJson.version,
      responses: answers,
      responseTime: Date.now()
    }
    let answerName = moment().format('YYYY-M-D') + ' ' + act.name;
    addQueue(answerName, payload, volume.name, resCollection._id);
    // return addFolder(volume.name,{},resCollection._id, 'folder', true).then(folder => {

    //   return addItem(answerName, payload, folder._id);
    // })
  }
}

export default connect(({core: {self, userData, act, actInfo, answerData, volume, actOptions,...core}}) => ({
    act,
    info: actInfo,
    actOptions: actOptions,
    volume: volume,
    resCollection: userData && self && userData[self._id].collections && userData[self._id].collections.Responses,
    answers: (answerData && answerData[act._id]) || [],
  }),
  {
    getObject, getItems, setAnswer, addFolder, addItem, addQueue
  }
)(Act);
