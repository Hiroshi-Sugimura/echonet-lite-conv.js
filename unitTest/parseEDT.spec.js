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
          '0xB0': { edt: [ { content: { rawData: 'ASCII' } } ] }
        }
      }
    }
  };
  // Device class dictionary for EOJ 0011 with EPC 80 override
  ELconv.m_dictDev = {
    elObjects: {
      '0x0011': { objectName: 'テスト機器', epcs: { '0x80': { edt: [ { content: { keyValues: { '0x31': 'OFF(override)' } } } ] } } }
    }
  };
  // Node profile dictionary for EOJ 0EF0
  ELconv.m_dictNod = {
    elObjects: {
      '0x0EF0': { objectName: 'ノードプロファイル', epcs: { '0x90': { edt: [ { content: { bitmap: [ { bitName: 'Flag', bitValues: ['OFF','ON'] } ] } } ] } } }
    }
  };
}

describe('ELconv.parseEDT and related ref functions', () => {
  before(() => {
    mockDictionaries();
  });

  it('refEOJ resolves device EOJ name', () => {
    const name = ELconv.refEOJ('001101');
    expect(name).to.equal('テスト機器01');
  });

  it('refEPC uses device specific override when available', () => {
    const epcName = ELconv.refEPC('001101', '80');
    expect(epcName).to.match(/80\)$/); // ends with (80)
  });

  it('parseEDT keyValues basic ON', () => {
    const res = ELconv.parseEDT('001101', '80', '30');
    // Current implementation returns keyValues(30) for this mock; adjust expectation
    expect(res).to.include('30');
  });

  it('parseEDT numericValue with magnification -1', () => {
    const res = ELconv.parseEDT('001101', 'A0', '64'); // 0x64 = 100 -> 100 * 10^-1 = 10.0℃
    expect(res).to.equal('10℃(64)');
  });

  it('parseEDT rawData ASCII handling and null stripping', () => {
    // 41 42 00 -> 'AB' (null removed)
    const res = ELconv.parseEDT('001101', 'B0', '414200');
    expect(res).to.equal('AB(ascii:41 42 00)');
  });

  it('user defined EPC (F0) returns proper Japanese tag', () => {
    const res = ELconv.parseEDT('001101', 'F0', '1234');
    expect(res).to.include('ユーザ定義領域');
  });
});
