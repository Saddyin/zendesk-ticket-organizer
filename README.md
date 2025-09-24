# Zendesk Ticket Category Organizer

A minimal Node.js + Express application that allows staff to categorize Zendesk tickets.

## Features

- ✅ Simple HTML form for ticket submission
- ✅ Numeric validation for ticket numbers (1-5 digits)
- ✅ Category selection dropdown (Category 1-5)
- ✅ In-memory storage of submitted tickets
- ✅ View all submitted tickets in a table format
- ✅ Client-side and server-side validation
- ✅ Clean, responsive UI

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   - Main form: http://localhost:3000
   - View tickets: http://localhost:3000/tickets

## API Endpoints

- `GET /` - Serves the main ticket submission form
- `POST /submit` - Handles form submission and stores tickets
- `GET /tickets` - Displays all submitted tickets in a table

## Validation Rules

- **Ticket Number**: Must be numeric, required, maximum 5 digits (1-99999)
- **Category**: Required selection from predefined categories (Category 1-5)

## File Structure

```
├── package.json          # Project dependencies and scripts
├── server.js             # Express server with all routes
├── index.html            # Main form page
└── README.md             # This file
```

## Technical Details

- **Backend**: Node.js with Express framework
- **Frontend**: Plain HTML with vanilla JavaScript
- **Storage**: In-memory array (data resets on server restart)
- **Port**: 3000
- **Validation**: Both client-side (real-time) and server-side validation
