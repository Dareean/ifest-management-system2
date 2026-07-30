const { createClient } = require('@supabase/supabase-js');

const NEXT_PUBLIC_SUPABASE_URL = 'https://xxmxbyiggrottreetrig.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw';

const admin = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function getRomanMonth(monthIndex) {
  return romanMonths[monthIndex] || "I";
}

const categoryCodes = {
  pengantar: "SPg",
  rekomendasi: "SR",
  peminjaman: "SPp",
  undangan: "SU",
  permohonan: "SP",
  legalitas: "SL",
};

function getCategoryCode(category) {
  if (!category) return "SRT";
  return categoryCodes[category.toLowerCase()] || "SRT";
}

async function main() {
  try {
    console.log('Fetching existing letters for backfilling...');
    const { data: letters, error: fetchError } = await admin
      .from('letter_requests')
      .select(`
        id,
        created_at,
        letter_type,
        category,
        committee_years (
          label
        )
      `)
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch letters: ${fetchError.message}`);
    }

    console.log(`Found ${letters.length} letters to process.`);

    let seqInternal = 0;
    let seqExternal = 0;

    for (const letter of letters) {
      const isInternal = letter.letter_type === 'internal';
      let seq;
      let typeCode;

      if (isInternal) {
        seqInternal++;
        seq = seqInternal;
        typeCode = 'A';
      } else {
        seqExternal++;
        seq = seqExternal;
        typeCode = 'B';
      }

      const seqStr = String(seq).padStart(3, '0');
      const catCode = getCategoryCode(letter.category);
      
      const yearLabel = letter.committee_years?.label || 'I-FEST 2026';
      const yearLabelPrefix = yearLabel.split(' ')[0];
      const committeeCode = `${yearLabelPrefix}-PANPEL/HMTI/FT-UNTAD`;
      
      const date = new Date(letter.created_at);
      const romanMonth = getRomanMonth(date.getMonth());
      const year = date.getFullYear();

      // Format: {seq}/{type_code}/{category_code}/{committee_code}/{month_roman}/{year}
      const letterNumber = `${seqStr}/${typeCode}/${catCode}/${committeeCode}/${romanMonth}/${year}`;

      console.log(`Updating letter ID ${letter.id} with number: ${letterNumber}`);

      const { error: updateError } = await admin
        .from('letter_requests')
        .update({ letter_number: letterNumber })
        .eq('id', letter.id);

      if (updateError) {
        console.error(`Failed to update letter ID ${letter.id}:`, updateError.message);
        console.error('Note: Please make sure you have run the migration SQL in your Supabase SQL Editor first!');
        process.exit(1);
      }
    }

    console.log('Backfill completed successfully!');
  } catch (err) {
    console.error('Error during backfill:', err.message);
    process.exit(1);
  }
}

main();
