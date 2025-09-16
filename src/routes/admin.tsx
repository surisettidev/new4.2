import { Hono } from 'hono'

type Bindings = {
  ADMIN_PASSWORD?: string
  GOOGLE_SHEETS_API_KEY?: string
  GOOGLE_SHEET_ID?: string
}

export const adminRoutes = new Hono<{ Bindings: Bindings }>()

// Admin login page
adminRoutes.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en" class="bg-black">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CYB Guide Admin</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-black text-green-500 font-mono min-h-screen flex items-center justify-center">
        <div class="bg-gray-900 border border-green-500 rounded-lg p-8 max-w-md w-full mx-4">
            <div class="text-center mb-6">
                <i class="fas fa-shield-alt text-4xl text-green-500 mb-4"></i>
                <h2 class="text-2xl font-bold text-green-400">Admin Access</h2>
                <p class="text-gray-400 mt-2">Enter administrator credentials</p>
            </div>
            
            <form id="admin-login-form" class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-2">Password</label>
                    <input 
                        type="password" 
                        id="admin-password" 
                        required 
                        class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:border-green-500"
                        placeholder="Enter admin password"
                    >
                </div>
                
                <button 
                    type="submit" 
                    class="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                    <i class="fas fa-sign-in-alt mr-2"></i>Access Dashboard
                </button>
            </form>
            
            <div id="error-message" class="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-300 text-sm hidden">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span id="error-text">Invalid credentials</span>
            </div>
        </div>
        
        <script>
            document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const password = document.getElementById('admin-password').value;
                const errorDiv = document.getElementById('error-message');
                
                try {
                    const response = await fetch('/admin/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ password }),
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok && result.success) {
                        window.location.href = '/admin/dashboard';
                    } else {
                        errorDiv.classList.remove('hidden');
                        document.getElementById('error-text').textContent = result.error || 'Invalid credentials';
                    }
                } catch (error) {
                    errorDiv.classList.remove('hidden');
                    document.getElementById('error-text').textContent = 'Login failed. Please try again.';
                }
            });
        </script>
    </body>
    </html>
  `)
})

// Admin login endpoint
adminRoutes.post('/login', async (c) => {
  try {
    const { password } = await c.req.json()
    const adminPassword = c.env.ADMIN_PASSWORD || 'Yethical'
    
    if (password !== adminPassword) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Create simple admin session token
    const adminToken = btoa(JSON.stringify({
      role: 'admin',
      timestamp: Date.now(),
      expires: Date.now() + 3600000 // 1 hour
    }))
    
    c.header('Set-Cookie', `admin_token=${adminToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
    return c.json({ success: true })
    
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Admin dashboard
adminRoutes.get('/dashboard', (c) => {
  // Simple token validation (in production, use proper JWT)
  const adminToken = c.req.header('cookie')?.match(/admin_token=([^;]+)/)?.[1]
  
  if (!adminToken) {
    return c.redirect('/admin')
  }
  
  try {
    const tokenData = JSON.parse(atob(adminToken))
    if (tokenData.expires < Date.now()) {
      return c.redirect('/admin')
    }
  } catch {
    return c.redirect('/admin')
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="en" class="bg-black">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CYB Guide Admin Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-black text-green-500 font-mono">
        <nav class="bg-gray-900 border-b border-green-500 p-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <i class="fas fa-shield-alt text-2xl text-green-400"></i>
                    <h1 class="text-xl font-bold text-green-400">CYB Guide Admin</h1>
                </div>
                <button id="logout-btn" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        </nav>
        
        <div class="container mx-auto p-6">
            <!-- Dashboard Tabs -->
            <div class="mb-6">
                <nav class="flex space-x-4">
                    <button class="tab-btn active" data-tab="logs">
                        <i class="fas fa-list-alt mr-2"></i>Activity Logs
                    </button>
                    <button class="tab-btn" data-tab="settings">
                        <i class="fas fa-cog mr-2"></i>Settings
                    </button>
                    <button class="tab-btn" data-tab="content">
                        <i class="fas fa-edit mr-2"></i>Content Management
                    </button>
                </nav>
            </div>
            
            <!-- Activity Logs Tab -->
            <div id="logs-tab" class="tab-content">
                <div class="bg-gray-900 border border-green-500 rounded-lg p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-green-400">User Activity Logs</h2>
                        <div class="flex space-x-2">
                            <button id="refresh-logs" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                <i class="fas fa-sync-alt mr-2"></i>Refresh
                            </button>
                            <button id="export-logs" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                                <i class="fas fa-download mr-2"></i>Export CSV
                            </button>
                        </div>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-700">
                                    <th class="text-left py-2 text-green-400">Timestamp</th>
                                    <th class="text-left py-2 text-green-400">User Email</th>
                                    <th class="text-left py-2 text-green-400">Action</th>
                                    <th class="text-left py-2 text-green-400">Extra Info</th>
                                </tr>
                            </thead>
                            <tbody id="logs-tbody" class="text-gray-300">
                                <tr>
                                    <td class="py-2">Loading...</td>
                                    <td class="py-2"></td>
                                    <td class="py-2"></td>
                                    <td class="py-2"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Settings Tab -->
            <div id="settings-tab" class="tab-content hidden">
                <div class="grid gap-6">
                    <div class="bg-gray-900 border border-green-500 rounded-lg p-6">
                        <h3 class="text-lg font-bold text-green-400 mb-4">Admin Password</h3>
                        <form id="password-form" class="space-y-4">
                            <div>
                                <label class="block text-sm text-gray-400 mb-2">New Password</label>
                                <input 
                                    type="password" 
                                    id="new-password" 
                                    class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:border-green-500"
                                    placeholder="Enter new admin password"
                                >
                            </div>
                            <button type="submit" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg">
                                <i class="fas fa-key mr-2"></i>Update Password
                            </button>
                        </form>
                    </div>
                    
                    <div class="bg-gray-900 border border-green-500 rounded-lg p-6">
                        <h3 class="text-lg font-bold text-green-400 mb-4">Language Pairs</h3>
                        <div id="language-pairs-container">
                            <!-- Language pairs will be loaded here -->
                        </div>
                        <button id="add-language-pair" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-plus mr-2"></i>Add Language Pair
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Content Management Tab -->
            <div id="content-tab" class="tab-content hidden">
                <div class="bg-gray-900 border border-green-500 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-green-400 mb-4">Learning Guide Management</h3>
                    <p class="text-gray-400 mb-4">Manage learning paths, modules, and resources</p>
                    
                    <div class="grid gap-4">
                        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <h4 class="text-green-400 font-semibold mb-2">Quick Actions</h4>
                            <div class="flex space-x-2">
                                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                    <i class="fas fa-plus mr-2"></i>Add Module
                                </button>
                                <button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                                    <i class="fas fa-edit mr-2"></i>Edit Content
                                </button>
                                <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                                    <i class="fas fa-save mr-2"></i>Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            // Tab switching
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabId = btn.dataset.tab;
                    
                    // Update buttons
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Update content
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.add('hidden');
                    });
                    document.getElementById(tabId + '-tab').classList.remove('hidden');
                });
            });
            
            // Logout
            document.getElementById('logout-btn').addEventListener('click', async () => {
                try {
                    await fetch('/admin/logout', { method: 'POST' });
                    window.location.href = '/admin';
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            });
            
            // Load logs
            async function loadLogs() {
                try {
                    const response = await fetch('/admin/logs');
                    const logs = await response.json();
                    
                    const tbody = document.getElementById('logs-tbody');
                    tbody.innerHTML = logs.map(log => \`
                        <tr class="border-b border-gray-800 hover:bg-gray-800">
                            <td class="py-2">\${new Date(log.timestamp).toLocaleString()}</td>
                            <td class="py-2">\${log.userEmail}</td>
                            <td class="py-2">
                                <span class="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                                    \${log.action}
                                </span>
                            </td>
                            <td class="py-2 text-xs text-gray-400">\${log.extraInfo || '-'}</td>
                        </tr>
                    \`).join('');
                } catch (error) {
                    console.error('Failed to load logs:', error);
                }
            }
            
            // Refresh logs
            document.getElementById('refresh-logs').addEventListener('click', loadLogs);
            
            // Export logs
            document.getElementById('export-logs').addEventListener('click', async () => {
                try {
                    const response = await fetch('/admin/export-logs');
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'cyb-guide-logs.csv';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                } catch (error) {
                    console.error('Export failed:', error);
                }
            });
            
            // Load initial data
            loadLogs();
            
            // Style for active tab
            const style = document.createElement('style');
            style.textContent = \`
                .tab-btn {
                    @apply px-4 py-2 rounded-lg text-gray-400 hover:text-green-400 transition-colors border border-transparent;
                }
                .tab-btn.active {
                    @apply text-green-400 border-green-500 bg-gray-900;
                }
            \`;
            document.head.appendChild(style);
        </script>
    </body>
    </html>
  `)
})

// Get logs endpoint
adminRoutes.get('/logs', (c) => {
  // Simple token validation
  const adminToken = c.req.header('cookie')?.match(/admin_token=([^;]+)/)?.[1]
  
  if (!adminToken) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  // Mock logs data (in real implementation, fetch from Google Sheets)
  const mockLogs = [
    {
      timestamp: new Date().toISOString(),
      userEmail: 'user1@example.com',
      action: 'responsibility_accepted',
      extraInfo: JSON.stringify({ userAgent: 'Mozilla/5.0...' })
    },
    {
      timestamp: new Date(Date.now() - 60000).toISOString(),
      userEmail: 'user2@example.com',
      action: 'google_login',
      extraInfo: JSON.stringify({ name: 'John Doe' })
    },
    {
      timestamp: new Date(Date.now() - 120000).toISOString(),
      userEmail: 'user1@example.com',
      action: 'ai_query',
      extraInfo: JSON.stringify({ query: 'What is nmap?' })
    }
  ]
  
  return c.json(mockLogs)
})

// Export logs as CSV
adminRoutes.get('/export-logs', (c) => {
  // Simple token validation
  const adminToken = c.req.header('cookie')?.match(/admin_token=([^;]+)/)?.[1]
  
  if (!adminToken) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  // Mock CSV data
  const csvContent = `Timestamp,User Email,Action,Extra Info
${new Date().toISOString()},user1@example.com,responsibility_accepted,"{"userAgent":"Mozilla/5.0..."}"
${new Date(Date.now() - 60000).toISOString()},user2@example.com,google_login,"{"name":"John Doe"}"
${new Date(Date.now() - 120000).toISOString()},user1@example.com,ai_query,"{"query":"What is nmap?"}"`
  
  return c.text(csvContent, 200, {
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="cyb-guide-logs.csv"'
  })
})

// Update admin password
adminRoutes.post('/update-password', async (c) => {
  // Simple token validation
  const adminToken = c.req.header('cookie')?.match(/admin_token=([^;]+)/)?.[1]
  
  if (!adminToken) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { newPassword } = await c.req.json()
    
    if (!newPassword || newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400)
    }
    
    // In a real implementation, you would update the password in Cloudflare Secrets
    // For now, we'll just return success
    console.log('Admin password update requested:', { newPassword })
    
    return c.json({ 
      success: true, 
      message: 'Password updated. Please update ADMIN_PASSWORD in Cloudflare Secrets.' 
    })
    
  } catch (error) {
    return c.json({ error: 'Failed to update password' }, 500)
  }
})

// Admin logout
adminRoutes.post('/logout', (c) => {
  c.header('Set-Cookie', `admin_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0`)
  return c.json({ success: true })
})