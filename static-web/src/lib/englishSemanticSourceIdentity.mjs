import crypto from 'node:crypto';
import {englishExposurePayload} from './englishLearnerEvidence.mjs';

export const englishSemanticSourcePayload=englishExposurePayload;
export function englishSemanticSourceHash(object={}){
 return 'e2:'+crypto.createHash('sha256')
  .update(JSON.stringify(englishSemanticSourcePayload(object)))
  .digest('hex');
}
