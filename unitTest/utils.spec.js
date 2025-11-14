const { expect } = require('chai');
const ELconv = require('../index');

describe('Utility helper functions', () => {
  it('HEXStringtoASCII strips nulls', () => {
    const out = ELconv.HEXStringtoASCII('41004200');
    expect(out).to.equal('AB');
  });

  it('BITMAPtoString formats bits', () => {
    const typeArray = [ { bitName: 'Power', bitValues: ['OFF','ON'] }, { bitName: 'Lamp', bitValues: ['Dark','Bright'] } ];
    const out = ELconv.BITMAPtoString('3', typeArray); // 0b11 -> both ON/Bright
    expect(out).to.equal('Power:ON,Lamp:Bright');
  });

  it('ByteStringSeparater inserts spaces every 2 chars', () => {
    expect(ELconv.ByteStringSeparater('A1B2C3')).to.equal('A1 B2 C3');
  });

  it('refESV maps known ESV', () => {
    expect(ELconv.refESV('62')).to.equal('GET');
  });

  it('parseMapForm2 builds EPC list with count prefix', () => {
    // Only first bit of first EPC map byte set -> EPC 0x80
    const input = [0, 0x01, ...Array(15).fill(0)];
    const out = ELconv.parseMapForm2(input);
    expect(out[0]).to.equal(1); // count
    expect(out[1]).to.equal(0x80);
  });
});
