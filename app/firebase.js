import Rebase from 're-base';
import firebase from 'react-native-firebase';
import config from './config';
import 'firebase/auth';
import 'firebase/database';

// const fbApp = firebase.initializeApp(config.firebase)

export const database = firebase.database()
export const base = Rebase.createClass(database)
export const auth = firebase.auth()
// export default {
//     database,
//     base,
//     auth,
// }