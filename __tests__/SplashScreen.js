import 'react-native';
import React from 'react';
import SplashScreen from '../app/components/splashscreen';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

 it('renders correctly', () => {
   const tree = renderer.create(
     <SplashScreen />
   );
   expect(tree).toMatchSnapshot();
 });
