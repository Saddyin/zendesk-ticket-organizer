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
 * Keyword extraction and similarity functions
 */
function extractKeywords(text) {
    // Convert to lowercase and remove punctuation
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    
    // Common stop words to ignore
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'cannot', 'cant', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
    
    // Extract words and filter out stop words and short words
    const words = cleanText.split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word))
        .filter(word => word.trim() !== '');
    
    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Return sorted by frequency
    return Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .map(([word]) => word);
}

function calculateSimilarity(ticket1, ticket2) {
    const text1 = `${ticket1.title} ${ticket1.description}`.toLowerCase();
    const text2 = `${ticket2.title} ${ticket2.description}`.toLowerCase();
    
    const keywords1 = new Set(extractKeywords(text1));
    const keywords2 = new Set(extractKeywords(text2));
    
    // Calculate Jaccard similarity (intersection / union)
    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
}

function findSimilarTickets(targetTicket, allTickets, limit = 5) {
    // Get both solved tickets (for solutions) and other open tickets (for batching)
    const otherTickets = allTickets.filter(ticket => ticket.id !== targetTicket.id);
    
    if (otherTickets.length === 0) return { solved: [], similar: [] };
    
    // Calculate similarity scores for all tickets
    const similarities = otherTickets.map(ticket => ({
        ticket,
        similarity: calculateSimilarity(targetTicket, ticket),
        commonKeywords: getCommonKeywords(targetTicket, ticket)
    }));
    
    // Filter by minimum similarity threshold (lowered for better detection)
    const validSimilarities = similarities.filter(item => item.similarity > 0.05);
    
    // Sort by similarity
    const sortedSimilarities = validSimilarities.sort((a, b) => b.similarity - a.similarity);
    
    // Separate solved and similar tickets
    const solvedTickets = sortedSimilarities
        .filter(item => item.ticket.status === 'Solved')
        .slice(0, limit);
        
    const similarTickets = sortedSimilarities
        .filter(item => item.ticket.status !== 'Solved')
        .slice(0, limit);
    
    return {
        solved: solvedTickets,
        similar: similarTickets
    };
}

function getCommonKeywords(ticket1, ticket2) {
    const text1 = `${ticket1.title} ${ticket1.description}`.toLowerCase();
    const text2 = `${ticket2.title} ${ticket2.description}`.toLowerCase();
    
    const keywords1 = new Set(extractKeywords(text1));
    const keywords2 = new Set(extractKeywords(text2));
    
    return [...keywords1].filter(x => keywords2.has(x));
}

function getStatusBadge(status) {
    const colors = {
        'Open': '#dc3545',
        'In Progress': '#ffc107',
        'Solved': '#28a745'
    };
    const color = colors[status] || '#6c757d';
    return `<span style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${status}</span>`;
}

function highlightKeywords(text, keywords) {
    let highlightedText = text;
    keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark style="background-color: #ffeb3b; padding: 2px;">$1</mark>');
    });
    return highlightedText;
}

/**
 * POST /submit - Handle form submission
 * Validates ticket data and stores the ticket with enhanced information
 */
app.post('/submit', (req, res) => {
    const { ticketNumber, ticketTitle, ticketDescription, category, status } = req.body;
    
    // Server-side validation
    if (!ticketNumber || !ticketTitle || !ticketDescription || !category || !status) {
        return res.status(400).send('Missing required fields');
    }
    
    // Validate ticket number: must be numeric and max 5 digits
    const ticketNum = ticketNumber.toString().trim();
    if (!/^\d{1,5}$/.test(ticketNum)) {
        return res.status(400).send('Invalid ticket number. Must be numeric and maximum 5 digits.');
    }
    
    // Validate category
    const validCategories = ['Email Issues', 'Login Problems', 'Software Installation', 'Network Connectivity', 'Hardware Issues'];
    if (!validCategories.includes(category)) {
        return res.status(400).send('Invalid category selected.');
    }
    
    // Validate status
    const validStatuses = ['Open', 'In Progress', 'Solved'];
    if (!validStatuses.includes(status)) {
        return res.status(400).send('Invalid status selected.');
    }
    
    // Store the ticket with enhanced data
    const ticket = {
        id: Date.now(),
        ticketNumber: parseInt(ticketNum),
        title: ticketTitle.trim(),
        description: ticketDescription.trim(),
        category: category,
        status: status,
        keywords: extractKeywords(`${ticketTitle} ${ticketDescription}`),
        timestamp: new Date().toISOString()
    };
    
    tickets.push(ticket);
    
    console.log(`New ticket added: #${ticketNum} - ${ticketTitle}`);
    
    // Redirect to ticket detail page to show similar tickets
    res.redirect(`/ticket/${ticket.id}`);
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
                        <th>Ticket #</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Submitted At</th>
                    </tr>
                </thead>
                <tbody>`;
        
        // Sort tickets by submission time (most recent first)
        const sortedTickets = tickets.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        sortedTickets.forEach(ticket => {
            const formattedDate = new Date(ticket.timestamp).toLocaleString();
            const statusBadge = getStatusBadge(ticket.status);
            html += `
                    <tr>
                        <td><a href="/ticket/${ticket.id}" style="color: #007bff; text-decoration: none;"><strong>#${ticket.ticketNumber}</strong></a></td>
                        <td><a href="/ticket/${ticket.id}" style="color: #333; text-decoration: none;">${ticket.title || 'No title'}</a></td>
                        <td>${ticket.category}</td>
                        <td>${statusBadge}</td>
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

/**
 * GET /ticket/:id - Display individual ticket with similar tickets
 */
app.get('/ticket/:id', (req, res) => {
    const ticketId = parseInt(req.params.id);
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) {
        return res.status(404).send('Ticket not found');
    }
    
    // Find similar tickets
    const similarTicketsResult = findSimilarTickets(ticket, tickets, 5);
    const { solved: solvedTickets, similar: similarTickets } = similarTicketsResult;
    
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket #${ticket.ticketNumber} - ${ticket.title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }
            h1, h2 {
                color: #333;
            }
            .ticket-header {
                border-bottom: 2px solid #eee;
                padding-bottom: 20px;
                margin-bottom: 20px;
            }
            .ticket-meta {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 4px;
            }
            .meta-item {
                display: flex;
                flex-direction: column;
            }
            .meta-label {
                font-weight: bold;
                color: #555;
                font-size: 14px;
                margin-bottom: 5px;
            }
            .meta-value {
                color: #333;
            }
            .description {
                line-height: 1.6;
                margin: 20px 0;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 4px;
                border-left: 4px solid #007bff;
            }
            .similar-tickets {
                margin-top: 30px;
            }
            .similar-ticket {
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 15px;
                margin-bottom: 15px;
                background-color: #f9f9f9;
            }
            .similar-ticket h4 {
                margin: 0 0 10px 0;
                color: #007bff;
            }
            .similarity-score {
                background-color: #007bff;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 12px;
                margin-left: 10px;
            }
            .keywords {
                margin-top: 10px;
                font-size: 14px;
                color: #666;
            }
            .back-link {
                display: inline-block;
                margin-bottom: 20px;
                padding: 10px 20px;
                background-color: #6c757d;
                color: white;
                text-decoration: none;
                border-radius: 4px;
            }
            .back-link:hover {
                background-color: #545b62;
            }
            mark {
                background-color: #ffeb3b;
                padding: 2px;
                border-radius: 2px;
            }
        </style>
    </head>
    <body>
        <a href="/tickets" class="back-link">← Back to All Tickets</a>
        
        <div class="container">
            <div class="ticket-header">
                <h1>Ticket #${ticket.ticketNumber}: ${ticket.title}</h1>
            </div>
            
            <div class="ticket-meta">
                <div class="meta-item">
                    <span class="meta-label">Status</span>
                    <span class="meta-value">${getStatusBadge(ticket.status)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Category</span>
                    <span class="meta-value">${ticket.category}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Created</span>
                    <span class="meta-value">${new Date(ticket.timestamp).toLocaleString()}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Keywords</span>
                    <span class="meta-value">${ticket.keywords.slice(0, 5).join(', ')}</span>
                </div>
            </div>
            
            <div class="description">
                <strong>Description:</strong><br>
                ${ticket.description}
            </div>
        </div>`;
    
    // Show similar open/in-progress tickets for batching
    if (similarTickets.length > 0) {
        html += `
        <div class="container">
            <div class="similar-tickets">
                <h2>🔗 Similar Open Tickets (${similarTickets.length} found)</h2>
                <p style="color: #666; margin-bottom: 20px;">These tickets may be related and could be batched together:</p>`;
        
        similarTickets.forEach(item => {
            const similarityPercent = Math.round(item.similarity * 100);
            const highlightedTitle = highlightKeywords(item.ticket.title, item.commonKeywords);
            const highlightedDescription = highlightKeywords(item.ticket.description || 'No description', item.commonKeywords);
            
            html += `
                <div class="similar-ticket">
                    <h4>
                        <a href="/ticket/${item.ticket.id}" style="color: #007bff; text-decoration: none;">
                            #${item.ticket.ticketNumber}: ${highlightedTitle}
                        </a>
                        <span class="similarity-score">${similarityPercent}% match</span>
                    </h4>
                    <p><strong>Category:</strong> ${item.ticket.category} | <strong>Status:</strong> ${getStatusBadge(item.ticket.status)}</p>
                    <p><strong>Description:</strong> ${highlightedDescription}</p>
                    <div class="keywords">
                        <strong>Common keywords:</strong> ${item.commonKeywords.join(', ')}
                    </div>
                </div>`;
        });
        
        html += `
            </div>
        </div>`;
    }
    
    // Show solved tickets for solutions
    if (solvedTickets.length > 0) {
        html += `
        <div class="container">
            <div class="similar-tickets">
                <h2>💡 Similar Solved Tickets (${solvedTickets.length} found)</h2>
                <p style="color: #666; margin-bottom: 20px;">These solved tickets have similar keywords and may have relevant solutions:</p>`;
        
        solvedTickets.forEach(item => {
            const similarityPercent = Math.round(item.similarity * 100);
            const highlightedTitle = highlightKeywords(item.ticket.title, item.commonKeywords);
            const highlightedDescription = highlightKeywords(item.ticket.description || 'No description', item.commonKeywords);
            
            html += `
                <div class="similar-ticket">
                    <h4>
                        <a href="/ticket/${item.ticket.id}" style="color: #007bff; text-decoration: none;">
                            #${item.ticket.ticketNumber}: ${highlightedTitle}
                        </a>
                        <span class="similarity-score">${similarityPercent}% match</span>
                    </h4>
                    <p><strong>Category:</strong> ${item.ticket.category} | <strong>Status:</strong> ${getStatusBadge(item.ticket.status)}</p>
                    <p><strong>Description:</strong> ${highlightedDescription}</p>
                    <div class="keywords">
                        <strong>Common keywords:</strong> ${item.commonKeywords.join(', ')}
                    </div>
                </div>`;
        });
        
        html += `
            </div>
        </div>`;
    }
    
    // Show message if no similar tickets found
    if (similarTickets.length === 0 && solvedTickets.length === 0) {
        html += `
        <div class="container">
            <div class="similar-tickets">
                <h2>🔍 Similar Tickets</h2>
                <p style="color: #666;">No similar tickets found. This might be a unique issue.</p>
            </div>
        </div>`;
    }
    
    html += `
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
