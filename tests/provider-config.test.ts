const assert = require('node:assert');
const { chooseProviderName, isThrottleOrQuota } = require('../src/lib/llm/provider-test-shim');

{
  const old = process.env.LLM_PROVIDER;
  delete process.env.LLM_PROVIDER;
  assert.equal(chooseProviderName(), 'bedrock', 'default provider is bedrock');
  process.env.LLM_PROVIDER = 'google';
  assert.equal(chooseProviderName(), 'google', 'google when set');
  process.env.LLM_PROVIDER = 'BEDROCK';
  assert.equal(chooseProviderName(), 'bedrock', 'case-insensitive');
  if (old === undefined) delete process.env.LLM_PROVIDER; else process.env.LLM_PROVIDER = old;
}

{
  assert(isThrottleOrQuota(new Error('ThrottlingException')), 'throttle match');
  assert(isThrottleOrQuota(new Error('Too many requests')), '429 match');
  assert(!isThrottleOrQuota(new Error('Other error')), 'non-quota false');
}

console.log('provider-config.test: OK');
