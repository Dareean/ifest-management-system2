const fs = require('fs');
const path = require('path');

const initialFile = path.join(__dirname, '..', 'supabase', 'migrations', '202607090001_initial_schema.sql');
const migrationFile = path.join(__dirname, '..', 'src', 'database', 'migration.sql');

function parseSqlTables(content) {
  const tableRegex = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\);/gi;
  const tables = {};
  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const columnsContent = match[2];
    const columns = [];
    
    // Split by comma, but respect parentheses (for VARCHAR, DECIMAL, etc.)
    let currentColumn = '';
    let parenCount = 0;
    for (let i = 0; i < columnsContent.length; i++) {
      const char = columnsContent[i];
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (char === ',' && parenCount === 0) {
        columns.push(currentColumn.trim());
        currentColumn = '';
      } else {
        currentColumn += char;
      }
    }
    if (currentColumn.trim()) {
      columns.push(currentColumn.trim());
    }
    
    tables[tableName] = columns.map(col => {
      // Extract column name (first word)
      const parts = col.split(/\s+/);
      const colName = parts[0];
      return { name: colName, definition: col };
    }).filter(col => col.name && !['CONSTRAINT', 'FOREIGN', 'PRIMARY', 'UNIQUE', 'CHECK'].includes(col.name.toUpperCase()));
  }
  return tables;
}

function main() {
  const initialContent = fs.readFileSync(initialFile, 'utf8');
  const migrationContent = fs.readFileSync(migrationFile, 'utf8');
  
  const initialTables = parseSqlTables(initialContent);
  const migrationTables = parseSqlTables(migrationContent);
  
  console.log('=== Schema Differences ===\n');
  
  for (const [tableName, columns] of Object.entries(migrationTables)) {
    if (!initialTables[tableName]) {
      console.log(`[NEW TABLE] ${tableName}`);
      columns.forEach(c => console.log(`  + ${c.definition}`));
      console.log();
      continue;
    }
    
    const initialCols = initialTables[tableName].map(c => c.name.toLowerCase());
    const missingCols = [];
    
    columns.forEach(c => {
      if (!initialCols.includes(c.name.toLowerCase())) {
        missingCols.push(c.definition);
      }
    });
    
    if (missingCols.length > 0) {
      console.log(`[MODIFY TABLE] ${tableName}`);
      missingCols.forEach(def => console.log(`  + ${def}`));
      console.log();
    }
  }
}

main();
