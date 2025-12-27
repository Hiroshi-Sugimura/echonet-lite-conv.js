const { expect } = require('chai');
const ELconv = require('../index');

describe('Low voltage smart electric energy meter parsing', () => {
  describe('lowVoltageSmartElectricEnergyMeterE8', () => {
    it('E8 instantaneous current three-wire', () => {
      const threeWire = ELconv.lowVoltageSmartElectricEnergyMeterE8('028801','E8','000A000B');
      expect(threeWire).to.include('RPhase');
      expect(threeWire).to.include('TPhase');
      expect(threeWire).to.include('[A]');
    });
    it('E8 instantaneous current two-wire detection', () => {
      const twoWire = ELconv.lowVoltageSmartElectricEnergyMeterE8('028801','E8','000A7FFE');
      expect(twoWire).to.include('two-wire');
    });
    it('E8 handles zero current', () => {
      const result = ELconv.lowVoltageSmartElectricEnergyMeterE8('028801','E8','00000000');
      expect(result).to.include('"RPhase":"0[A]"');
      expect(result).to.include('"TPhase":"0[A]"');
    });
    it('E8 handles negative current (signed)', () => {
      // 0xFFFF = -1 in signed int16
      const result = ELconv.lowVoltageSmartElectricEnergyMeterE8('028801','E8','FFFF0000');
      expect(result).to.include('-0.1[A]');
    });
    it('E8 handles max positive current', () => {
      // 0x7FFF = 32767 * 0.1 = 3276.7A
      const result = ELconv.lowVoltageSmartElectricEnergyMeterE8('028801','E8','7FFF7FFF');
      expect(result).to.match(/3276\.7\d*\[A\]/);
    });
  });

  describe('lowVoltageSmartElectricEnergyMeterEAEB', () => {
    it('EA timed cumulative energy parsing', () => {
      // Build a fake timestamp + energy value: YY=2022=>0x07E6, MM=06, DD=15, HH=11, MM=30, SS=00, energy bytes 000000000001 (pad to 10 hex?) -> use 12 digits? original expects 10 bytes (20 hex) after time; keep simple
      const hex = '07E6060F111E000000000001';
      const out = ELconv.lowVoltageSmartElectricEnergyMeterEAEB('028801','EA', hex);
      expect(out).to.include('2022.6.15');
      expect(out).to.include('[xE1 kWh]');
    });
    it('EB reverse direction energy parsing', () => {
      const hex = '07E6060F111E000000000064'; // 100 units
      const out = ELconv.lowVoltageSmartElectricEnergyMeterEAEB('028801','EB', hex);
      expect(out).to.include('2022.6.15');
      expect(out).to.include('100[xE1 kWh]');
    });
    it('EA handles zero energy', () => {
      const hex = '07E6010100000000000000000'; // 2022-01-01 00:00:00, 0 energy
      const out = ELconv.lowVoltageSmartElectricEnergyMeterEAEB('028801','EA', hex);
      expect(out).to.include('2022.1.1');
      expect(out).to.include('0[xE1 kWh]');
    });
    it('EA handles large energy value', () => {
      const hex = '07E6060F111E0000000FFFFF'; // Max value
      const out = ELconv.lowVoltageSmartElectricEnergyMeterEAEB('028801','EA', hex);
      expect(out).to.include('[xE1 kWh]');
    });
  });
});

describe('Smart electric energy sub meter parsing', () => {
  describe('smartElectricEnergySubMeterE8', () => {
    it('E8 instantaneous current three-wire', () => {
      const result = ELconv.smartElectricEnergySubMeterE8('028D01','E8','000A000B');
      expect(result).to.include('RPhase');
      expect(result).to.include('TPhase');
    });
    it('E8 detects two-wire mode', () => {
      const result = ELconv.smartElectricEnergySubMeterE8('028D01','E8','00647FFE');
      expect(result).to.include('two-wire');
      expect(result).to.include('"RPhase":"10[A]"');
    });
  });

  describe('smartElectricEnergySubMeterE9', () => {
    it('E9 instantaneous voltage three-wire', () => {
      const result = ELconv.smartElectricEnergySubMeterE9('028D01','E9','08FC08FC'); // 230.0V each
      expect(result).to.include('"R-S":"230[V]"');
      expect(result).to.include('"S-T":"230[V]"');
    });
    it('E9 detects two-wire mode', () => {
      const result = ELconv.smartElectricEnergySubMeterE9('028D01','E9','08FC7FFE');
      expect(result).to.include('two-wire');
    });
    it('E9 handles 100V system', () => {
      const result = ELconv.smartElectricEnergySubMeterE9('028D01','E9','03E803E8'); // 100.0V
      expect(result).to.include('"R-S":"100[V]"');
      expect(result).to.include('"S-T":"100[V]"');
    });
  });

  describe('smartElectricEnergySubMeterEAEB', () => {
    it('EA timed cumulative energy parsing', () => {
      const hex = '07E6060F111E00000000012C'; // 300 units
      const out = ELconv.smartElectricEnergySubMeterEAEB('028D01','EA', hex);
      expect(out).to.include('2022.6.15');
      expect(out).to.include('300[xD3 kWh]');
    });
    it('EB reverse direction energy', () => {
      const hex = '07E60C1F173B3B0000000000C8'; // 2022-12-31 23:59:59, 200 units
      const out = ELconv.smartElectricEnergySubMeterEAEB('028D01','EB', hex);
      expect(out).to.include('2022.12.31');
      expect(out).to.include('200[xD3 kWh]');
    });
  });
});
