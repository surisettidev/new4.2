// CYB Guide Frontend JavaScript
class CYBGuide {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.currentLanguage = 'professional'; // default to professional mode
        this.responsibilityAccepted = false;
        
        this.init();
    }
    
    async init() {
        // Check if user has already accepted responsibility
        const accepted = localStorage.getItem('responsibility_accepted');
        if (accepted) {
            this.responsibilityAccepted = true;
            this.showMainApp();
        } else {
            this.showResponsibilityModal();
        }
        
        // Load language preference
        const savedLanguage = localStorage.getItem('language_preference');
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
            this.updateLanguageToggle();
        }
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Check authentication status
        this.checkAuthStatus();
        
        // Load initial data
        this.loadInitialData();
    }
    
    setupEventListeners() {
        // Responsibility modal
        const acceptCheckbox = document.getElementById('responsibility-accept');
        const proceedBtn = document.getElementById('proceed-btn');
        
        if (acceptCheckbox && proceedBtn) {
            acceptCheckbox.addEventListener('change', (e) => {
                proceedBtn.disabled = !e.target.checked;
            });
            
            proceedBtn.addEventListener('click', () => this.acceptResponsibility());
        }
        
        // Language toggle
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.addEventListener('change', (e) => {
                this.currentLanguage = e.target.checked ? 'casual' : 'professional';
                this.saveLanguagePreference();
                this.updateLanguageDisplay();
            });
        }
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = item.getAttribute('href');
                if (href) {
                    this.navigateToSection(href.substring(1)); // remove #
                    this.logAction('navigation_click', { section: href });
                }
            });
        });
        
        // AI Assistant
        const aiInput = document.getElementById('ai-input');
        const aiSend = document.getElementById('ai-send');
        
        if (aiInput && aiSend) {
            aiSend.addEventListener('click', () => this.sendAIQuery());
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendAIQuery();
                }
            });
        }
        
        // User menu
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', () => this.toggleUserMenu());
        }
    }
    
    showResponsibilityModal() {
        const modal = document.getElementById('responsibility-modal');
        const mainApp = document.getElementById('main-app');
        
        if (modal && mainApp) {
            modal.classList.remove('hidden');
            mainApp.classList.add('hidden');
        }
    }
    
    showMainApp() {
        const modal = document.getElementById('responsibility-modal');
        const mainApp = document.getElementById('main-app');
        
        if (modal && mainApp) {
            modal.classList.add('hidden');
            mainApp.classList.remove('hidden');
        }
    }
    
    async acceptResponsibility() {
        try {
            // Log the acceptance
            await this.logAction('responsibility_accepted', {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
            
            // Store acceptance locally
            localStorage.setItem('responsibility_accepted', 'true');
            this.responsibilityAccepted = true;
            
            // Show success notification
            this.showNotification('Responsibility accepted. Welcome to CYB Guide!', 'success');
            
            // Show main application
            this.showMainApp();
            
        } catch (error) {
            console.error('Failed to log acceptance:', error);
            this.showNotification('Failed to log acceptance. Please try again.', 'error');
        }
    }
    
    saveLanguagePreference() {
        localStorage.setItem('language_preference', this.currentLanguage);
    }
    
    updateLanguageToggle() {
        const toggle = document.getElementById('language-toggle');
        if (toggle) {
            toggle.checked = this.currentLanguage === 'casual';
        }
    }
    
    updateLanguageDisplay() {
        // Update all elements with language data attributes
        document.querySelectorAll('[data-casual][data-professional]').forEach(element => {
            const casualText = element.getAttribute('data-casual');
            const professionalText = element.getAttribute('data-professional');
            
            if (casualText && professionalText) {
                element.textContent = this.currentLanguage === 'casual' ? casualText : professionalText;
            }
        });
        
        // Add fade animation
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 150);
        
        // Log language change
        this.logAction('language_changed', { language: this.currentLanguage });
    }
    
    navigateToSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('fade-in');
            
            // Update URL hash
            window.location.hash = sectionId;
        }
    }
    
    async sendAIQuery() {
        const aiInput = document.getElementById('ai-input');
        const aiResponse = document.getElementById('ai-response');
        
        if (!aiInput || !aiResponse) return;
        
        const query = aiInput.value.trim();
        if (!query) {
            this.showNotification('Please enter a question', 'warning');
            return;
        }
        
        try {
            // Show loading state
            aiResponse.classList.remove('hidden');
            aiResponse.innerHTML = `
                <div class="flex items-center space-x-2 mb-4">
                    <div class="spinner"></div>
                    <span class="text-green-400">DEKE-AI is analyzing your query...</span>
                </div>
            `;
            
            // Send query to backend
            const response = await fetch('/api/ai-assistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    userEmail: this.currentUser?.email || 'anonymous'
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Display AI response with typing effect
                this.displayAIResponse(data.response, data.disclaimer);
                
                // Clear input
                aiInput.value = '';
                
            } else {
                throw new Error(data.error || 'AI Assistant unavailable');
            }
            
        } catch (error) {
            console.error('AI query failed:', error);
            aiResponse.innerHTML = `
                <div class="bg-red-900 border border-red-700 rounded-lg p-4 text-red-300">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    AI Assistant is currently unavailable. Please try again later.
                </div>
            `;
        }
    }
    
    displayAIResponse(response, disclaimer) {
        const aiResponse = document.getElementById('ai-response');
        
        // Format the response with proper styling
        const formattedResponse = this.formatAIResponse(response);
        
        aiResponse.innerHTML = `
            <div class="bg-gray-700 rounded-lg p-4">
                <div class="flex items-center space-x-3 mb-4">
                    <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center status-online">
                        <i class="fas fa-robot text-white"></i>
                    </div>
                    <div>
                        <h4 class="text-green-400 font-semibold">DEKE-AI</h4>
                        <p class="text-gray-400 text-xs">Ethical Hacking Assistant</p>
                    </div>
                </div>
                
                <div class="prose prose-green max-w-none">
                    ${formattedResponse}
                </div>
                
                ${disclaimer ? `
                    <div class="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded-lg">
                        <p class="text-yellow-300 text-sm">
                            <i class="fas fa-shield-alt mr-2"></i>
                            ${disclaimer}
                        </p>
                    </div>
                ` : ''}
                
                <div class="flex justify-between items-center mt-4 text-xs text-gray-500">
                    <span>Response generated at ${new Date().toLocaleTimeString()}</span>
                    <div class="flex space-x-2">
                        <button class="hover:text-green-400 transition-colors" onclick="cybGuide.copyToClipboard(this)" data-content="${encodeURIComponent(response)}">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <button class="hover:text-green-400 transition-colors" onclick="cybGuide.shareResponse(this)" data-content="${encodeURIComponent(response)}">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    formatAIResponse(response) {
        // Basic markdown-like formatting
        let formatted = response
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-300">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-green-200">$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-900 text-green-400 px-2 py-1 rounded text-sm">$1</code>')
            .replace(/```([\s\S]*?)```/g, '<div class="code-block mt-4 mb-4"><code class="text-green-400">$1</code></div>')
            .replace(/\n\n/g, '</p><p class="text-gray-300 mb-3">')
            .replace(/\n/g, '<br>');
        
        return `<p class="text-gray-300 mb-3">${formatted}</p>`;
    }
    
    async copyToClipboard(button) {
        const content = decodeURIComponent(button.dataset.content);
        try {
            await navigator.clipboard.writeText(content);
            button.innerHTML = '<i class="fas fa-check text-green-400"></i> Copied';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showNotification('Failed to copy to clipboard', 'error');
        }
    }
    
    shareResponse(button) {
        const content = decodeURIComponent(button.dataset.content);
        if (navigator.share) {
            navigator.share({
                title: 'CYB Guide AI Response',
                text: content,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            this.copyToClipboard(button);
        }
    }
    
    toggleUserMenu() {
        // Simple user menu toggle (implement dropdown)
        if (this.isLoggedIn) {
            // Show user menu with logout option
            console.log('Show user menu');
        } else {
            // Redirect to login
            window.location.href = '/login';
        }
    }
    
    async checkAuthStatus() {
        // Check if user is authenticated (simplified)
        // In a real implementation, verify JWT token
        const token = this.getCookie('auth_token');
        if (token) {
            try {
                const userData = JSON.parse(atob(token));
                this.currentUser = userData;
                this.isLoggedIn = true;
                this.updateUserInterface();
            } catch (error) {
                console.error('Invalid auth token:', error);
                this.isLoggedIn = false;
            }
        }
    }
    
    updateUserInterface() {
        const userMenu = document.getElementById('user-menu');
        if (userMenu && this.isLoggedIn) {
            userMenu.innerHTML = `
                <img src="${this.currentUser.picture || this.currentUser.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👤</text></svg>'}" 
                     alt="User Avatar" 
                     class="w-8 h-8 rounded-full border border-green-500">
            `;
        }
    }
    
    async loadInitialData() {
        try {
            // Load learning guide data
            const guideResponse = await fetch('/api/learning-guide');
            if (guideResponse.ok) {
                const guideData = await guideResponse.json();
                this.updateLearningGuide(guideData);
            }
            
            // Load events data
            const eventsResponse = await fetch('/api/events');
            if (eventsResponse.ok) {
                const eventsData = await eventsResponse.json();
                this.updateEvents(eventsData);
            }
            
            // Load announcements data
            const announcementsResponse = await fetch('/api/announcements');
            if (announcementsResponse.ok) {
                const announcementsData = await announcementsResponse.json();
                this.updateAnnouncements(announcementsData);
            }
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }
    
    updateLearningGuide(data) {
        // Update learning guide content dynamically
        console.log('Learning guide data loaded:', data);
    }
    
    updateEvents(data) {
        // Update events content dynamically
        console.log('Events data loaded:', data);
    }
    
    updateAnnouncements(data) {
        // Update announcements content dynamically
        console.log('Announcements data loaded:', data);
    }
    
    async logAction(action, extraInfo = {}) {
        try {
            await fetch('/api/log-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userEmail: this.currentUser?.email || 'anonymous',
                    action,
                    extraInfo
                }),
            });
        } catch (error) {
            console.error('Failed to log action:', error);
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
}

// Initialize the application
const cybGuide = new CYBGuide();

// Global utility functions
window.cybGuide = cybGuide;

// Handle browser navigation
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        cybGuide.navigateToSection(hash);
    }
});

// Handle initial hash navigation
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        cybGuide.navigateToSection(hash);
    }
});

// Handle page visibility changes for logging
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        cybGuide.logAction('page_focus', { timestamp: new Date().toISOString() });
    } else {
        cybGuide.logAction('page_blur', { timestamp: new Date().toISOString() });
    }
});

// Track time spent on page
let pageStartTime = Date.now();
window.addEventListener('beforeunload', () => {
    const timeSpent = Math.floor((Date.now() - pageStartTime) / 1000);
    cybGuide.logAction('page_exit', { 
        timeSpentSeconds: timeSpent,
        timestamp: new Date().toISOString() 
    });
});

console.log('🛡️ CYB Guide initialized - Welcome to ethical hacking education!');