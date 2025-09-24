const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// In-memory storage for tickets (array of objects)
let tickets = [];

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from current directory
app.use(express.static(__dirname));

/**
 * GET / - Serve the main form page
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * POST /submit - Handle form submission
 * Validates ticket number and stores the ticket with category
 */
app.post('/submit', (req, res) => {
    const { ticketNumber, category } = req.body;
    
    // Server-side validation
    if (!ticketNumber || !category) {
        return res.status(400).send('Missing required fields: ticket number and category');
    }
    
    // Validate ticket number: must be numeric and max 5 digits
    const ticketNum = ticketNumber.toString().trim();
    if (!/^\d{1,5}$/.test(ticketNum)) {
        return res.status(400).send('Invalid ticket number. Must be numeric and maximum 5 digits.');
    }
    
    // Validate category (ensure it's one of the expected values)
    const validCategories = ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'];
    if (!validCategories.includes(category)) {
        return res.status(400).send('Invalid category selected.');
    }
    
    // Store the ticket
    const ticket = {
        id: Date.now(), // Simple ID generation
        ticketNumber: parseInt(ticketNum),
        category: category,
        timestamp: new Date().toISOString()
    };
    
    tickets.push(ticket);
    
    console.log(`New ticket added: ${ticketNum} - ${category}`);
    
    // Redirect to tickets page
    res.redirect('/tickets');
});

/**
 * GET /tickets - Display all submitted tickets in a table
 */
app.get('/tickets', (req, res) => {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Zendesk Tickets - Submitted Tickets</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
                color: #333;
                text-align: center;
                margin-bottom: 30px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #f8f9fa;
                font-weight: bold;
                color: #555;
            }
            tr:hover {
                background-color: #f8f9fa;
            }
            .no-tickets {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 40px;
            }
            .back-link {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            .back-link:hover {
                background-color: #0056b3;
            }
            .stats {
                background-color: #e9ecef;
                padding: 15px;
                border-radius: 4px;
                margin-bottom: 20px;
                text-align: center;
                color: #495057;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📋 Submitted Zendesk Tickets</h1>
            
            <div class="stats">
                <strong>Total Tickets: ${tickets.length}</strong>
            </div>`;
    
    if (tickets.length === 0) {
        html += `
            <div class="no-tickets">
                No tickets have been submitted yet.
            </div>`;
    } else {
        html += `
            <table>
                <thead>
                    <tr>
                        <th>Ticket Number</th>
                        <th>Category</th>
                        <th>Submitted At</th>
                    </tr>
                </thead>
                <tbody>`;
        
        // Sort tickets by submission time (most recent first)
        const sortedTickets = tickets.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        sortedTickets.forEach(ticket => {
            const formattedDate = new Date(ticket.timestamp).toLocaleString();
            html += `
                    <tr>
                        <td><strong>#${ticket.ticketNumber}</strong></td>
                        <td>${ticket.category}</td>
                        <td>${formattedDate}</td>
                    </tr>`;
        });
        
        html += `
                </tbody>
            </table>`;
    }
    
    html += `
            <a href="/" class="back-link">← Add New Ticket</a>
        </div>
    </body>
    </html>`;
    
    res.send(html);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Zendesk Ticket Organizer running on http://localhost:${PORT}`);
    console.log(`📋 Access the form at: http://localhost:${PORT}`);
    console.log(`📊 View tickets at: http://localhost:${PORT}/tickets`);
});
