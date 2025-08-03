// Real SQLite database implementation using sql.js

let sqlJsInitialized = false;
let SQL = null;

// Initialize sql.js once
const initSqlJs = async () => {
  if (sqlJsInitialized && SQL) {
    return SQL;
  }

  try {
    // Try to import sql.js
    const sqlJsModule = await import('sql.js');
    
    // Find the correct initialization function
    let initFunction;
    if (typeof sqlJsModule.default === 'function') {
      initFunction = sqlJsModule.default;
    } else if (sqlJsModule.initSqlJs) {
      initFunction = sqlJsModule.initSqlJs;
    } else if (sqlJsModule.default && sqlJsModule.default.initSqlJs) {
      initFunction = sqlJsModule.default.initSqlJs;
    } else {
      throw new Error('Could not find sql.js initialization function');
    }

    // Initialize with WASM file from CDN
    SQL = await initFunction({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    sqlJsInitialized = true;
    console.log('sql.js initialized successfully');
    return SQL;

  } catch (error) {
    console.error('Failed to initialize sql.js:', error);
    throw new Error(`sql.js initialization failed: ${error.message}`);
  }
};

// Sample data for demo
const sampleData = {
  sales: [
    { id: 1, product: 'Laptop', amount: 1200, date: '2024-01-15', category: 'Electronics' },
    { id: 2, product: 'Phone', amount: 800, date: '2024-01-18', category: 'Electronics' },
    { id: 3, product: 'Book', amount: 25, date: '2024-01-20', category: 'Education' },
    { id: 4, product: 'Headphones', amount: 150, date: '2024-01-22', category: 'Electronics' },
    { id: 5, product: 'Tablet', amount: 400, date: '2024-01-25', category: 'Electronics' },
    { id: 6, product: 'Monitor', amount: 300, date: '2024-02-01', category: 'Electronics' },
    { id: 7, product: 'Keyboard', amount: 80, date: '2024-02-03', category: 'Electronics' },
    { id: 8, product: 'Course', amount: 200, date: '2024-02-05', category: 'Education' },
    { id: 9, product: 'Mouse', amount: 50, date: '2024-02-08', category: 'Electronics' },
    { id: 10, product: 'Notebook', amount: 15, date: '2024-02-10', category: 'Education' }
  ]
};

export const createSampleDatabase = async () => {
  try {
    const sqlInstance = await initSqlJs();
    
    // Create a new database
    const db = new sqlInstance.Database();

    // Create sales table
    db.run(`
      CREATE TABLE sales (
        id INTEGER PRIMARY KEY,
        product TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL
      )
    `);

    // Insert sample data
    const stmt = db.prepare(`
      INSERT INTO sales (id, product, amount, date, category) 
      VALUES (?, ?, ?, ?, ?)
    `);

    sampleData.sales.forEach(row => {
      stmt.run([row.id, row.product, row.amount, row.date, row.category]);
    });

    stmt.free();
    console.log('Sample database created successfully');
    return db;

  } catch (error) {
    console.error('Error creating sample database:', error);
    throw error;
  }
};

export const createDatabaseFromFile = async (file) => {
  try {
    console.log('Attempting to load SQLite database from file:', file.name);
    
    const sqlInstance = await initSqlJs();
    
    // Read the file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Try to create database from the file
    const db = new sqlInstance.Database(uint8Array);
    
    // Test if it's a valid SQLite database
    try {
      const tableQuery = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('Successfully loaded SQLite database. Tables found:', 
        tableQuery[0] ? tableQuery[0].values.map(row => row[0]) : []);
      return db;
    } catch (testError) {
      console.error('File does not appear to be a valid SQLite database:', testError);
      throw new Error(`Invalid SQLite database: ${testError.message}`);
    }

  } catch (error) {
    console.error('Error loading database from file:', error);
    throw error;
  }
};

export const exportDatabase = (db) => {
  try {
    return db.export();
  } catch (error) {
    console.error('Error exporting database:', error);
    throw error;
  }
};
