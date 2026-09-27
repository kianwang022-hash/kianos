#!/usr/bin/env node
import { inspectWebsiteHeavyLease } from './websiteHeavyWork.mjs';

console.log(JSON.stringify({
  schema: 'kianos.website.heavy_work_status.v1',
  ...inspectWebsiteHeavyLease()
}, null, 2));
