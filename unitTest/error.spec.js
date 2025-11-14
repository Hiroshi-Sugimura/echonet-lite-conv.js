const { expect } = require('chai');
const ELconv = require('../index');

describe('Error handling and edge cases', () => {
  describe('toHexArray edge cases', () => {
    it('handles empty string', () => {
      expect(ELconv.toHexArray('')).to.deep.equal([]);
    });

    it('handles odd length hex string', () => {
      // 奇数長のhex文字列 -> AB + C (Cは0Cとして扱われる)
      const result = ELconv.toHexArray('ABC');
      expect(result).to.have.lengthOf(2); // [0xAB, NaN or 0xC?]
    });

    it('handles invalid hex characters gracefully', () => {
      // NaN生成されるがエラーにはならない
      const result = ELconv.toHexArray('ZZ');
      expect(result[0]).to.be.NaN;
    });
  });

  describe('toHexString boundary', () => {
    it('handles 255 (0xFF)', () => {
      expect(ELconv.toHexString(255)).to.equal('ff');
    });

    it('handles 0', () => {
      expect(ELconv.toHexString(0)).to.equal('00');
    });

    it('handles negative values (wraps)', () => {
      // 負数はtoString(16)で負記号付くがパディングで破綻
      const result = ELconv.toHexString(-1);
      expect(result).to.match(/^-/); // starts with minus
    });
  });

  describe('ByteStringSeparater edge cases', () => {
    it('handles null input', () => {
      expect(ELconv.ByteStringSeparater(null)).to.equal('');
    });

    it('handles empty string', () => {
      expect(ELconv.ByteStringSeparater('')).to.equal('');
    });

    it('handles single byte', () => {
      expect(ELconv.ByteStringSeparater('AB')).to.equal('AB');
    });
  });

  describe('refESV with unknown ESV', () => {
    it('returns undefined for unknown ESV code', () => {
      expect(ELconv.refESV('99')).to.be.undefined;
    });
  });

  describe('HEXStringtoASCII with malformed input', () => {
    it('handles empty string', () => {
      const result = ELconv.HEXStringtoASCII('');
      expect(result).to.equal('');
    });

    it('strips multiple nulls', () => {
      // 41 00 42 00 00 43 -> ABC
      const result = ELconv.HEXStringtoASCII('410042000043');
      expect(result).to.equal('ABC');
    });
  });

  describe('parseMapForm2 boundary', () => {
    it('handles all zeros (no properties)', () => {
      const input = Array(17).fill(0);
      const result = ELconv.parseMapForm2(input);
      expect(result[0]).to.equal(0); // count
      expect(result).to.have.lengthOf(1);
    });

    it('handles all bits set', () => {
      const input = [0, ...Array(16).fill(0xFF)];
      const result = ELconv.parseMapForm2(input);
      expect(result[0]).to.equal(128); // すべてのEPC 0x80-0xFF
    });
  });

  describe('refEOJ with undefined EOJ', () => {
    it('returns input when EOJ not in dictionary', () => {
      // Mock setup minimal
      ELconv.m_dictDev = { elObjects: {} };
      ELconv.m_dictNod = { elObjects: { '0x0EF0': { objectName: 'ノードプロファイル' } } };
      const result = ELconv.refEOJ('FFFF01');
      expect(result).to.equal('FFFF01'); // not found, returns as-is
    });
  });

  describe('refEPC with undefined EPC', () => {
    it('returns EPC code when not in dictionary', () => {
      ELconv.m_dictSup = { elObjects: { '0x0000': { epcs: {} } } };
      ELconv.m_dictDev = { elObjects: {} };
      ELconv.m_dictNod = { elObjects: { '0x0EF0': { objectName: 'ノードプロファイル', epcs: {} } } };
      const result = ELconv.refEPC('001101', 'AA');
      expect(result).to.equal('AA'); // not found
    });
  });

  describe('parseEDT with invalid contentRule', () => {
    it('handles missing dictionary gracefully', () => {
      ELconv.m_dictSup = { elObjects: { '0x0000': { epcs: {} } } };
      ELconv.m_dictDev = { elObjects: {} };
      // EPC not in dictionary -> ret is undefined, 実装見るとreturnしないケースある
      const result = ELconv.parseEDT('001101', 'ZZ', '1234');
      expect(result).to.be.undefined;
    });
  });

  describe('distributionBoard edge cases', () => {
    it('C2 unknown unit code defaults to 0.001', () => {
      const result = ELconv.distributionBoardC2('028701', 'C2', 'FF');
      expect(result).to.equal(0.001); // default
    });

    it('B3 with zero channel range', () => {
      // begin=0 end=0 -> ch0=value
      const hex = '00000005';
      const result = ELconv.distributionBoardB3('028701', 'B3', hex);
      expect(result).to.include('"ch0"');
    });
  });

  describe('lowVoltageSmartElectricEnergyMeterE8 boundary', () => {
    it('handles max signed int16', () => {
      // 0x7FFF = 32767 * 0.1 = 3276.7A (浮動小数点精度考慮)
      const result = ELconv.lowVoltageSmartElectricEnergyMeterE8('028801', 'E8', '7FFF7FFE');
      expect(result).to.include('RPhase');
      expect(result).to.include('two-wire');
    });

    it('handles negative current (signed int)', () => {
      // 0xFFFF = -1 * 0.1 = -0.1A
      const result = ELconv.lowVoltageSmartElectricEnergyMeterE8('028801', 'E8', 'FFFF0000');
      expect(result).to.include('-0.1[A]');
    });
  });

  describe('YYMD/HMS parsing with invalid dates', () => {
    it('YYMDtoString with invalid month', () => {
      // 07E6 FF 01 -> 2022.255.1
      const result = ELconv.YYMDtoString('07E6FF01');
      expect(result).to.include('255');
    });

    it('HMStoString with out of range values', () => {
      // FF FF FF -> 255.255.255
      const result = ELconv.HMStoString('FFFFFF');
      expect(result).to.equal('255.255.255');
    });
  });

  describe('BITMAPtoString with missing typeArray', () => {
    it('handles empty typeArray', () => {
      const result = ELconv.BITMAPtoString('FF', []);
      expect(result).to.equal(''); // no bits defined
    });

    it('handles typeArray shorter than bits', () => {
      // BITMAPtoString uses parseInt(edt) which treats 'FF' as decimal 0 -> use '3' (0b11)
      const typeArray = [
        { bitName: 'B0', bitValues: ['off', 'on'] },
        { bitName: 'B1', bitValues: ['low', 'high'] }
      ];
      const result = ELconv.BITMAPtoString('3', typeArray); // 0b11 -> both bits set
      expect(result).to.equal('B0:on,B1:high');
    });
  });

  describe('elsAnarysis with malformed ELS', () => {
    // elsAnarysisはinitialize()を自動呼び出しするため、ファイルパス依存でスキップ
    it.skip('handles missing DETAILs gracefully (requires file access)', () => {
      const els = {
        TID: '01',
        SEOJ: '0ef001',
        DEOJ: '05ff01',
        ESV: '62',
        OPC: '01',
        DETAILs: {}
      };
      ELconv.elsAnarysis(els, (ret) => {
        expect(ret.TID).to.equal('01');
        expect(ret.EDT).to.be.empty;
      });
    });

    it.skip('handles unknown ESV in elsAnarysis (requires file access)', () => {
      const els = {
        TID: '02',
        SEOJ: '0ef001',
        DEOJ: '05ff01',
        ESV: 'ZZ', // invalid
        OPC: '00',
        DETAILs: {}
      };
      ELconv.elsAnarysis(els, (ret) => {
        expect(ret.ESV).to.be.undefined;
      });
    });
  });

  describe('refer with empty facilities', () => {
    it('returns empty IPs array', (done) => {
      ELconv.refer({}, (result) => {
        expect(result.IPs).to.deep.equal([]);
        done();
      });
    });
  });

  describe('EDTconvination with missing EPCs', () => {
    it('returns null for unsupported EOJ', () => {
      const result = ELconv.EDTconvination('001101', { '80': '30' });
      expect(result).to.be.null;
    });

    it('0288 without required EPCs returns empty object', () => {
      const result = ELconv.EDTconvination('028801', { 'e0': '1234' }); // e1 missing
      const keys = Object.keys(result);
      expect(keys).to.have.lengthOf(0);
    });
  });
});
