# 🎙️ Podcast Transcript Dashboard

A React-based web application for managing and editing podcast transcripts with SQLite database integration. View, edit, and persist transcript changes with a modern, responsive interface.

## ✨ Features

- **� Database Visualization**: Interactive dashboard showing podcast data statistics
- **� Transcript Editing**: Full-featured editor with word count and persistence
- **💾 Data Persistence**: Changes saved to localStorage and persist across sessions
- **🔍 Advanced Filtering**: Search, filter by category/status/year, and sort data
- **📱 Responsive Design**: Modern UI that works on all devices
- **📁 Export Options**: Export data to CSV and backup database with changes
- **🎨 Custom Styling**: Beautiful design with Clash Grotesk and Michroma fonts

## 🚀 Live Demo

Visit the live application: [Your GitHub Pages URL]

## 🛠️ Technologies Used

- **Frontend**: React 18+ with Vite
- **Database**: sql.js (SQLite in WebAssembly)
- **Styling**: Modern CSS with custom color scheme
- **Persistence**: localStorage for client-side data persistence  
- **Deployment**: GitHub Pages with GitHub Actions

## 📦 Installation & Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/Podcast-Gen.git
   cd Podcast-Gen/dashboard
   cd dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🔧 Usage

### Dashboard Overview
- **Statistics Cards**: View total projects, completion rate, and transcript status
- **Status Breakdown**: See distribution of completed, pending, and error states
- **Export Options**: Download CSV data or backup database with changes

### Managing Transcripts
1. **View Transcript**: Click "View" button in the transcript column
2. **Edit Content**: Modify transcript text in the modal editor
3. **Save Changes**: Click "Save Changes" to persist to database and localStorage
4. **Reset Content**: Use "Reset" to revert to original transcript
5. **Word Count**: Real-time word count displayed in modal footer

### Data Filtering & Search
- **Search**: Use the search box to find specific content across all columns
- **Filter**: Use dropdown filters for category, status, and year
- **Sort**: Click column headers to sort data (ascending/descending)
- **Pagination**: Navigate through data with customizable items per page

### Data Persistence
- Changes are automatically saved to localStorage
- Persisted changes survive browser refresh and restart
- Use "Clear Changes" button to revert all modifications
- "Backup DB" includes all current changes in the export

## 📊 Supported Data Types

The application automatically detects and visualizes:
- Numeric data (integers, real numbers)
- Date/time data (for time-series charts)
- Categorical data (for grouping and aggregation)

## 🌐 Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Quick Deployment Steps:

1. **Create GitHub Repository**:
   ```bash
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/Podcast-Gen.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Set source to "GitHub Actions"
   - The workflow will automatically trigger

3. **Update Configuration** (if needed):
   - Edit `package.json` homepage URL with your username
   - Update `vite.config.js` base path if repository name differs

4. **Manual Deployment** (alternative):
   ```bash
   npm run deploy
   ```

### Configuration Files:
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `vite.config.js` - Vite configuration with correct base path
- `package.json` - Homepage URL and deployment scripts

### Access Your App:
After deployment, your app will be available at:
`https://yourusername.github.io/Podcast-Gen/`

## 🔒 Security Notes

- All database processing happens client-side in your browser
- No data is sent to external servers
- SQLite files are processed using WebAssembly for security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Known Issues

- Large database files (>50MB) may cause performance issues
- Some complex SQL data types may not display correctly
- Chart rendering may be slow for datasets with >1000 points

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed description
3. Include sample database file if possible (remove sensitive data)

---

Built with ❤️ using React, Chart.js, and sql.js
