/**
 * CYB Guide - Google Sheets Logger
 * 
 * This file provides a sample implementation for logging user actions to Google Sheets.
 * 
 * Setup Instructions:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace the default code with the functions below
 * 4. Deploy as a web app with execute permissions for "Anyone"
 * 5. Use the web app URL as your logging endpoint
 */

// Sample Google Apps Script functions for Google Sheets logging
const GOOGLE_APPS_SCRIPT_FUNCTIONS = `
/**
 * Google Apps Script function to handle logging requests
 * Deploy this as a web app and use the URL in your Cloudflare Worker
 */
function doPost(e) {
  try {
    // Parse the incoming request
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet (or specify by ID)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Ensure headers exist
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'User Email', 'Action', 'Extra Info']);
    }
    
    // Append the new log entry
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.userEmail || 'anonymous',
      data.action || 'unknown',
      data.extraInfo || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the logger works
 */
function testLogger() {
  const testData = {
    timestamp: new Date().toISOString(),
    userEmail: 'test@example.com',
    action: 'test_action',
    extraInfo: JSON.stringify({ test: true })
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}

/**
 * Get all logs (optional - for admin dashboard integration)
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ logs: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Convert to array of objects
    const headers = data[0];
    const logs = data.slice(1).map(row => {
      const log = {};
      headers.forEach((header, index) => {
        log[header.toLowerCase().replace(' ', '')] = row[index];
      });
      return log;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ logs: logs.reverse() })) // Most recent first
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

/**
 * Frontend JavaScript logger class for CYB Guide
 * This class handles client-side logging to the Google Sheets backend
 */
class CYBLogger {
    constructor(endpoints = {}) {
        this.logEndpoint = endpoints.log || '/api/log-action';
        this.sheetsEndpoint = endpoints.sheets || null; // Google Apps Script web app URL
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        this.queue = [];
        this.isOnline = navigator.onLine;
        this.isProcessing = false;
        
        // Setup offline handling
        this.setupOfflineHandling();
    }
    
    /**
     * Log user action with automatic retry and offline queueing
     */
    async log(userEmail, action, extraInfo = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            userEmail: userEmail || 'anonymous',
            action,
            extraInfo: typeof extraInfo === 'string' ? extraInfo : JSON.stringify(extraInfo)
        };
        
        if (this.isOnline) {
            return this.sendLog(logEntry);
        } else {
            return this.queueLog(logEntry);
        }
    }
    
    /**
     * Send log entry to server with retry logic
     */
    async sendLog(logEntry, retryCount = 0) {
        try {
            // Try primary endpoint first
            const response = await fetch(this.logEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry),
            });
            
            if (response.ok) {
                return { success: true, entry: logEntry };
            }
            
            // If primary fails and we have Google Sheets endpoint, try that
            if (!response.ok && this.sheetsEndpoint && retryCount === 0) {
                return this.sendToSheets(logEntry);
            }
            
            throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
            
        } catch (error) {
            console.warn(\`Log attempt \${retryCount + 1} failed:\`, error.message);
            
            if (retryCount < this.maxRetries) {
                // Exponential backoff
                const delay = this.retryDelay * Math.pow(2, retryCount);
                await this.sleep(delay);
                return this.sendLog(logEntry, retryCount + 1);
            } else {
                // Queue for later if all retries failed
                return this.queueLog(logEntry);
            }
        }
    }
    
    /**
     * Send log entry directly to Google Sheets
     */
    async sendToSheets(logEntry) {
        if (!this.sheetsEndpoint) {
            throw new Error('Google Sheets endpoint not configured');
        }
        
        try {
            const response = await fetch(this.sheetsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry),
            });
            
            if (response.ok) {
                console.log('Log sent to Google Sheets successfully');
                return { success: true, entry: logEntry, method: 'sheets' };
            }
            
            throw new Error(\`Sheets API error: \${response.status}\`);
            
        } catch (error) {
            console.warn('Google Sheets logging failed:', error.message);
            throw error;
        }
    }
    
    /**
     * Queue log entry for offline processing
     */
    queueLog(logEntry) {
        this.queue.push(logEntry);
        this.saveQueue();
        console.log('Log entry queued for offline processing');
        return { success: true, queued: true, entry: logEntry };
    }
    
    /**
     * Process queued log entries when back online
     */
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0 || !this.isOnline) {
            return;
        }
        
        this.isProcessing = true;
        console.log(\`Processing \${this.queue.length} queued log entries\`);
        
        const processedEntries = [];
        const failedEntries = [];
        
        for (const entry of this.queue) {
            try {
                const result = await this.sendLog(entry);
                if (result.success && !result.queued) {
                    processedEntries.push(entry);
                } else {
                    failedEntries.push(entry);
                }
                
                // Small delay between requests
                await this.sleep(100);
                
            } catch (error) {
                console.warn('Failed to process queued entry:', error);
                failedEntries.push(entry);
            }
        }
        
        // Update queue with only failed entries
        this.queue = failedEntries;
        this.saveQueue();
        
        console.log(\`Processed \${processedEntries.length} entries, \${failedEntries.length} remain queued\`);
        this.isProcessing = false;
    }
    
    /**
     * Setup offline/online event handling
     */
    setupOfflineHandling() {
        window.addEventListener('online', () => {
            console.log('Connection restored, processing queued logs');
            this.isOnline = true;
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            console.log('Connection lost, queueing logs for later');
            this.isOnline = false;
        });
        
        // Load any existing queue from localStorage
        this.loadQueue();
        
        // Process queue on initialization if online
        if (this.isOnline && this.queue.length > 0) {
            setTimeout(() => this.processQueue(), 1000);
        }
    }
    
    /**
     * Save queue to localStorage
     */
    saveQueue() {
        try {
            localStorage.setItem('cyb_log_queue', JSON.stringify(this.queue));
        } catch (error) {
            console.warn('Failed to save log queue:', error);
        }
    }
    
    /**
     * Load queue from localStorage
     */
    loadQueue() {
        try {
            const saved = localStorage.getItem('cyb_log_queue');
            if (saved) {
                this.queue = JSON.parse(saved);
                console.log(\`Loaded \${this.queue.length} queued log entries from storage\`);
            }
        } catch (error) {
            console.warn('Failed to load log queue:', error);
            this.queue = [];
        }
    }
    
    /**
     * Get queue status for debugging
     */
    getStatus() {
        return {
            online: this.isOnline,
            processing: this.isProcessing,
            queued: this.queue.length,
            endpoint: this.logEndpoint,
            sheetsEndpoint: this.sheetsEndpoint
        };
    }
    
    /**
     * Clear the queue (for debugging)
     */
    clearQueue() {
        this.queue = [];
        this.saveQueue();
        console.log('Log queue cleared');
    }
    
    /**
     * Utility function for delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in CYB Guide
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CYBLogger, GOOGLE_APPS_SCRIPT_FUNCTIONS };
} else {
    window.CYBLogger = CYBLogger;
}

/**
 * Usage Example:
 * 
 * // Initialize logger
 * const logger = new CYBLogger({
 *     log: '/api/log-action',
 *     sheets: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
 * });
 * 
 * // Log user actions
 * logger.log('user@example.com', 'page_visit', { page: '/learning-guide' });
 * logger.log('user@example.com', 'ai_query', { query: 'What is nmap?' });
 * logger.log('anonymous', 'responsibility_accepted', { timestamp: new Date() });
 * 
 * // Check logger status
 * console.log(logger.getStatus());
 */`;

console.log('CYB Guide Logger Script Ready');
console.log('Google Apps Script Functions:');
console.log(GOOGLE_APPS_SCRIPT_FUNCTIONS);