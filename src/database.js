// Sample data for our demo database
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

let SQL = null;

// Initialize SQL.js
const initSQL = async () => {
  if (SQL) return SQL;
  
  try {
    const sqlJs = await import('sql.js');
    // Try different ways to access the initialization function
    const initSqlJs = sqlJs.default || sqlJs.initSqlJs || sqlJs;
    
    if (typeof initSqlJs === 'function') {
      SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
    } else if (initSqlJs.Database) {
      // If it's already initialized
      SQL = initSqlJs;
    } else {
      throw new Error('Unable to initialize sql.js');
    }
    
    return SQL;
  } catch (error) {
    console.error('Error initializing SQL.js:', error);
    throw error;
  }
};

export const createSampleDatabase = async () => {
  try {
    const sqlInstance = await initSQL();
    
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

    return db;
  } catch (error) {
    console.error('Error creating sample database:', error);
    throw error;
  }
};

export const exportDatabase = (db) => {
  return db.export();
};

export const createDatabaseFromFile = async (file) => {
  try {
    const sqlInstance = await initSQL();

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    return new sqlInstance.Database(uint8Array);
  } catch (error) {
    console.error('Error creating database from file:', error);
    throw error;
  }
};
