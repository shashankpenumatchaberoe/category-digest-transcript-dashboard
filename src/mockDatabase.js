// Mock database implementation for demonstration
// This creates a simple in-memory database structure that mimics SQLite functionality

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

// Mock database class that mimics SQLite functionality
class MockDatabase {
  constructor(data = null) {
    this.tables = data || { sales: sampleData.sales };
  }

  addTable(tableName, data) {
    this.tables[tableName] = data;
  }

  exec(query) {
    const lowerQuery = query.toLowerCase().trim();
    
    if (lowerQuery.includes('pragma table_info')) {
      const tableName = query.match(/pragma table_info\((\w+)\)/i)?.[1];
      if (tableName && this.tables[tableName]) {
        const columns = Object.keys(this.tables[tableName][0] || {});
        return [{
          columns: ['cid', 'name', 'type', 'notnull', 'dflt_value', 'pk'],
          values: columns.map((col, index) => [
            index, 
            col, 
            typeof this.tables[tableName][0][col] === 'number' ? 'REAL' : 'TEXT',
            0, 
            null, 
            col === 'id' ? 1 : 0
          ])
        }];
      }
      return [];
    }
    
    if (lowerQuery.includes('select name from sqlite_master')) {
      return [{
        columns: ['name'],
        values: Object.keys(this.tables).map(name => [name])
      }];
    }
    
    if (lowerQuery.includes('select * from')) {
      const tableName = query.match(/select \* from (\w+)/i)?.[1];
      if (tableName && this.tables[tableName]) {
        const data = this.tables[tableName];
        const columns = Object.keys(data[0] || {});
        return [{
          columns,
          values: data.map(row => columns.map(col => row[col]))
        }];
      }
    }
    
    return [];
  }

  prepare(query) {
    return {
      getAsObject: () => ({}),
      step: () => false,
      free: () => {}
    };
  }

  export() {
    return new Uint8Array(0);
  }
}

export const createSampleDatabase = async () => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 500));
  return new MockDatabase();
};

export const createDatabaseFromFile = async (file) => {
  try {
    // Try to load the real sql.js library for actual SQLite file parsing
    try {
      const sqlJs = await import('sql.js');
      
      // Try different ways to access the initialization function
      let initSqlJs;
      if (sqlJs.default && typeof sqlJs.default === 'function') {
        initSqlJs = sqlJs.default;
      } else if (sqlJs.initSqlJs && typeof sqlJs.initSqlJs === 'function') {
        initSqlJs = sqlJs.initSqlJs;
      } else if (typeof sqlJs.default === 'object' && sqlJs.default.initSqlJs) {
        initSqlJs = sqlJs.default.initSqlJs;
      } else {
        throw new Error('Cannot find sql.js initialization function');
      }

      // Initialize sql.js
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });

      // Read the uploaded file
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Create database from the file
      const db = new SQL.Database(uint8Array);
      
      // Test if it's a valid SQLite database by trying to read tables
      const result = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('Successfully loaded real SQLite database from file:', file.name);
      console.log('Tables found:', result);
      
      return db;
      
    } catch (sqlJsError) {
      console.warn('Could not load real sql.js, falling back to file analysis:', sqlJsError);
      
      // Fallback: Try to analyze the file and create a mock representation
      return await analyzeAndCreateMockDatabase(file);
    }
    
  } catch (error) {
    console.error('Error creating database from file:', error);
    throw error;
  }
};

// Fallback function to analyze uploaded files and create mock data
async function analyzeAndCreateMockDatabase(file) {
  console.log('Analyzing uploaded file:', file.name, 'Size:', file.size, 'Type:', file.type);
  
  // If it's a CSV file, parse it
  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length > 1) {
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          // Try to convert to number if possible
          row[header] = isNaN(value) ? value : parseFloat(value);
        });
        return row;
      });
      
      const tableName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, '_');
      const mockData = { [tableName]: rows };
      
      console.log(`Created mock database from CSV with table '${tableName}' and ${rows.length} rows`);
      return new MockDatabase(mockData);
    }
  }
  
  // If it's a JSON file, parse it
  if (file.name.toLowerCase().endsWith('.json')) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      let mockData = {};
      
      if (Array.isArray(data)) {
        const tableName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, '_');
        mockData[tableName] = data;
      } else if (typeof data === 'object') {
        // If it's an object, use its keys as table names
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key])) {
            mockData[key] = data[key];
          }
        });
      }
      
      if (Object.keys(mockData).length > 0) {
        console.log('Created mock database from JSON with tables:', Object.keys(mockData));
        return new MockDatabase(mockData);
      }
    } catch (jsonError) {
      console.warn('Could not parse JSON file:', jsonError);
    }
  }
  
  // For other file types or if parsing fails, create a mock representation
  const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, '_');
  const mockData = {
    [fileName]: [
      { id: 1, filename: file.name, size: file.size, type: file.type, uploaded: new Date().toISOString() },
      { id: 2, info: 'This is a demonstration', note: 'Real SQLite parsing failed', fallback: 'mock data' },
      { id: 3, message: 'Upload a .csv or .json file', suggestion: 'for better parsing', alternative: 'or use sample data' }
    ]
  };
  
  console.log(`Created fallback mock database for file: ${file.name}`);
  return new MockDatabase(mockData);
}

export const exportDatabase = (db) => {
  return db.export();
};

export { MockDatabase };
