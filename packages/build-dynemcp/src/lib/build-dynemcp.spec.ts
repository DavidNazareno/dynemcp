import { buildDynemcp } from './build-dynemcp.js';

describe('buildDynemcp', () => {
  it('should work', () => {
    expect(buildDynemcp()).toEqual('build-dynemcp');
  });
});
