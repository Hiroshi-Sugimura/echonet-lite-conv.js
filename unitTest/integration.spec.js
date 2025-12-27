const { expect } = require('chai');
const ELconv = require('../index');

describe('Integration tests for complex functions', () => {
  before(() => {
    // Mock minimal dictionaries for integration tests
    ELconv.m_dictDev = {
      elObjects: {
        '0x0288': {
          objectName: '低圧スマート電力量メータ',
          epcs: {
            '0xE0': { epcName: '積算電力量計測値(正方向)', edt: [{ content: { numericValue: { integerType: 'Unsigned' } } }] },
            '0xE1': {
              epcName: '積算電力量単位',
              edt: [{ content: {
                keyValues: {
                  '0x00': '1',
                  '0x01': '0.1',
                  '0x02': '0.01',
                  '0x03': '0.001'
                }
              } }]
            },
            '0xE3': { epcName: '積算電力量計測値(逆方向)', edt: [{ content: { numericValue: { integerType: 'Unsigned' } } }] }
          }
        },
        '0x028D': {
          objectName: 'スマート電力量サブメータ',
          epcs: {
            '0xD3': { epcName: '係数', edt: [{ content: { numericValue: { integerType: 'Unsigned' } } }] },
            '0xD4': {
              epcName: '積算電力量単位',
              edt: [{ content: {
                keyValues: {
                  '0x00': '1',
                  '0x01': '0.1',
                  '0x02': '0.01'
                }
              } }]
            },
            '0xE1': { epcName: '積算電力量計測値(正方向)', edt: [{ content: { numericValue: { integerType: 'Unsigned' } } }] },
            '0xE7': { epcName: '瞬時電力計測値', edt: [{ content: { numericValue: { integerType: 'Unsigned' } } }] }
          }
        }
      }
    };
    ELconv.m_dictSup = { elObjects: { '0x0000': { epcs: {} } } };
    ELconv.m_dictNod = { elObjects: { '0x0EF0': { objectName: 'ノードプロファイル', epcs: {} } } };
  });

  describe('EDTconvination for smart meters', () => {
    describe('Low voltage smart meter (0288)', () => {
      it('combines E0 and E1 for forward energy', () => {
        const result = ELconv.EDTconvination('028801', {
          'e0': '00000064', // 100 in hex
          'e1': '01'        // 0.1 unit
        });
        expect(result).to.have.property('積算電力量計測値（正方向計測値）[kWh]');
        expect(result['積算電力量計測値（正方向計測値）[kWh]']).to.equal(10); // 100 * 0.1
      });

      it('combines E3 and E1 for reverse energy', () => {
        const result = ELconv.EDTconvination('028801', {
          'e3': '000003E8', // 1000 in hex
          'e1': '02'        // 0.01 unit
        });
        expect(result).to.have.property('積算電力量計測値（逆方向計測値）[kWh]');
        expect(result['積算電力量計測値（逆方向計測値）[kWh]']).to.equal(10); // 1000 * 0.01
      });

      it('returns empty object when E1 is missing', () => {
        const result = ELconv.EDTconvination('028801', {
          'e0': '00000064'
        });
        expect(Object.keys(result)).to.have.lengthOf(0);
      });

      it('handles multiple measurements', () => {
        const result = ELconv.EDTconvination('028801', {
          'e0': '00000064', // 100
          'e3': '00000032', // 50
          'e1': '00'        // 1 unit
        });
        expect(result['積算電力量計測値（正方向計測値）[kWh]']).to.equal(100);
        expect(result['積算電力量計測値（逆方向計測値）[kWh]']).to.equal(50);
      });
    });

    describe('Smart electric energy sub meter (028D)', () => {
      it('combines D3 and E7 for instantaneous power', () => {
        const result = ELconv.EDTconvination('028D01', {
          'd3': '000A',   // coefficient 10
          'e7': '000003E8'  // 1000W
        });
        expect(result).to.have.property('瞬時電力計測値[W]');
        expect(result['瞬時電力計測値[W]']).to.equal(10000); // 1000 * 10
      });

      it('requires coefficient for E7 (instantaneous power)', () => {
        const result = ELconv.EDTconvination('028D01', {
          'd3': '00000001',  // coefficient 1
          'e7': '0000012C'  // 300W
        });
        expect(result).to.have.property('瞬時電力計測値[W]');
        expect(result['瞬時電力計測値[W]']).to.equal(300); // 300 * 1
      });

      it('combines D3, D4, E1 for cumulative energy', () => {
        const result = ELconv.EDTconvination('028D01', {
          'd3': '00000005',    // coefficient 5
          'd4': '01',    // 0.1 unit
          'e1': '00000064'   // 100
        });
        expect(result).to.have.property('積算電力量計測値（正方向計測値）[kWh]');
        expect(result['積算電力量計測値（正方向計測値）[kWh]']).to.equal(50); // 100 * 5 * 0.1
      });
    });

    describe('Unsupported EOJ', () => {
      it('returns null for unsupported EOJ', () => {
        const result = ELconv.EDTconvination('001101', { '80': '30' });
        expect(result).to.be.null;
      });
    });
  });

  describe('refer function', () => {
    it('converts facilities structure to readable format', (done) => {
      ELconv.m_dictDev.elObjects['0x0011'] = {
        objectName: 'テスト機器',
        epcs: {
          '0x80': {
            epcName: '動作状態',
            edt: [{ content: { keyValues: { '0x30': 'ON', '0x31': 'OFF' } } }]
          }
        }
      };

      const facilities = {
        '192.168.1.100': {
          '001101': {
            '80': '30'
          }
        }
      };

      ELconv.refer(facilities, (result) => {
        expect(result.IPs).to.deep.equal(['192.168.1.100']);
        expect(result['192.168.1.100']).to.have.property('EOJs');
        expect(result['192.168.1.100'].EOJs).to.have.lengthOf(1);
        done();
      });
    });

    it('handles empty facilities', (done) => {
      ELconv.refer({}, (result) => {
        expect(result.IPs).to.deep.equal([]);
        done();
      });
    });

    it('handles multiple IPs and devices', (done) => {
      ELconv.m_dictDev.elObjects['0x0011'] = {
        objectName: 'テスト機器',
        epcs: {
          '0x80': { epcName: '動作状態', edt: [{ content: { keyValues: { '0x30': 'ON' } } }] }
        }
      };

      const facilities = {
        '192.168.1.100': {
          '001101': { '80': '30' }
        },
        '192.168.1.101': {
          '001102': { '80': '30' }
        }
      };

      ELconv.refer(facilities, (result) => {
        expect(result.IPs).to.have.lengthOf(2);
        expect(result.IPs).to.include('192.168.1.100');
        expect(result.IPs).to.include('192.168.1.101');
        done();
      });
    });
  });

  describe('Property map parsing (9D, 9E, 9F)', () => {
    it('referSpec9D9E9F handles form 1 (< 16 properties)', () => {
      const result = ELconv.referSpec9D9E9F('001101', '9D', '0380818283');
      expect(result).to.include('3'); // count
      expect(result).to.include('80');
      expect(result).to.include('82');
      expect(result).to.include('83');
    });

    it('referSpec9D9E9F handles form 2 (>= 16 bytes)', () => {
      // 16 bytes of property map data (form 2)
      const input = '00' + '01'.repeat(16); // All 0x01
      const result = ELconv.referSpec9D9E9F('001101', '9D', input);
      expect(result).to.be.a('string');
      expect(result).to.include('[');
    });
  });

  describe('Version information (EPC 82)', () => {
    it('referSpec82 handles node profile version', () => {
      const result = ELconv.referSpec82('0EF001', '82', '010A01');
      expect(result).to.include('Ver.');
      expect(result).to.include('1.10');
      expect(result).to.include('規定電文形式');
    });

    it('referSpec82 handles device object release', () => {
      const result = ELconv.referSpec82('001101', '82', '00004A'); // Release 'J'
      expect(result).to.include('Release');
      expect(result).to.include('J');
    });
  });
});
