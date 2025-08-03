// Real SQLite database loader for pre-existing database files

let sqlJsInitialized = false;
let SQL = null;

// Initialize sql.js using CDN version
const initSqlJs = async () => {
  if (sqlJsInitialized && SQL) {
    return SQL;
  }

  try {
    // Load sql.js from CDN
    if (!window.initSqlJs) {
      // Dynamically load the sql.js script
      const script = document.createElement('script');
      script.src = 'https://sql.js.org/dist/sql-wasm.js';
      script.async = true;
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Initialize sql.js
    SQL = await window.initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    sqlJsInitialized = true;
    console.log('sql.js initialized successfully from CDN');
    return SQL;

  } catch (error) {
    console.error('Failed to initialize sql.js from CDN:', error);
    throw new Error(`sql.js initialization failed: ${error.message}`);
  }
};

export const loadStaticDatabase = async (dbPath = '/flask_app.db') => {
  try {
    console.log('Loading real SQLite database from:', dbPath);
    
    const sqlInstance = await initSqlJs();
    
    // Fetch the database file
    const response = await fetch(dbPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch database: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Create database from the file
    const db = new sqlInstance.Database(uint8Array);
    
    // Get table information but focus on podcasts table
    const tableQuery = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const allTables = tableQuery[0] ? tableQuery[0].values.map(row => row[0]) : [];
    
    // Check if podcasts table exists
    const hasPodcastsTable = allTables.includes('podcasts');
    
    if (!hasPodcastsTable) {
      console.warn('Podcasts table not found. Available tables:', allTables);
    }
    
    // Return only podcasts table as default, but include all tables info
    const tables = hasPodcastsTable ? ['podcasts'] : allTables;
    
    console.log('Successfully loaded real SQLite database. Focusing on podcasts table.');
    console.log('All available tables:', allTables);
    
    return { db, tables, allTables, isReal: true, defaultTable: 'podcasts' };
    
  } catch (error) {
    console.error('Error loading SQLite database:', error);
    throw new Error(`Failed to load real SQLite database: ${error.message}`);
  }
};


