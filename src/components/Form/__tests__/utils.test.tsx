import {
 isFunction,
  handlableTypeName,
 } from '../utils';

describe('Test isFunction', () => {
  it('pass in a function should return true', () => {
    const test = () => {};
    expect(isFunction(test)).toBe(true);
  });
  it('pass in other prime type should return false', () => {
    expect(isFunction('')).toBe(false);
    expect(isFunction('123')).toBe(false);
    expect(isFunction(123)).toBe(false);
    expect(isFunction(null)).toBe(false);
    expect(isFunction(undefined)).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
  });
});

describe('Test guards', () => {
  it('handlableTypeName cannot handle some unknown type', () => {
    expect(handlableTypeName('JSONB')).toBe(false);
  });
});
