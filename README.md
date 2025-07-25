# Sub Communities Lookup

A modern, responsive web application for searching and selecting sub communities from a Supabase database. Features real-time search with highlighting, keyboard navigation, and a clean user interface.

## Features

- 🔍 **Real-time search** with debounced input
- ✨ **Text highlighting** of matching search terms
- ⌨️ **Keyboard navigation** support
- 📱 **Responsive design** for mobile and desktop
- 🎨 **Modern UI** with smooth animations
- 🚀 **Fast performance** with optimized queries

## Setup Instructions

### 1. Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon/public key**

### 2. Update Configuration

Open `script.js` and replace the placeholder values:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';        // Replace with your Project URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
const WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL';      // Replace with your n8n webhook URL
```

### 3. Database Schema

Make sure your Supabase database has a table with sub communities. The default configuration expects:

- **Table name**: `sub_communities`
- **Column name**: `name` (for the sub community name)

If your table/column names are different, update the query in `script.js`:

```javascript
const { data, error } = await supabase
    .from('your_table_name')     // Replace with your actual table name
    .select('*')
    .ilike('your_column_name', `%${query}%`) // Replace with your actual column name
    .limit(10)
    .order('your_column_name');
```

### 3. Configure n8n Webhook (Optional)

If you want to receive the selected data in n8n:

1. Create a new workflow in n8n
2. Add a **Webhook** node as the trigger
3. Copy the webhook URL from the node
4. Update `WEBHOOK_URL` in `script.js` with your n8n webhook URL

The webhook will receive a JSON payload with:
- `sub_community`: The selected sub community name
- `user_email`: User's email address
- `selected_at`: ISO timestamp of selection
- `user_agent`: Browser information
- `timestamp`: Unix timestamp
- `full_data`: Complete data object from Supabase

### 4. Run the Application

1. Open `index.html` in a web browser
2. Or serve the files using a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. Navigate to `http://localhost:8000`

## Usage

1. **Type to search**: Start typing in the search box to find sub communities
2. **View results**: Matching results appear below the search box with highlighted text
3. **Select an item**: Click on a result or use keyboard navigation (Enter/Space)
4. **Clear selection**: Click the "Clear Selection" button to start over

## Keyboard Shortcuts

- **Escape**: Close search results
- **Enter/Space**: Select highlighted item
- **Tab**: Navigate between elements

## Customization

### Styling
Modify `styles.css` to customize the appearance:
- Colors and gradients
- Fonts and typography
- Spacing and layout
- Animations and transitions

### Functionality
Edit `script.js` to:
- Change search behavior
- Modify result display
- Add additional features
- Integrate with other APIs

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **"Please configure your Supabase credentials"**
   - Make sure you've updated the URL and key in `script.js`

2. **"Error searching sub communities"**
   - Check your table and column names
   - Verify your Supabase permissions
   - Check the browser console for detailed errors

3. **No results appearing**
   - Ensure your database has data
   - Check the table and column names match your schema
   - Verify the search query is working in Supabase dashboard

### Debug Mode

Open browser developer tools (F12) to see:
- Network requests to Supabase
- JavaScript errors
- Console logs for debugging

## Security Notes

- The anon key is safe to use in client-side code
- Row Level Security (RLS) policies should be configured in Supabase
- Consider implementing rate limiting for production use

## License

This project is open source and available under the MIT License. 