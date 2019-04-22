import emaHbn from '../models/mock-data/ema-hbn.json';
import ndaPhq from '../models/mock-data/nda-phq.json';
import { transformApplet } from '../models/json-ld';

const delay = time => new Promise(resolve => setTimeout(() => resolve(), time));

export const downloadAllApplets = async (authToken, userId, onProgress) => {
  onProgress(0, 2);
  await delay(1000);
  onProgress(1, 2);
  await delay(1000);
  onProgress(2, 2);
  return [
    transformApplet(emaHbn),
    transformApplet(ndaPhq),
  ];
};
