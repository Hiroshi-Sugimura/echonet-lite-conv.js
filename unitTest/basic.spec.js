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
    it('handles two-digit hex values correctly', () => {
      expect(ELconv.toHexString(255)).to.equal('ff');
      expect(ELconv.toHexString(16)).to.equal('10');
    });
    it('returns lowercase hex', () => {
      expect(ELconv.toHexString(171)).to.equal('ab');
    });
  });

  describe('toHexArray', () => {
    it('converts hex string to byte array', () => {
      expect(ELconv.toHexArray('0a0b')).to.deep.equal([10, 11]);
    });
    it('handles upper/lower case', () => {
      expect(ELconv.toHexArray('FF')).to.deep.equal([255]);
    });
    it('converts multiple bytes correctly', () => {
      expect(ELconv.toHexArray('010203')).to.deep.equal([1, 2, 3]);
    });
    it('handles mixed case hex strings', () => {
      expect(ELconv.toHexArray('AaBbCc')).to.deep.equal([170, 187, 204]);
    });
  });

  describe('YYMtoString', () => {
    it('converts year-month hex to string', () => {
      expect(ELconv.YYMtoString('07E606')).to.equal('2022.6');
    });
    it('handles January', () => {
      expect(ELconv.YYMtoString('07E601')).to.equal('2022.1');
    });
    it('handles December', () => {
      expect(ELconv.YYMtoString('07E60C')).to.equal('2022.12');
    });
  });

  describe('YYMDtoString', () => {
    it('converts year-month-day hex to string', () => {
      expect(ELconv.YYMDtoString('07E6060F')).to.equal('2022.6.15');
    });
    it('handles first day of month', () => {
      expect(ELconv.YYMDtoString('07E60101')).to.equal('2022.1.1');
    });
    it('handles last day of month', () => {
      expect(ELconv.YYMDtoString('07E6011F')).to.equal('2022.1.31');
    });
  });

  describe('HMtoString', () => {
    it('converts hour-minute hex to string', () => {
      expect(ELconv.HMtoString('0B1E')).to.equal('11.30');
    });
    it('handles midnight', () => {
      expect(ELconv.HMtoString('0000')).to.equal('0.0');
    });
    it('handles noon', () => {
      expect(ELconv.HMtoString('0C00')).to.equal('12.0');
    });
  });

  describe('HMStoString', () => {
    it('converts hour-minute-second hex to string', () => {
      expect(ELconv.HMStoString('0B1E1E')).to.equal('11.30.30');
    });
    it('handles midnight with seconds', () => {
      expect(ELconv.HMStoString('000000')).to.equal('0.0.0');
    });
    it('handles end of day', () => {
      expect(ELconv.HMStoString('173B3B')).to.equal('23.59.59');
    });
  });

  describe('HMFtoString', () => {
    it('converts hour-minute-frame hex to string', () => {
      expect(ELconv.HMFtoString('0B1E0A')).to.equal('11.30.10');
    });
  });

  describe('MStoString', () => {
    it('converts minute-second hex to string', () => {
      expect(ELconv.MStoString('1E1E')).to.equal('30.30');
    });
    it('handles zero values', () => {
      expect(ELconv.MStoString('0000')).to.equal('0.0');
    });
  });
});
