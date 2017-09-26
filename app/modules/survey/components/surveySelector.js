import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Radio, Right } from 'native-base';
import { connect } from 'react-redux';

const styles = StyleSheet.create({
  button: {
    width: 100,
    height: 30,
    padding: 10,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3
  }
});

class SurveySelector extends Component {
  constructor(props) {
    super(props);
    
  }

  render() {
    const { rows } = this.props;
    this.state = {
      items: ['row 1', 'row 2']
    }

    return (
      <Content>
      <List dataArray={this.state.items}
            renderRow={(item) =>
          <ListItem>
            <Text>{item}</Text>
            <Right>
              <Radio selected={true} />
            </Right>
          </ListItem>
        }>
      </List>
      </Content>
    )
  }
}

export default connect(state => ({
    
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(SurveySelector);
