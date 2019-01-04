import {
  Platform,
  PermissionsAndroid,
} from 'react-native';

import config from './config';
import RNFetchBlob from 'react-native-fetch-blob';
export const getFileInfoAsync = (path) =>  {
  return RNFetchBlob.fs.stat(path)
}
// export const prepareAct = (data) => {
//   return new Promise((resolve, reject) => {
//     if (data.audio_path) {
//       var filename = data.audio_path.replace(/^.*[\\\/]/, '')
//       uploadFileS3(data.audio_path, 'audios/', filename).then(url => {
//         data.audio_url = url
//         resolve(data);
//       }).catch(err => {
//         reject(err);
//       })
//     } else {
//       resolve(data);
//     }
//   })
// }

// export const uploadFileS3 = (uri, targetPath, filename) => {
//   let fileExt = filename.split('.').pop()
//   contentType = 'application/octet-stream'
//   const uploadUri = Platform.OS === 'ios' ? uri : 'file://' + uri
//   return new Promise((resolve, reject) => {
//     return transferUtility.upload({
//       bucket: config.s3.bucket,
//       key: targetPath + filename,
//       file: uploadUri,
//       meta: {
//         "Content-Type": contentType
//       }
//     }).then(res => {
//       transferUtility.subscribe(res.id, (err, task) => {
//         if (task.state == 'completed') {
//           let filePath = `https://${config.s3.bucket}.s3.amazonaws.com/${task.key}`
//           resolve(filePath)
//         } else if (task.state == 'failed') {
//           reject(filePath)
//         }
//       })
//     })
//   })
// }

export const zeroFill = (number, width) => {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return number + ""; // always return a string
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
export const btoa = (input = '') => {
  let str = input;
  let output = '';

  for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

    charCode = str.charCodeAt(i += 3 / 4);

    if (charCode > 0xFF) {
      throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }

    block = block << 8 | charCode;
  }

  return output;
};

export const atob = (input = '') => {
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 == 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++);

    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
};

export const fileLink = (file, token) => {
  return file ? `${config.apiHost}/${file['@id']}/download?contentDisposition=inline&token=${token}` : '';
}

export const randomLink = (files, token) => {
  var rand = files[Math.floor(Math.random() * files.length)];
  return fileLink(rand, token);
}

export const downloadFile = (idPath) => {

}