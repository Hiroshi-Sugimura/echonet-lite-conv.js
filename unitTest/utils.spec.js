const { expect } = require('chai');
const ELconv = require('../index');

describe('Utility helper functions', () => {
  describe('HEXStringtoASCII', () => {
    it('strips nulls', () => {
      const out = ELconv.HEXStringtoASCII('41004200');
      expect(out).to.equal('AB');
    });
    it('converts simple ASCII string', () => {
      const out = ELconv.HEXStringtoASCII('48656C6C6F'); // "Hello"
      expect(out).to.equal('Hello');
    });
    it('handles empty string', () => {
      const out = ELconv.HEXStringtoASCII('');
      expect(out).to.equal('');
    });
    it('strips multiple null characters', () => {
      const out = ELconv.HEXStringtoASCII('410042000043'); // A\0B\0\0C
      expect(out).to.equal('ABC');
    });
  });

  describe('HEXStringtoShiftJIS', () => {
    it('converts Shift_JIS encoded hex string', () => {
      // '82A0' is 'あ' in Shift_JIS
      const out = ELconv.HEXStringtoShiftJIS('82A0');
      expect(out).to.be.a('string');
    });
  });

  describe('BITMAPtoString', () => {
    it('formats bits correctly', () => {
      const typeArray = [
        { bitName: 'Power', bitValues: ['OFF','ON'] },
        { bitName: 'Lamp', bitValues: ['Dark','Bright'] }
      ];
      const out = ELconv.BITMAPtoString('3', typeArray); // 0b11 -> both ON/Bright
      expect(out).to.equal('Power:ON,Lamp:Bright');
    });
    it('handles single bit', () => {
      const typeArray = [ { bitName: 'Switch', bitValues: ['OFF','ON'] } ];
      const out = ELconv.BITMAPtoString('1', typeArray);
      expect(out).to.equal('Switch:ON');
    });
    it('handles all bits off', () => {
      const typeArray = [
        { bitName: 'A', bitValues: ['0','1'] },
        { bitName: 'B', bitValues: ['0','1'] }
      ];
      const out = ELconv.BITMAPtoString('0', typeArray);
      expect(out).to.equal('A:0,B:0');
    });
    it('handles multiple bits with mixed state', () => {
      const typeArray = [
        { bitName: 'B0', bitValues: ['off','on'] },
        { bitName: 'B1', bitValues: ['low','high'] },
        { bitName: 'B2', bitValues: ['disabled','enabled'] }
      ];
      const out = ELconv.BITMAPtoString('5', typeArray); // 0b101 -> B0=on, B1=low, B2=enabled
      expect(out).to.equal('B0:on,B1:low,B2:enabled');
    });
  });

  describe('ByteStringSeparater', () => {
    it('inserts spaces every 2 chars', () => {
      expect(ELconv.ByteStringSeparater('A1B2C3')).to.equal('A1 B2 C3');
    });
    it('handles single byte', () => {
      expect(ELconv.ByteStringSeparater('FF')).to.equal('FF');
    });
    it('handles null input', () => {
      expect(ELconv.ByteStringSeparater(null)).to.equal('');
    });
    it('handles empty string', () => {
      expect(ELconv.ByteStringSeparater('')).to.equal('');
    });
    it('handles odd length string', () => {
      expect(ELconv.ByteStringSeparater('A1B2C')).to.equal('A1 B2 C');
    });
  });

  describe('refESV', () => {
    it('maps known ESV GET', () => {
      expect(ELconv.refESV('62')).to.equal('GET');
    });
    it('maps SETI', () => {
      expect(ELconv.refESV('60')).to.equal('SETI');
    });
    it('maps SET_RES', () => {
      expect(ELconv.refESV('71')).to.equal('SET_RES');
    });
    it('maps INF', () => {
      expect(ELconv.refESV('73')).to.equal('INF');
    });
    it('returns undefined for unknown ESV', () => {
      expect(ELconv.refESV('99')).to.be.undefined;
    });
  });

  describe('parseMapForm2', () => {
    it('builds EPC list with count prefix', () => {
      // Only first bit of first EPC map byte set -> EPC 0x80
      const input = [0, 0x01, ...Array(15).fill(0)];
      const out = ELconv.parseMapForm2(input);
      expect(out[0]).to.equal(1); // count
      expect(out[1]).to.equal(0x80);
    });
    it('handles multiple EPCs', () => {
      // First 3 bits set: 0x80, 0x81, 0x82
      const input = [0, 0x07, ...Array(15).fill(0)]; // 0b111
      const out = ELconv.parseMapForm2(input);
      expect(out[0]).to.equal(3); // count
      expect(out).to.include(0x80);
      expect(out).to.include(0x81);
      expect(out).to.include(0x82);
    });
    it('handles no properties', () => {
      const input = Array(17).fill(0);
      const out = ELconv.parseMapForm2(input);
      expect(out[0]).to.equal(0); // count
      expect(out).to.have.lengthOf(1);
    });
    it('handles last EPC (0xFF)', () => {
      // Last bit of last byte -> 0xFF
      const input = [0, ...Array(15).fill(0), 0x80]; // bit 7 of byte 16
      const out = ELconv.parseMapForm2(input);
      expect(out[0]).to.equal(1);
      expect(out).to.include(0xFF);
    });
  });
});
