import React, { useState, useEffect } from 'react';

const DataVisualizer = ({ database }) => {
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [transcriptContent, setTranscriptContent] = useState('');
  const [currentRowIndex, setCurrentRowIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    year: ''
  });

  const handleStatusClick = (status) => {
    if (status && status.toLowerCase().startsWith('error')) {
      setModalContent(status);
      setShowModal(true);
    }
  };

  const handleTranscriptClick = (transcript, rowIndex) => {
    setTranscriptContent(transcript || '');
    setCurrentRowIndex(rowIndex);
    setShowTranscriptModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent('');
  };

  const closeTranscriptModal = () => {
    setShowTranscriptModal(false);
    setTranscriptContent('');
    setCurrentRowIndex(null);
  };

  const saveTranscript = async () => {
    if (currentRowIndex !== null && database) {
      try {
        // Get the current row data to find the ID
        const currentRowData = getCurrentRowData();
        
        if (!currentRowData || !currentRowData.id) {
          alert('Unable to identify the record to update');
          return;
        }

        // Update the database
        const updateQuery = `UPDATE podcasts SET transcript = ?, status = ? WHERE id = ?`;
        const newStatus = !transcriptContent.trim() ? 'To do' : currentRowData.status;
        
        database.run(updateQuery, [transcriptContent, newStatus, currentRowData.id]);
        
        // Persist changes to localStorage
        const persistedChanges = JSON.parse(localStorage.getItem('podcastTranscriptChanges') || '{}');
        persistedChanges[currentRowData.id] = {
          transcript: transcriptContent,
          status: newStatus,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('podcastTranscriptChanges', JSON.stringify(persistedChanges));
        
        // Update the local state
        const updatedData = [...tableData];
        const actualIndex = (currentPage - 1) * itemsPerPage + currentRowIndex;
        updatedData[actualIndex].transcript = transcriptContent;
        
        // If transcript is empty, change status to "To do"
        if (!transcriptContent.trim()) {
          updatedData[actualIndex].status = 'To do';
        } else {
          updatedData[actualIndex].status = newStatus;
        }
        
        setTableData(updatedData);
        
        console.log('Transcript saved successfully to database and localStorage');
        closeTranscriptModal();
      } catch (error) {
        console.error('Error saving transcript:', error);
        alert('Error saving transcript: ' + error.message);
      }
    } else {
      // Fallback to local state update only
      if (currentRowIndex !== null) {
        const updatedData = [...tableData];
        const actualIndex = (currentPage - 1) * itemsPerPage + currentRowIndex;
        updatedData[actualIndex].transcript = transcriptContent;
        
        if (!transcriptContent.trim()) {
          updatedData[actualIndex].status = 'To do';
        }
        
        setTableData(updatedData);
      }
      closeTranscriptModal();
    }
  };

  const resetTranscript = () => {
    if (currentRowIndex !== null) {
      const currentRowData = getCurrentRowData();
      setTranscriptContent(currentRowData?.transcript || '');
    }
  };

  const clearTranscript = () => {
    setTranscriptContent('');
  };

  const getCurrentRowData = () => {
    if (currentRowIndex !== null) {
      const actualIndex = (currentPage - 1) * itemsPerPage + currentRowIndex;
      return tableData[actualIndex];
    }
    return null;
  };

  // Function to convert month number to month name
  const getMonthName = (monthNumber) => {
    if (!monthNumber) return monthNumber;
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthIndex = parseInt(monthNumber) - 1;
    return monthNames[monthIndex] || monthNumber;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Search and filter logic
  const filteredData = tableData.filter(row => {
    const matchesSearch = searchTerm === '' || 
      Object.values(row).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesCategory = filters.category === '' || row.category === filters.category;
    const matchesStatus = filters.status === '' || row.status === filters.status;
    const matchesYear = filters.year === '' || row.year?.toString() === filters.year;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesYear;
  });

  // Sorting logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic (updated to use filtered/sorted data)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Get unique values for filters
  const uniqueCategories = [...new Set(tableData.map(row => row.category).filter(Boolean))];
  const uniqueStatuses = [...new Set(tableData.map(row => row.status).filter(Boolean))];
  const uniqueYears = [...new Set(tableData.map(row => row.year).filter(Boolean))].sort();

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({ category: '', status: '', year: '' });
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="badge badge-unknown">Unknown</span>;
    
    const statusLower = status.toLowerCase();
    if (statusLower.startsWith('error')) {
      return (
        <span 
          className="badge badge-error clickable" 
          onClick={() => handleStatusClick(status)}
          title="Click to view error details"
        >
          Error
        </span>
      );
    } else if (statusLower === 'completed' || statusLower === 'success') {
      return <span className="badge badge-success">Success</span>;
    } else if (statusLower === 'pending' || statusLower === 'processing') {
      return <span className="badge badge-pending">Pending</span>;
    } else if (statusLower === 'to do' || statusLower === 'todo') {
      return <span className="badge badge-todo">To Do</span>;
    } else {
      return <span className="badge badge-info">{status}</span>;
    }
  };

  const getTranscriptButton = (transcript, rowIndex) => {
    if (transcript && transcript.trim()) {
      return (
        <button 
          className="btn btn-view-transcript"
          onClick={() => handleTranscriptClick(transcript, rowIndex)}
          title="View transcript"
        >
          View
        </button>
      );
    }
    return <span className="no-transcript">No transcript</span>;
  };

  const exportToCSV = () => {
    if (!tableData || tableData.length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV headers (exclude id column)
    const exportColumns = columns.filter(col => col !== 'id');
    const headers = exportColumns.join(',');
    
    // Create CSV rows
    const rows = tableData.map(row => {
      return exportColumns.map(col => {
        let value = row[col];
        
        // Handle month conversion
        if (col === 'month' && value !== null && value !== undefined) {
          value = getMonthName(value);
        }
        
        // Handle null/undefined values
        if (value === null || value === undefined) {
          value = '';
        }
        
        // Convert to string and escape quotes
        value = String(value).replace(/"/g, '""');
        
        // Wrap in quotes if contains comma, newline, or quote
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }
        
        return value;
      }).join(',');
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Create filename with timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.setAttribute('download', `podcast_data_${timestamp}.csv`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const backupDatabase = () => {
    if (!database) {
      alert('No database available to backup');
      return;
    }

    try {
      // Apply any persisted changes to the database before backup
      const persistedChanges = JSON.parse(localStorage.getItem('podcastTranscriptChanges') || '{}');
      
      // Update the database with persisted changes
      Object.entries(persistedChanges).forEach(([id, changes]) => {
        try {
          const updateQuery = `UPDATE podcasts SET transcript = ?, status = ? WHERE id = ?`;
          database.run(updateQuery, [changes.transcript, changes.status, parseInt(id)]);
        } catch (error) {
          console.warn(`Failed to apply change for ID ${id}:`, error);
        }
      });
      
      // Export database as binary data
      const data = database.export();
      const blob = new Blob([data], { type: 'application/x-sqlite3' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        // Create filename with timestamp
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.setAttribute('download', `flask_app_backup_${timestamp}.db`);
        
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Database backup created with all current changes');
      }
    } catch (error) {
      console.error('Error backing up database:', error);
      alert('Error creating database backup: ' + error.message);
    }
  };

  const clearPersistedChanges = () => {
    if (confirm('Are you sure you want to clear all saved transcript changes? This will revert all transcripts to their original state.')) {
      localStorage.removeItem('podcastTranscriptChanges');
      loadPodcastsTable(); // Reload data without persisted changes
      console.log('Persisted changes cleared');
    }
  };

  useEffect(() => {
    if (database) {
      loadPodcastsTable();
    }
  }, [database]);

  const loadPodcastsTable = async () => {
    try {
      setLoading(true);
      console.log('Loading podcasts table data...');
      
      // Define the specific columns we want to display (include id for updating)
      const displayColumns = ['id', 'category', 'month', 'year', 'report_name', 'status', 'transcript'];
      
      // Query the podcasts table for specific columns
      const columnList = displayColumns.join(', ');
      const result = database.exec(`SELECT ${columnList} FROM podcasts`);
      
      if (result.length > 0) {
        const data = result[0];
        setColumns(data.columns);
        
        // Convert the result to array of objects
        const rows = data.values.map(row => {
          const obj = {};
          data.columns.forEach((col, index) => {
            obj[col] = row[index];
          });
          return obj;
        });
        
        // Apply persisted changes from localStorage
        const persistedChanges = JSON.parse(localStorage.getItem('podcastTranscriptChanges') || '{}');
        rows.forEach(row => {
          if (persistedChanges[row.id]) {
            const changes = persistedChanges[row.id];
            row.transcript = changes.transcript;
            row.status = changes.status;
            console.log(`Applied persisted changes for ID ${row.id}:`, changes);
          }
        });
        
        setTableData(rows);
        console.log('Podcasts table data loaded:', rows.length, 'rows');
        console.log('Displaying columns:', data.columns);
        
        if (Object.keys(persistedChanges).length > 0) {
          console.log('Applied persisted changes for', Object.keys(persistedChanges).length, 'records');
        }
      } else {
        console.warn('No data found in podcasts table');
        setTableData([]);
        setColumns([]);
      }
    } catch (error) {
      console.error('Error loading podcasts table:', error);
      setTableData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overview statistics
  const getOverviewStats = () => {
    const totalPodcasts = tableData.length;
    
    // Status distribution
    const statusCounts = tableData.reduce((acc, row) => {
      const status = row.status?.toLowerCase() || 'unknown';
      if (status.includes('error')) {
        acc.error = (acc.error || 0) + 1;
      } else if (status === 'completed' || status === 'success') {
        acc.completed = (acc.completed || 0) + 1;
      } else if (status === 'pending' || status === 'processing') {
        acc.pending = (acc.pending || 0) + 1;
      } else if (status === 'to do' || status === 'todo') {
        acc.todo = (acc.todo || 0) + 1;
      } else {
        acc.other = (acc.other || 0) + 1;
      }
      return acc;
    }, {});

    // Categories count
    const uniqueCategories = [...new Set(tableData.map(row => row.category))].filter(Boolean);
    
    // Years range
    const years = tableData.map(row => row.year).filter(Boolean);
    const minYear = years.length > 0 ? Math.min(...years) : null;
    const maxYear = years.length > 0 ? Math.max(...years) : null;
    
    // Transcripts availability
    const withTranscripts = tableData.filter(row => row.transcript && row.transcript.trim()).length;
    const withoutTranscripts = totalPodcasts - withTranscripts;

    return {
      totalPodcasts,
      statusCounts,
      categoriesCount: uniqueCategories.length,
      yearsRange: minYear && maxYear ? `${minYear}-${maxYear}` : 'N/A',
      withTranscripts,
      withoutTranscripts,
      completionRate: totalPodcasts > 0 ? Math.round(((statusCounts.completed || 0) / totalPodcasts) * 100) : 0
    };
  };

  const stats = getOverviewStats();

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading podcasts data...</p>
      </div>
    );
  }

  return (
    <div className="data-visualizer">
      <div className="visualizer-section">
        {/* Overview Section */}
        <div className="overview-section">

          <div className="overview-grid">
            <div className="overview-card">
              <div className="card-icon">📁</div>
              <div className="card-content">
                <div className="card-number">{stats.totalPodcasts}</div>
                <div className="card-label">Total Projects</div>
              </div>
            </div>
            

            <div className="overview-card">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <div className="card-number">{stats.completionRate}%</div>
                <div className="card-label">Completion Rate</div>
              </div>
            </div>
            
            <div className="overview-card">
              <div className="card-icon">📝</div>
              <div className="card-content">
                <div className="card-number">{stats.withTranscripts}</div>
                <div className="card-label">With Transcripts</div>
              </div>
            </div>
            
            <div className="overview-card">
              <div className="card-icon">📄</div>
              <div className="card-content">
                <div className="card-number">{stats.withoutTranscripts}</div>
                <div className="card-label">Missing Transcripts</div>
              </div>
            </div>
          </div>
          
          <div className="status-breakdown">
            <h3>Status Breakdown</h3>
            <div className="status-items">
              {stats.statusCounts.completed && (
                <div className="status-item">
                  <span className="status-badge status-success">✓</span>
                  <span className="status-text">Completed: {stats.statusCounts.completed}</span>
                </div>
              )}
              {stats.statusCounts.pending && (
                <div className="status-item">
                  <span className="status-badge status-pending">⏳</span>
                  <span className="status-text">Pending: {stats.statusCounts.pending}</span>
                </div>
              )}
              {stats.statusCounts.todo && (
                <div className="status-item">
                  <span className="status-badge status-todo">📝</span>
                  <span className="status-text">To Do: {stats.statusCounts.todo}</span>
                </div>
              )}
              {stats.statusCounts.error && (
                <div className="status-item">
                  <span className="status-badge status-error">⚠️</span>
                  <span className="status-text">Errors: {stats.statusCounts.error}</span>
                </div>
              )}
              {stats.statusCounts.other && (
                <div className="status-item">
                  <span className="status-badge status-other">📋</span>
                  <span className="status-text">Other: {stats.statusCounts.other}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="export-section">
          <div className="export-buttons">
            <button 
              className="btn btn-export-csv"
              onClick={exportToCSV}
              title="Export all podcast data to CSV file"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Export to CSV
            </button>
          
          
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filter-section">
          <div className="search-filter-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filters-compact">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">Category</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="">Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="filter-select"
              >
                <option value="">Year</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <button onClick={clearFilters} className="clear-filters-btn" title="Clear all filters">
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="pagination-controls">
          <div className="pagination-info">
            <span>Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} rows</span>
          </div>
          <div className="items-per-page">
            <label>Items per page:</label>
            <select 
              value={itemsPerPage} 
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="items-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        
        <div className="table-container">
          {tableData.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  {columns.filter(col => col !== 'id').map(col => (
                    <th 
                      key={col} 
                      className={`${col !== 'transcript' ? 'sortable' : ''} ${col === 'month' || col === 'year' ? 'narrow-column' : ''} ${col === 'month' || col === 'year' || col === 'status' || col === 'transcript' ? 'center-aligned' : ''}`}
                      title={col === 'csv_data' ? 'csv_data' :
                             col === 'report_name' ? 'report_name' :
                             col}
                      onClick={() => col !== 'transcript' && handleSort(col)}
                    >
                      <div className="header-content">
                        <span>
                          {col === 'csv_data' ? 'csv_data' :
                           col === 'report_name' ? 'report_name' :
                           col}
                        </span>
                        {col !== 'transcript' && (
                          <span className="sort-indicator">
                            {sortConfig.key === col ? 
                              (sortConfig.direction === 'asc' ? '↑' : '↓') : 
                              '↕'
                            }
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, index) => (
                  <tr key={startIndex + index}>
                    {columns.filter(col => col !== 'id').map(col => (
                      <td key={col} 
                          className={`${col === 'month' || col === 'year' ? 'narrow-column' : ''} ${col === 'month' || col === 'year' || col === 'status' || col === 'transcript' ? 'center-aligned' : ''}`}
                          title={col === 'status' ? '' : 
                                          col === 'transcript' ? 
                                            (row[col] && row[col].trim() ? 'Click View to see transcript' : 'No transcript available') :
                                          row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}>
                        {col === 'status' ? (
                          getStatusBadge(row[col])
                        ) : col === 'transcript' ? (
                          getTranscriptButton(row[col], index)
                        ) : col === 'month' ? (
                          row[col] !== null && row[col] !== undefined ? 
                            getMonthName(row[col]) : 
                            <span className="null-value">NULL</span>
                        ) : (
                          row[col] !== null && row[col] !== undefined ? 
                            String(row[col]) : 
                            <span className="null-value">NULL</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No podcasts data available</p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ← Previous
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Error Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Error Details</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <pre className="error-text">{modalContent}</pre>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {showTranscriptModal && (
        <div className="modal-overlay" onClick={closeTranscriptModal}>
          <div className="modal-content transcript-modal" onClick={(e) => e.stopPropagation()}>
            <div className="transcript-modal-header">
              <div className="transcript-header-content">
                <div className="modal-icon">📝</div>
                <div className="header-text">
                  <h3>View Transcript</h3>
                </div>
              </div>
              <button className="modal-close-elegant" onClick={closeTranscriptModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="transcript-modal-body">
              <div className="editor-container">
                <textarea
                  className="transcript-editor-elegant"
                  value={transcriptContent}
                  onChange={(e) => setTranscriptContent(e.target.value)}
                  placeholder="Enter the podcast transcript content here..."
                  rows={12}
                />
              </div>
           
            </div>
            <div className="transcript-modal-footer">
              <div className="modal-footer-left">
                <div className="word-count">{transcriptContent.split(/\s+/).filter(word => word.length > 0).length} words</div>
              </div>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataVisualizer;
