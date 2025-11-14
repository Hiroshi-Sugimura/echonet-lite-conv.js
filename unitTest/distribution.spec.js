const { expect } = require('chai');
const ELconv = require('../index');

describe('Distribution board related parsing', () => {
  it('C2 unit selection', () => {
    expect(ELconv.distributionBoardC2('028701','C2','03')).to.equal(0.001);
    expect(ELconv.distributionBoardC2('028701','C2','0B')).to.equal(100);
  });

  it('B3 list parsing', () => {
    // begin=1 end=2 then channels 1,2 values follow -> bytes: 01 02 00 05 00 06 -> ch1=5 ch2=6
    const hex = '010200050006';
    const out = ELconv.distributionBoardB3('028701','B3', hex);
    expect(out).to.include('"ch1":"5[xC2 kWh]"');
    expect(out).to.include('"ch2":"6[xC2 kWh]"');
  });

  it('B5 current parsing *0.1A', () => {
    // begin=1 end=1 value bytes: 01 01 00 64 -> ch1 = 0x0064=100 -> 10.0A
    const hex = '01010064';
    const out = ELconv.distributionBoardB5('028701','B5', hex);
    expect(out).to.include('"ch1":"10[A]"');
  });
});
