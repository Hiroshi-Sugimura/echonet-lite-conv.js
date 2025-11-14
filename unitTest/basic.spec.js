const { expect } = require('chai');
const ELconv = require('../index');

// Minimal init for functions that don't need dictionaries
// Some functions like refEOJ need initialize; we test pure helpers first.

describe('ELconv utility functions', () => {
  describe('toHexString', () => {
    it('pads single digit with leading zero', () => {
      expect(ELconv.toHexString(10)).to.equal('0a');
    });
    it('returns 00 for 0', () => {
      expect(ELconv.toHexString(0)).to.equal('00');
    });
  });

  describe('toHexArray', () => {
    it('converts hex string to byte array', () => {
      expect(ELconv.toHexArray('0a0b')).to.deep.equal([10, 11]);
    });
    it('handles upper/lower case', () => {
      expect(ELconv.toHexArray('FF')).to.deep.equal([255]);
    });
  });
});
