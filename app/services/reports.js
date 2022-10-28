import crypto from 'crypto';
import moment from 'moment';
import { exportPDF } from './network.js';

export const sendPDFExport = (authToken, applet, activities, appletResponse, currentActivityId, flowId = null) => {
  const configs = applet.reportConfigs;
  const responses = appletResponse.responses || {};

  if (!configs.serverIp || !configs.publicEncryptionKey || !configs.emailRecipients || !configs.emailRecipients.length) {
    return ;
  }

  const reportActivities = activities.filter(activity => activity.allowExport);

  if (reportActivities.length) {
    const params = [];

    let responseId = null;

    for (const activity of activities) {
      params.push({
        activityId: activity.id.split('/').pop(),
        data: activity.items.map(item => {
          const itemResponses = responses[item.schema];

          for (let i = itemResponses.length-1; i >= 0; i--) {
            const response = itemResponses[i];
            if (flowId && response.activityFlow != flowId.split('/').pop()) {
              continue;
            }

            if (response && activity.id == currentActivityId) {
              responseId = response.id;
            }

            if (response && response.value !== undefined) {
              return { value: response.value };
            }

            return { value: null }
          }

          return null;
        }),
        allowed: activity.allowExport
      })
    }

    const encrypted = encryptData(
        configs.publicEncryptionKey,
        JSON.stringify(
            params
                .filter(param => param.allowed)
                .map(param => ({ activityId: param.activityId, data: param.data }))
        )
    );
    const now = moment().format('MM/DD/YYYY');

    exportPDF(
      configs.serverIp,
      authToken,
      encrypted,
      now,
      applet.id.split('/').pop(),
      flowId && flowId.split('/').pop(),
      currentActivityId.split('/').pop(),
      responseId
    )
  }
}

function encryptData(publicKey, data) {
  const encrypted = [];
  const chunkSize = parseInt(publicKey.length * 0.58);
  const array = Buffer.from(data);
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    encrypted.push(crypto.publicEncrypt(publicKey, chunk).toString('base64'));
  }
  return encrypted;
}
