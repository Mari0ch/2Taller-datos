import { describe, it, expect } from 'vitest';
import { extractHourlyAndLatest, RawAirRecord } from '../services/airQualityService';

describe('Municipal Open Data Parser (Datasets 212531 & 300754)', () => {
  it('correctly parses measurement of 0 as a valid number, NOT as missing or null', () => {
    const fixtureRecords: RawAirRecord[] = [
      {
        PROVINCIA: '28',
        MUNICIPIO: '079',
        ESTACION: '49',
        MAGNITUD: '8', // NO2
        PUNTO_MUESTREO: '28079049_8_8',
        ANO: '2026',
        MES: '09',
        DIA: '23',
        H01: '12',
        V01: 'V',
        H02: '0',
        V02: 'V', // 0 is completely valid!
        H03: '15',
        V03: 'N', // N is invalid / unverified
      },
    ];

    const result = extractHourlyAndLatest(fixtureRecords, '49', '8');
    expect(result.latest).toBe(0); // Latest valid measurement was H02 which is 0
    expect(result.latestHr).toBe(2);
    expect(result.hourly[0]).toBe(12);
    expect(result.hourly[1]).toBe(0);
    expect(result.hourly[2]).toBeNull(); // H03 was 'N', so null
    expect(result.recordDate).toBe('2026-09-23');
  });

  it('ignores records flagged as invalid (V01 == "N")', () => {
    const fixtureRecords: RawAirRecord[] = [
      {
        PROVINCIA: '28',
        MUNICIPIO: '079',
        ESTACION: '4',
        MAGNITUD: '8',
        PUNTO_MUESTREO: '28079004_8_8',
        ANO: '2026',
        MES: '09',
        DIA: '23',
        H01: '45',
        V01: 'N',
        H02: '50',
        V02: 'N',
      },
    ];

    const result = extractHourlyAndLatest(fixtureRecords, '4', '8');
    expect(result.latest).toBeNull();
    expect(result.latestHr).toBeNull();
    expect(result.hourly.every((v) => v === null)).toBe(true);
  });

  it('returns null when station or magnitude is absent from dataset', () => {
    const fixtureRecords: RawAirRecord[] = [
      {
        PROVINCIA: '28',
        MUNICIPIO: '079',
        ESTACION: '8',
        MAGNITUD: '8',
        PUNTO_MUESTREO: '28079008_8_8',
        ANO: '2026',
        MES: '09',
        DIA: '23',
        H01: '20',
        V01: 'V',
      },
    ];

    // Asking for station 99 which does not exist
    const result = extractHourlyAndLatest(fixtureRecords, '99', '8');
    expect(result.latest).toBeNull();
    expect(result.latestHr).toBeNull();
    expect(result.recordDate).toBeNull();
  });

  it('correctly tracks the most recent valid hour of the day', () => {
    const fixtureRecords: RawAirRecord[] = [
      {
        PROVINCIA: '28',
        MUNICIPIO: '079',
        ESTACION: '49',
        MAGNITUD: '10', // PM10
        PUNTO_MUESTREO: '28079049_10_47',
        ANO: '2026',
        MES: '09',
        DIA: '23',
        H01: '14',
        V01: 'V',
        H02: '16',
        V02: 'V',
        H03: '18',
        V03: 'V',
        H04: '22',
        V04: 'V',
      },
    ];

    const result = extractHourlyAndLatest(fixtureRecords, '49', '10');
    expect(result.latest).toBe(22);
    expect(result.latestHr).toBe(4);
    expect(result.recordDate).toBe('2026-09-23');
  });
});
