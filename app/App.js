import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Card from './components/Card';

const allActivitiesCard = {
  icon: 'A',
  title: 'all my activities',
};

const content = [
  {
    icon: 'M',
    title: 'Healthy Brain Network',
    content: "Daily questions about your child's physical and mental health",
  },
  {
    icon: 'H',
    title: 'Healthy Brain Network (NIMH content)',
    content: 'Daily questions about physical and mental health, NIMH content',
  },
  {
    icon: 'L',
    title: 'Healthy Brain Network (NIMH content)',
    content: 'Daily questions about physical and mental health, NIMH content',
  },
];

const App: () => React$Node = () => {
  return (
    <View>
      <StatusBar barStyle="light-content" backgroundColor="#0A1333" />
      <SafeAreaView>
        <ImageBackground
          source={require('./assets/bg.jpg')}
          style={styles.body}>
          <Text style={styles.title}>Hi Jon!</Text>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={[styles.scroll, styles.center]}>
            <Card {...allActivitiesCard} mainCard={true} />
            {content.map((prop, index) => (
              <Card key={index} {...prop} />
            ))}
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </View>
  );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  body: {
    width,
    height,
  },
  center: {
    alignItems: 'center',
  },
  scroll: {
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    color: 'white',
    marginVertical: 20,
    alignSelf: 'center',
  },
});

export default App;
