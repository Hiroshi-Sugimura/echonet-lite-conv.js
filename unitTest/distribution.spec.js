const { expect } = require('chai');
const ELconv = require('../index');

describe('Distribution board related parsing', () => {
  describe('distributionBoardC2', () => {
    it('C2 unit selection 0.001kWh', () => {
      expect(ELconv.distributionBoardC2('028701','C2','03')).to.equal(0.001);
    });
    it('C2 unit selection 100kWh', () => {
      expect(ELconv.distributionBoardC2('028701','C2','0B')).to.equal(100);
    });
    it('C2 unit selection 1kWh', () => {
      expect(ELconv.distributionBoardC2('028701','C2','00')).to.equal(1);
    });
    it('C2 unit selection 0.1kWh', () => {
      expect(ELconv.distributionBoardC2('028701','C2','01')).to.equal(0.1);
    });
    it('C2 unit selection 10kWh', () => {
      expect(ELconv.distributionBoardC2('028701','C2','0A')).to.equal(10);
    });
    it('C2 unknown unit defaults to 0.001', () => {
      expect(ELconv.distributionBoardC2('028701','C2','FF')).to.equal(0.001);
    });
  });

  describe('distributionBoardB2B4B6B9BBBD', () => {
    it('B2 channel range format', () => {
      const out = ELconv.distributionBoardB2B4B6B9BBBD('028701','B2','0105');
      expect(out).to.equal('01ch-05ch(01 05)');
    });
    it('B4 channel range format', () => {
      const out = ELconv.distributionBoardB2B4B6B9BBBD('028701','B4','0A0F');
      expect(out).to.equal('0Ach-0Fch(0A 0F)');
    });
  });

  describe('distributionBoardB3', () => {
    it('B3 list parsing', () => {
      // begin=1 end=2 then channels 1,2 values follow -> bytes: 01 02 00 05 00 06 -> ch1=5 ch2=6
      const hex = '010200050006';
      const out = ELconv.distributionBoardB3('028701','B3', hex);
      expect(out).to.include('"ch1":"5[xC2 kWh]"');
      expect(out).to.include('"ch2":"6[xC2 kWh]"');
    });
    it('B3 single channel', () => {
      const hex = '01010064'; // ch1=100
      const out = ELconv.distributionBoardB3('028701','B3', hex);
      expect(out).to.include('"ch1":"100[xC2 kWh]"');
    });
    it('B3 zero channel', () => {
      const hex = '00000000'; // ch0=0
      const out = ELconv.distributionBoardB3('028701','B3', hex);
      expect(out).to.include('"ch0":"0[xC2 kWh]"');
    });
  });

  describe('distributionBoardB5', () => {
    it('B5 current parsing *0.1A', () => {
      // begin=1 end=1 value bytes: 01 01 00 64 -> ch1 = 0x0064=100 -> 10.0A
      const hex = '01010064';
      const out = ELconv.distributionBoardB5('028701','B5', hex);
      expect(out).to.include('"ch1":"10[A]"');
    });
    it('B5 multiple channels', () => {
      const hex = '01020064012C'; // ch1=10A, ch2=30A
      const out = ELconv.distributionBoardB5('028701','B5', hex);
      expect(out).to.include('"ch1":"10[A]"');
      expect(out).to.include('"ch2":"30[A]"');
    });
  });

  describe('distributionBoardB7', () => {
    it('B7 power parsing 1W unit', () => {
      const hex = '010100C8'; // ch1=200W
      const out = ELconv.distributionBoardB7('028701','B7', hex);
      expect(out).to.include('"ch1":"200[W]"');
    });
    it('B7 multiple channels', () => {
      const hex = '01020064012C'; // ch1=100W, ch2=300W
      const out = ELconv.distributionBoardB7('028701','B7', hex);
      expect(out).to.include('"ch1":"100[W]"');
      expect(out).to.include('"ch2":"300[W]"');
    });
  });

  describe('distributionBoardBA', () => {
    it('BA bidirectional energy list', () => {
      const hex = '01010064012C'; // ch1f=100, ch1r=300
      const out = ELconv.distributionBoardBA('028701','BA', hex);
      expect(out).to.include('"ch1f":"100[xC2 kWh]"');
      expect(out).to.include('"ch1r":"300[xC2 kWh]"');
    });
  });

  describe('distributionBoardBC', () => {
    it('BC bidirectional current list', () => {
      const hex = '01010064012C'; // ch1R=10A, ch1T=30A
      const out = ELconv.distributionBoardBC('028701','BC', hex);
      expect(out).to.include('"ch1R":"10[A]"');
      expect(out).to.include('"ch1T":"30[A]"');
    });
  });

  describe('distributionBoardBE', () => {
    it('BE bidirectional power list', () => {
      const hex = '010100C8'; // ch1=200W
      const out = ELconv.distributionBoardBE('028701','BE', hex);
      expect(out).to.include('"ch1":"200[W]"');
    });
  });
});
