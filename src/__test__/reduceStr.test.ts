import { describe, expect, test } from '@jest/globals';
import { reduceString } from '../util/matching/compare_helper';

describe('reduce Str', () => {
  test('test length', () => {
    expect(
      reduceString(
        'DeLOCK PCIE x1 auf 2x RJ45 Gbit, LAN-Adapter',
        'DELOCK'.length + 55,
      ),
    ).toEqual('DeLOCK PCIE x1 auf 2x RJ45 Gbit LAN-Adapter');

    expect(
      reduceString(
        'SAMSUNG 990 PRO 4 TB, SSD (PCIe 4.0 x4, NVMe 2, M.2 2280, intern)',
        'SAMSUNG'.length + 55,
      ),
    ).toEqual('SAMSUNG 990 PRO 4 TB SSD PCIe 4.0 x4 NVMe 2 M.2 2280 intern');

    
    expect(
      reduceString(
        'Bio-Beißring, Schildkröte, Naturkautschuk',
        'SAMSUNG'.length + 55,
      ),
    ).toEqual('Bio-Beißring Schildkröte Naturkautschuk');

    expect(
      reduceString(
        `Bio-Beißring, 
        
        
        
        Schildkröte, 
        \b
        Naturkautschuk\r\n`,


        'SAMSUNG'.length + 55,
      ),
    ).toEqual('Bio-Beißring Schildkröte Naturkautschuk');

    expect(
      reduceString(
        'Pokémon: Superstarker Sticker- und Rätselspaß',
        'SAMSUNG'.length + 55,
      ),
    ).toEqual('Pokémon Superstarker Sticker- und Rätselspaß');
  });
});
