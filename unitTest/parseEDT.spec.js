const { expect } = require('chai');
const ELconv = require('../index');

// Build minimal mock dictionaries instead of reading files.
function mockDictionaries() {
  // Super class with EPC 80 (keyValues), EPC A0 (numericValue) and EPC B0 (rawData ASCII)
  ELconv.m_dictSup = {
    elObjects: {
      '0x0000': {
        epcs: {
          '0x80': { edt: [ { content: { keyValues: { '0x30': 'ON', '0x31': 'OFF' } } } ] },
          '0xA0': { edt: [ { content: { numericValue: { integerType: 'Unsigned', magnification: '-1', unit: '℃' } } } ] },
          '0xB0': { edt: [ { content: { rawData: 'ASCII' } } ] },
          '0xC0': { edt: [ { content: { customType: 'HMS' } } ] },
          '0xD0': { edt: [ { content: { bitmap: [
            { bitName: 'Bit0', bitValues: ['0','1'] },
            { bitName: 'Bit1', bitValues: ['off','on'] }
          ] } } ] }
        }
      }
    }
  };
  // Device class dictionary for EOJ 0011 with EPC 80 override
  ELconv.m_dictDev = {
    elObjects: {
      '0x0011': {
        objectName: 'テスト機器',
        epcs: {
          '0x80': { edt: [ { content: { keyValues: { '0x31': 'OFF(override)' } } } ] },
          '0xD6': { edt: [ { content: { keyValues: {} } } ] }, // Instance list
          '0xD7': { edt: [ { content: { keyValues: {} } } ] }  // Class list
        }
      }
    }
  };
  // Node profile dictionary for EOJ 0EF0
  ELconv.m_dictNod = {
    elObjects: {
      '0x0EF0': {
        objectName: 'ノードプロファイル',
        epcs: {
          '0x90': { edt: [ { content: { bitmap: [ { bitName: 'Flag', bitValues: ['OFF','ON'] } ] } } ] },
          '0xD6': { edt: [ { content: { keyValues: {} } } ] }
        }
      }
    }
  };
  // Makers dictionary
  ELconv.m_dictMakers = {
    '000001': 'TestMaker1',
    '000002': 'TestMaker2'
  };
}

describe('ELconv.parseEDT and related ref functions', () => {
  before(() => {
    mockDictionaries();
  });

  describe('refEOJ', () => {
    it('resolves device EOJ name', () => {
      const name = ELconv.refEOJ('001101');
      expect(name).to.equal('テスト機器01');
    });
    it('resolves node profile EOJ', () => {
      const name = ELconv.refEOJ('0EF001');
      expect(name).to.equal('ノードプロファイル01');
    });
    it('returns input for unknown EOJ', () => {
      const name = ELconv.refEOJ('FFFF01');
      expect(name).to.equal('FFFF01');
    });
  });

  describe('refEPC', () => {
    it('uses device specific override when available', () => {
      const epcName = ELconv.refEPC('001101', '80');
      expect(epcName).to.match(/80\)$/); // ends with (80)
    });
    it('returns user defined for F0-FF range', () => {
      const epcName = ELconv.refEPC('001101', 'F5');
      expect(epcName).to.include('ユーザ定義領域');
    });
    it('uses super class EPC when not in device dict', () => {
      const epcName = ELconv.refEPC('001101', 'A0');
      expect(epcName).to.include('A0');
    });
  });

  describe('parseEDT keyValues', () => {
    it('keyValues basic ON', () => {
      const res = ELconv.parseEDT('001101', '80', '30');
      expect(res).to.include('30');
    });
    it('keyValues OFF', () => {
      const res = ELconv.parseEDT('001101', '80', '31');
      expect(res).to.include('31');
    });
    it('handles D6 instance list special form', () => {
      const res = ELconv.parseEDT('001101', 'D6', '020EF001001101'); // count=2, 2 EOJs
      expect(res).to.include('ノードプロファイル01');
      expect(res).to.include('テスト機器01');
    });
    it('handles D7 class list special form', () => {
      const res = ELconv.parseEDT('001101', 'D7', '020EF00011'); // count=2, 2 class codes
      expect(res).to.include('ノードプロファイル');
      expect(res).to.include('テスト機器');
    });
  });

  describe('parseEDT numericValue', () => {
    it('numericValue with magnification -1', () => {
      const res = ELconv.parseEDT('001101', 'A0', '64'); // 0x64 = 100 -> 100 * 10^-1 = 10.0℃
      expect(res).to.equal('10℃(64)');
    });
    it('handles zero value', () => {
      const res = ELconv.parseEDT('001101', 'A0', '00');
      expect(res).to.equal('0℃(00)');
    });
    it('handles large value', () => {
      const res = ELconv.parseEDT('001101', 'A0', 'FF'); // 255 * 0.1 = 25.5
      expect(res).to.equal('25.5℃(FF)');
    });
  });

  describe('parseEDT rawData', () => {
    it('rawData ASCII handling and null stripping', () => {
      // 41 42 00 -> 'AB' (null removed)
      const res = ELconv.parseEDT('001101', 'B0', '414200');
      expect(res).to.equal('AB(ascii:41 42 00)');
    });
    it('handles empty ASCII', () => {
      const res = ELconv.parseEDT('001101', 'B0', '');
      expect(res).to.equal('(ascii:)');
    });
  });

  describe('parseEDT customType', () => {
    it('handles HMS time format', () => {
      const res = ELconv.parseEDT('001101', 'C0', '0B1E1E'); // 11:30:30
      expect(res).to.equal('11.30.30(0B 1E 1E)');
    });
  });

  describe('parseEDT bitmap', () => {
    it('handles bitmap format', () => {
      const res = ELconv.parseEDT('001101', 'D0', '3'); // 0b11 -> both bits on
      expect(res).to.include('Bit0:1');
      expect(res).to.include('Bit1:on');
    });
  });

  describe('parseEDT user defined', () => {
    it('user defined EPC (F0) returns proper Japanese tag', () => {
      const res = ELconv.parseEDT('001101', 'F0', '1234');
      expect(res).to.include('ユーザ定義領域');
    });
    it('user defined EPC (FF)', () => {
      const res = ELconv.parseEDT('001101', 'FF', 'ABCD');
      expect(res).to.include('ユーザ定義領域');
    });
  });

  describe('selectReferSpec', () => {
    it('handles EPC 81 (installation location)', () => {
      const res = ELconv.selectReferSpec('001101', '81', '00');
      expect(res).to.include('位置情報未設定');
    });
    it('handles EPC 8A (maker code)', () => {
      const res = ELconv.selectReferSpec('001101', '8A', '000001');
      expect(res).to.include('TestMaker1');
    });
    it('handles EPC 9D (property map)', () => {
      const res = ELconv.selectReferSpec('001101', '9D', '0280');
      expect(res).to.include('[80]');
    });
  });

  describe('referSpec81 installation location', () => {
    it('handles undefined location (00)', () => {
      const res = ELconv.referSpec81('001101', '81', '00');
      expect(res).to.include('位置情報未設定');
    });
    it('handles undefined location (FF)', () => {
      const res = ELconv.referSpec81('001101', '81', 'FF');
      expect(res).to.include('設置場所不定');
    });
    it('handles living room', () => {
      const res = ELconv.referSpec81('001101', '81', '08'); // 0b00001000 -> living room 0
      expect(res).to.include('居間、リビング');
    });
  });

  describe('referSpec8A maker code', () => {
    it('resolves known maker code', () => {
      const res = ELconv.referSpec8A('001101', '8A', '000002');
      expect(res).to.include('TestMaker2');
    });
    it('handles unknown maker code', () => {
      const res = ELconv.referSpec8A('001101', '8A', 'FFFFFF');
      expect(res).to.include('not found');
    });
  });
});
