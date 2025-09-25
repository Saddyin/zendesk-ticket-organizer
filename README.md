# Zendesk Ticket Category Organizer

A comprehensive Node.js + Express application that allows staff to categorize Zendesk tickets and automatically detect similar tickets for batching recurring issues and finding solutions from previously solved cases.

## Features

### 🎫 **Core Ticket Management**
- ✅ Enhanced ticket submission form with title, description, and status
- ✅ Numeric validation for ticket numbers (1-5 digits)
- ✅ Realistic category selection (Email Issues, Login Problems, etc.)
- ✅ Status tracking (Open, In Progress, Solved)
- ✅ In-memory storage with enhanced data model
- ✅ Comprehensive ticket list with clickable links
- ✅ Individual ticket detail pages

### 🔍 **Smart Similarity Detection**
- ✅ **Keyword-based matching** - No AI required, uses proven algorithms
- ✅ **Similar Open Tickets** - Identify recurring issues for batching
- ✅ **Similar Solved Tickets** - Find solutions from past cases
- ✅ **Keyword highlighting** - Visual identification of common terms
- ✅ **Similarity scoring** - Percentage-based match confidence
- ✅ **Real-time analysis** - Instant similarity detection on submission

### 🎨 **UI/UX Features**
- ✅ **Mobile-responsive design** - Adaptive layouts for desktop and mobile
- ✅ **Status badges** - Color-coded status indicators (Open: Red, In Progress: Orange, Solved: Green)
- ✅ **Desktop table view** - Full-featured table with sortable columns
- ✅ **Mobile card view** - Touch-friendly card layout for small screens
- ✅ **Blue navigation buttons** - Consistent button styling throughout
- ✅ **Hover effects** - Interactive elements with visual feedback
- ✅ **Modern shadows and borders** - Clean, professional appearance

### 🛠️ **Development Features**
- ✅ Hot reload with nodemon for server changes
- ✅ Client-side and server-side validation
- ✅ Clean, responsive UI with modern design
- ✅ Comprehensive error handling
- ✅ Sticky table headers for better navigation
- ✅ Automatic ticket sorting by submission time

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **For development (with hot reload):**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Main form: http://localhost:3000
   - View tickets: http://localhost:3000/tickets
   - Individual tickets: http://localhost:3000/ticket/{id}

## Similarity Detection Workflow

### 🔄 **How It Works:**
1. **Submit a ticket** with title and description
2. **System automatically redirects** to ticket detail page
3. **Algorithm analyzes** keywords and finds similar tickets
4. **Shows two sections:**
   - 🔗 **Similar Open Tickets** - For batching recurring issues
   - 💡 **Similar Solved Tickets** - For finding proven solutions
5. **Keywords are highlighted** in yellow for easy identification
6. **Click through** similar tickets to see cross-references

### 📊 **Example Scenario:**
- **New ticket:** "Can't access Gmail account"
- **Similar tickets found:**
  - "Gmail login problems" (85% match)
  - "Email access issues" (72% match)
- **Common keywords highlighted:** `gmail`, `access`, `login`

## API Endpoints

- `GET /` - Serves the main ticket submission form
- `POST /submit` - Handles form submission, stores tickets, and redirects to detail page
- `GET /tickets` - Displays all submitted tickets in a table with status badges
- `GET /ticket/:id` - Shows individual ticket with similar ticket analysis

## Validation Rules

- **Ticket Number**: Must be numeric, required, maximum 5 digits (1-99999)
- **Title**: Required, maximum 100 characters
- **Description**: Required, maximum 500 characters  
- **Category**: Required selection from predefined categories (Email Issues, Login Problems, etc.)
- **Status**: Required selection (Open, In Progress, Solved)

## Algorithms Used

### 🔍 **Jaccard Similarity**
The core algorithm for measuring ticket similarity without requiring AI.

**Formula:** `Jaccard = |Intersection| / |Union|`

**How it works:**
```javascript
// Example: Compare two tickets
Ticket A: "Can't log into Gmail"
Ticket B: "Gmail login problems"

// Step 1: Extract keywords
Keywords A: {gmail, login, cant}
Keywords B: {gmail, login, problems}

// Step 2: Find intersection (common words)
Intersection: {gmail, login} → 2 items

// Step 3: Find union (all unique words)  
Union: {gmail, login, cant, problems} → 4 items

// Step 4: Calculate similarity
Jaccard = 2/4 = 0.5 = 50% similarity
```

**Why Jaccard is perfect for tickets:**
- ✅ **Simple & Fast** - No training data or complex models needed
- ✅ **Handles varying lengths** - Works with short titles or long descriptions
- ✅ **Focus on overlap** - More shared keywords = higher similarity
- ✅ **Intuitive scoring** - 0% to 100% match percentage
- ✅ **Real-time performance** - Instant results for user experience

### 🔤 **Keyword Extraction Algorithm**
Prepares text for similarity analysis by extracting meaningful terms.

**Process:**
1. **Normalize text** - Convert to lowercase, remove punctuation
2. **Tokenize** - Split into individual words
3. **Remove stop words** - Filter out common words (the, and, is, etc.)
4. **Filter short words** - Remove words less than 3 characters
5. **Count frequency** - Track how often each word appears
6. **Return sorted keywords** - Most frequent words first

**Stop words filtered:** `{the, a, an, and, or, but, in, on, at, to, for, of, with, by, is, are, was, were, be, been, have, has, had, do, does, did, will, would, could, should, may, might, can, cannot, cant, i, you, he, she, it, we, they, my, your, his, her, its, our, their}`

### ⚡ **Similarity Threshold**
- **Minimum threshold:** 5% - Prevents showing completely unrelated tickets
- **Good matches:** 50-80% - Tickets with substantial keyword overlap
- **High matches:** 80%+ - Nearly identical issues

## Mobile-Responsive Design

### 📱 **Responsive Breakpoints**
- **Desktop (768px+)**: Full table layout with horizontal scrolling
- **Mobile (<768px)**: Card-based layout optimized for touch

### 🎨 **Status Badge Colors**
- **Open**: `#dc3545` (Red) - Urgent attention needed
- **In Progress**: `#fd7e14` (Orange) - Work in progress
- **Solved**: `#198754` (Green) - Completed successfully

### 📋 **Layout Features**
- **Desktop Table**: Sortable columns, sticky headers, hover effects
- **Mobile Cards**: Touch-friendly cards with status badges in header
- **Navigation**: Blue buttons with consistent styling and hover states
- **Typography**: Responsive font sizes and proper contrast ratios

## File Structure

```
├── package.json          # Project dependencies and scripts
├── package-lock.json     # Locked dependency versions
├── server.js             # Express server with similarity algorithms and embedded HTML/CSS
├── index.html            # Enhanced form with title/description fields and validation
├── nodemon.json          # Development server configuration
├── .gitignore           # Git ignore rules for Node.js projects
└── README.md            # This comprehensive documentation
```

**Note**: All HTML, CSS, and JavaScript are embedded within the respective files for simplicity. The server.js contains the tickets list and detail page HTML/CSS, while index.html contains the form page with embedded styles and validation scripts.

## Technical Details

- **Backend**: Node.js with Express framework
- **Frontend**: Plain HTML with vanilla JavaScript validation
- **Storage**: In-memory array with enhanced ticket data model
- **Port**: 3000 (configurable via PORT environment variable)
- **Algorithms**: Jaccard similarity, keyword extraction, stop word filtering
- **Validation**: Both client-side (real-time) and server-side validation
- **Development**: Hot reload with nodemon for server changes
- **Similarity Detection**: Real-time analysis with keyword highlighting
- **Responsive Design**: Mobile-first approach with breakpoint at 768px
- **Status Badges**: Enhanced color-coded status indicators
- **UI Framework**: Custom CSS with modern design patterns
