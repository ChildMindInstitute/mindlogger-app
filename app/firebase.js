import Rebase from 're-base';
import firebase from 'firebase/app';
import config from './config';
import 'firebase/auth';
import 'firebase/database';

const fbApp = firebase.initializeApp(config.firebase)

export const database = firebase.database(fbApp)
export const base = Rebase.createClass(database)
export const auth = firebase.auth(fbApp)
// export default {
//     database,
//     base,
//     auth,
// }