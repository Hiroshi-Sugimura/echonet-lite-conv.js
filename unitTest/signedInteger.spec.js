const { expect } = require('chai');
const ELconv = require('../index');

// モック辞書の作成
function mockDictionaries() {
    ELconv.m_dictDev = {
        elObjects: {
            '0x0011': {
                objectName: 'テスト機器',
                epcs: {
                    '0xA0': { edt: [{ content: { numericValue: { integerType: 'Signed', magnification: 0, unit: '℃' } } }] },
                }
            }
        }
    };
}

describe('Signed Integer Conversion Bug Reproduction', () => {
    before(() => {
        mockDictionaries();
    });

    it('should correctly handle 1-byte positive signed integer', () => {
        // 0x10 = 16
        const res = ELconv.parseEDT('001101', 'A0', '10');
        expect(res).to.equal('16℃(10)');
    });

    it('should correctly handle 1-byte negative signed integer', () => {
        // 0xFF = -1
        const res = ELconv.parseEDT('001101', 'A0', 'FF');
        expect(res).to.equal('-1℃(FF)');
    });

    it('should correctly handle 2-byte positive signed integer', () => {
        // 0x00DC = 220.
        const res = ELconv.parseEDT('001101', 'A0', '00DC');
        expect(res).to.equal('220℃(00 DC)');
    });

    it('should correctly handle 2-byte negative signed integer', () => {
        // 0xFFDC = -36.
        const res = ELconv.parseEDT('001101', 'A0', 'FFDC');
        expect(res).to.equal('-36℃(FF DC)');
    });

    it('should correctly handle 4-byte negative signed integer', () => {
        // 0xFFFFFFDC = -36 in 32-bit
        const res = ELconv.parseEDT('001101', 'A0', 'FFFFFFDC');
        expect(res).to.equal('-36℃(FF FF FF DC)');
    });
});
