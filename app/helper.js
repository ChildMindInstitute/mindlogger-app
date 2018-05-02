import { RNS3 } from 'react-native-aws3';
import {
    Platform,
    PermissionsAndroid,
  } from 'react-native';
import { transferUtility } from 'react-native-s3'

import config from './config';
transferUtility.setupWithBasic(config.s3)
transferUtility.enableProgressSent(false)
export const prepareAct = (data) => {
    return new Promise((resolve, reject) => {
        if(data.audio_path) {
            var filename = data.audio_path.replace(/^.*[\\\/]/, '')
            uploadFileS3(data.audio_path, 'audios/', filename).then(url => {
                data.audio_url = url
                resolve(data);
            }).catch(err => {
                reject(err);
            })
        } else {
            resolve(data);
        }
    })
}

export const uploadFileS3 = (uri, targetPath, filename) => {
    let fileExt = filename.split('.').pop()
    contentType = 'application/octet-stream'
    const uploadUri = Platform.OS === 'ios' ? uri : 'file://' + uri
    return new Promise( (resolve, reject) => {
        return transferUtility.upload({
            bucket: config.s3.bucket,
            key: targetPath+filename,
            file: uploadUri,
            meta: {
                "Content-Type": contentType
            }
        }).then(res => {
            transferUtility.subscribe(res.id, (err, task) => {
                if(task.state == 'completed') {
                    let filePath = `https://${config.s3.bucket}.s3.amazonaws.com/${task.key}`
                    resolve(filePath)
                } else if (task.state == 'failed') {
                    reject(filePath)
                }
            })
        })
    })
}
