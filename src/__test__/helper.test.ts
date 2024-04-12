import { describe, expect, test } from '@jest/globals';
import {
  cleanUpHTML,
  extractCategoryNameAndCapitalize,
  extractPart,
  slug,
} from '../util/helpers';
import { removeRandomKeywordInURL } from '../util/sanitize';

describe('slug', () => {
  // test('create slug ', () => {
  //   expect(slug('\n\t\t\t\t\t\t\tComputer &amp; Büro\n\t\t\t\t\t\t')).toBe(
  //     'computer & buero',
  //   );
  // });

  test('clean up html', () => {
    expect(
      cleanUpHTML("TROLLKIDS\nKid's Trollfjord Jacket\nSoftshelljacke"),
    ).toBe("TROLLKIDS Kid's Trollfjord Jacket Softshelljacke");
  });

  test('clean up html link', () => {
    expect(
      cleanUpHTML("https://cdn.idealo.com/folder/Product/201867/3/201867357/s1_produktbild_mittelgross/assos-mille-gt-bib-shorts-gto-c2.jpg"),
    ).toBe("https://cdn.idealo.com/folder/Product/201867/3/201867357/s1_produktbild_mittelgross/assos-mille-gt-bib-shorts-gto-c2.jpg");
  });
  

  test('extract link', () => {
    expect(
      extractPart('<img alt="Assos Mille GT Bib Shorts GTO C2" title="Assos Mille GT Bib Shorts GTO C2" src="https://cdn.idealo.com/folder/Product/201867/3/201867357/s1_produktbild_mittelgross/assos-mille-gt-bib-shorts-gto-c2.jpg"/>',"(www|http:|https:)+[^\\s]+[\\w]",0),
    ).toBe("https://cdn.idealo.com/folder/Product/201867/3/201867357/s1_produktbild_mittelgross/assos-mille-gt-bib-shorts-gto-c2.jpg");
  });


  test('clean up html', () => {
    expect(
      cleanUpHTML("TROLLKIDS\nKid's Trollfjord Jacket\nSoftshelljacke"),
    ).toBe("TROLLKIDS Kid's Trollfjord Jacket Softshelljacke");
  });

  test('clean up url', () => {
    expect(
      removeRandomKeywordInURL(
        'https://www.reichelt.de/ics-digital-c8697.html?&nbc=1&SID=92ef5d29867c9f5742b371eccbf61cde8e32580930e5d5cee728d',
        ['/&SID=(\\d|\\w)+/g'],
      ),
    ).toBe('https://www.reichelt.de/ics-digital-c8697.html?&nbc=1');
  });

  test('clean up url', () => {
    expect(
      extractCategoryNameAndCapitalize(
        'https://www.reichelt.de/elektronische-lasten-c8790.html?&nbc=1',
        0,
        "\\/([^\\/]+?)-c\\d+"
      ),
    ).toBe('Elektronische Lasten');
  });
});
