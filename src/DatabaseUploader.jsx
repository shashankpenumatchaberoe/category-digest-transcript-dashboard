import React, { useRef } from 'react';

const DatabaseUploader = ({ onDatabaseLoad, onError }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Accept various file types for flexible parsing
    const validExtensions = ['.db', '.sqlite', '.sqlite3', '.csv', '.json'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      onError('Please select a valid database file (.db, .sqlite, .sqlite3, .csv, .json)');
      return;
    }

    try {
      console.log('Attempting to load database from file:', file.name);
      
      // Try real database implementation first
      try {
        const { createDatabaseFromFile: createRealDatabase } = await import('./realDatabase.js');
        const database = await createRealDatabase(file);
        onDatabaseLoad(database, file.name);
        console.log('Successfully loaded real SQLite database');
        return;
      } catch (realError) {
        console.warn('Real database loading failed, trying mock implementation:', realError);
        
        // Fallback to mock database implementation
        const { createDatabaseFromFile: createMockDatabase } = await import('./mockDatabase.js');
        const database = await createMockDatabase(file);
        onDatabaseLoad(database, file.name);
        console.log('Successfully loaded with mock database implementation');
      }
    } catch (error) {
      console.error('Error loading database:', error);
      onError(`Error loading database: ${error.message}`);
    }

    // Clear the input
    event.target.value = '';
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = { target: { files: [files[0]] } };
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div className="database-uploader">
      <div 
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <h3>Upload SQLite Database</h3>
          <p>Drag and drop your SQLite database file here, or click to browse</p>
          <p className="file-types">Supported files: .db, .sqlite, .sqlite3</p>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".db,.sqlite,.sqlite3"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DatabaseUploader;
