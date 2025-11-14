const { expect } = require('chai');
const ELconv = require('../index');

describe('Low voltage smart electric energy meter parsing', () => {
  it('E8 instantaneous current two-wire vs three-wire', () => {
    const threeWire = ELconv.lowVoltageSmartElectricEnergyMeterE8('028801','E8','000A000B');
    expect(threeWire).to.include('RPhase');
    const twoWire = ELconv.lowVoltageSmartElectricEnergyMeterE8('028801','E8','000A7FFE');
    expect(twoWire).to.include('two-wire');
  });

  it('EA timed cumulative energy parsing', () => {
    // Build a fake timestamp + energy value: YY=2022=>0x07E6, MM=06, DD=15, HH=11, MM=30, SS=00, energy bytes 000000000001 (pad to 10 hex?) -> use 12 digits? original expects 10 bytes (20 hex) after time; keep simple
    const hex = '07E6060F111E000000000001';
    const out = ELconv.lowVoltageSmartElectricEnergyMeterEAEB('028801','EA', hex);
    expect(out).to.include('2022.6.15');
    expect(out).to.include('[xE1 kWh]');
  });
});
