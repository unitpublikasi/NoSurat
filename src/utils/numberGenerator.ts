import { SuratItem, LetterType } from '../types/surat';

export const ROMAN_MONTHS = [
  'I', 'II', 'III', 'IV', 'V', 'VI',
  'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
];

/**
 * Extracts the highest sequence number from a list of surat items.
 * Robustly parses both `s.nomorUrut` and prefix numbers/ranges in `s.nomorSurat`
 * (e.g. "1519/PKMK/...", "1510-1517/PKMK/...", "001/...").
 */
export function extractHighestUrut(suratList: SuratItem[], targetYear?: number): number {
  let maxFound = 0;

  for (const s of suratList) {
    if (targetYear) {
      const sYear = new Date(s.tglSurat).getFullYear();
      if (sYear !== targetYear) continue;
    }

    // 1. Check numeric property
    if (typeof s.nomorUrut === 'number' && !isNaN(s.nomorUrut) && s.nomorUrut > maxFound) {
      maxFound = s.nomorUrut;
    }

    // 2. Parse from string nomorSurat
    if (s.nomorSurat) {
      // Handles single number (e.g., "1519/...") or ranges (e.g., "1510-1517/...")
      const match = s.nomorSurat.match(/^([0-9]+)(?:-([0-9]+))?\//);
      if (match) {
        if (match[2]) {
          const endRange = parseInt(match[2], 10);
          if (!isNaN(endRange) && endRange > maxFound) {
            maxFound = endRange;
          }
        }
        const startNo = parseInt(match[1], 10);
        if (!isNaN(startNo) && startNo > maxFound) {
          maxFound = startNo;
        }
      } else {
        const leadingMatch = s.nomorSurat.match(/^([0-9]+)/);
        if (leadingMatch) {
          const val = parseInt(leadingMatch[1], 10);
          if (!isNaN(val) && val > maxFound) {
            maxFound = val;
          }
        }
      }
    }
  }

  // Fallback: If filtered by year but year had no records, search across entire list
  if (maxFound === 0 && targetYear && suratList.length > 0) {
    return extractHighestUrut(suratList);
  }

  return maxFound;
}

/**
 * Returns the next auto-increment sequence number continuing from existing data.
 */
export function getNextUrutNumber(suratList: SuratItem[], targetYear?: number): number {
  const highest = extractHighestUrut(suratList, targetYear);
  return highest > 0 ? highest + 1 : 1;
}

/**
 * Converts a 1-based month index (1-12) to Roman numerals.
 */
export function getRomanMonth(monthNumber: number): string {
  if (monthNumber < 1 || monthNumber > 12) return 'I';
  return ROMAN_MONTHS[monthNumber - 1];
}

/**
 * Generates the official formatted letter number string.
 */
export function generateLetterNumberString(
  nomorUrut: number,
  jenisSuratCode: string,
  divisiCode: string,
  tglSurat: string,
  letterTypes?: LetterType[]
): string {
  const dateObj = new Date(tglSurat || new Date().toISOString());
  const year = dateObj.getFullYear() || new Date().getFullYear();
  const month = dateObj.getMonth() + 1;
  const romanMonth = getRomanMonth(month);
  const formattedNo = String(nomorUrut).padStart(3, '0');

  const letterTypeObj = letterTypes?.find(t => t.code === jenisSuratCode);

  if (letterTypeObj?.formatTemplate) {
    return letterTypeObj.formatTemplate
      .replace('{NO}', formattedNo)
      .replace('{TYPE}', jenisSuratCode)
      .replace('{DIV}', divisiCode)
      .replace('{ROMAN_MONTH}', romanMonth)
      .replace('{YEAR}', String(year));
  }

  // PKMK FK-KMK UGM Official Standards
  if (jenisSuratCode === 'SPK' || jenisSuratCode === 'ND') {
    return `${formattedNo}/PKMK/${jenisSuratCode}/${divisiCode}/FK-KMK/${romanMonth}/${year}`;
  }
  return `${formattedNo}/PKMK/${jenisSuratCode}/FK-KMK/${romanMonth}/${year}`;
}
