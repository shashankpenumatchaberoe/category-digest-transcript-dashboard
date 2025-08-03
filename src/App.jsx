import React, { useState, useEffect } from 'react';
import DataVisualizer from './DataVisualizer';
import { loadStaticDatabase } from './staticDatabase';
import './App.css';

function App() {
  const [database, setDatabase] = useState(null);
  const [databaseName, setDatabaseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingMockDatabase, setUsingMockDatabase] = useState(false);

  useEffect(() => {
    // Load the static database on component mount
    loadDatabase();
  }, []);

  const loadDatabase = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Loading podcast database from flask_app.db...');

      const { db, allTables, defaultTable } = await loadStaticDatabase('/flask_app.db');
      setDatabase(db);
      setDatabaseName(`Podcast Database`);
      setUsingMockDatabase(false);

      console.log(`Podcast database loaded successfully. Focusing on: ${defaultTable}`);
      if (allTables && allTables.length > 1) {
        console.log(`Other available tables: ${allTables.filter(t => t !== defaultTable).join(', ')}`);
      }
    } catch (err) {
      console.error('Error loading database:', err);
      setError(`Error loading podcast database: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const reloadDatabase = () => {
    loadDatabase();
  };

  return (
    <div className="app">
      <header className="app-header">
        <img src="/logo.png" style={{ width: '40px',marginRight:'10px' }} alt="Logo" />
        <span style={{ textAlign: 'left', display:'inline-block' }}>
          <h3 style={{ marginBottom: '0px' }}>Category Digest</h3>
          <h4 style={{ marginTop: '0px', fontSize: '12px', letterSpacing:'4px' }}>Transcript Editor</h4>
        </span>

      </header>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button
            className="retry-button"
            onClick={reloadDatabase}
          >
            Retry Loading Database
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading database...</p>
        </div>
      ) : (
        database && (
          <div className="main-content">
            <DataVisualizer database={database} />
          </div>
        )
      )}
    </div>
  );
}

export default App;
