const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function getRomanMonth(monthIndex: number): string {
  return romanMonths[monthIndex] || "I";
}

const categoryCodes: Record<string, string> = {
  pengantar: "SPg",
  rekomendasi: "SR",
  peminjaman: "SPp",
  undangan: "SU",
  permohonan: "SP",
  legalitas: "SL",
};

export function getCategoryCode(category: string | null | undefined): string {
  if (!category) return "SRT";
  return categoryCodes[category.toLowerCase()] || "SRT";
}

export function formatLetterNumber(
  seq: number,
  letterType: string,
  category: string | null | undefined,
  yearLabel: string,
  createdAt: string | Date
): string {
  const seqStr = String(seq).padStart(3, '0');
  const typeCode = letterType === 'internal' ? 'A' : 'B';
  const catCode = getCategoryCode(category);
  const yearLabelPrefix = yearLabel ? yearLabel.split(' ')[0] : 'I-FEST';
  const committeeCode = `${yearLabelPrefix}-PANPEL/HMTI/FT-UNTAD`;
  const date = new Date(createdAt);
  const romanMonth = getRomanMonth(date.getMonth());
  const year = date.getFullYear();

  return `${seqStr}/${typeCode}/${catCode}/${committeeCode}/${romanMonth}/${year}`;
}
