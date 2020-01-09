import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Avatar from './Avatar';

export default ({...props}) => {
  const title = [styles.title];
  if (props.mainCard) {
    title.push(styles.mainCard);
  }
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Avatar
          title={props.icon}
          style={props.mainCard ? {transform: [{rotate: '180deg'}]} : {}}
          black={props.mainCard}
        />
        <View style={props.content ? styles.cardContent : styles.center}>
          <View style={styles.contentWrapper}>
            <Text style={title}>{props.title}</Text>
          </View>
          {props.content !== undefined && (
            <Text style={styles.content}>{props.content}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '80%',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 10,
  },
  cardBody: {
    flexDirection: 'row',
  },
  cardContent: {
    paddingHorizontal: 10,
    flex: 1,
  },
  contentWrapper: {
    flexDirection: 'row',
    textAlign: 'center',
    marginBottom: 3,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  content: {
    fontSize: 11,
    flexWrap: 'wrap',
  },
  mainCard: {
    fontSize: 14,
    paddingHorizontal: 20,
  },
  center: {
    justifyContent: 'center',
    flex: 1,
  },
});
