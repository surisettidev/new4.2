import { Hono } from 'hono'

type Bindings = {
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  DISCORD_CLIENT_ID?: string
  DISCORD_CLIENT_SECRET?: string
  JWT_SECRET?: string
}

export const authRoutes = new Hono<{ Bindings: Bindings }>()

// Google OAuth initiate
authRoutes.get('/google', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return c.json({ error: 'Google OAuth not configured' }, 500)
  }
  
  const redirectUri = `${new URL(c.req.url).origin}/auth/google/callback`
  const scope = 'email profile'
  const state = Math.random().toString(36).substring(7)
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=code&` +
    `state=${state}`
  
  return c.redirect(authUrl)
})

// Google OAuth callback
authRoutes.get('/google/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  
  if (!code) {
    return c.json({ error: 'Authorization code not found' }, 400)
  }
  
  try {
    const clientId = c.env.GOOGLE_CLIENT_ID
    const clientSecret = c.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${new URL(c.req.url).origin}/auth/google/callback`
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })
    
    const tokenData = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      return c.json({ error: 'Failed to exchange code for token', details: tokenData }, 400)
    }
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })
    
    const userData = await userResponse.json()
    
    if (!userResponse.ok) {
      return c.json({ error: 'Failed to get user info', details: userData }, 400)
    }
    
    // Create JWT token (simplified - in production use proper JWT library)
    const userToken = btoa(JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      provider: 'google',
      timestamp: Date.now()
    }))
    
    // Log user authentication
    await logUserAction(c, userData.email, 'google_login', { name: userData.name })
    
    // Set cookie and redirect
    c.header('Set-Cookie', `auth_token=${userToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`)
    return c.redirect('/')
    
  } catch (error) {
    return c.json({ error: 'Authentication failed', message: error.message }, 500)
  }
})

// Discord OAuth initiate
authRoutes.get('/discord', (c) => {
  const clientId = c.env.DISCORD_CLIENT_ID
  if (!clientId) {
    return c.json({ error: 'Discord OAuth not configured' }, 500)
  }
  
  const redirectUri = `${new URL(c.req.url).origin}/auth/discord/callback`
  const scope = 'identify email'
  const state = Math.random().toString(36).substring(7)
  
  const authUrl = `https://discord.com/api/oauth2/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=code&` +
    `state=${state}`
  
  return c.redirect(authUrl)
})

// Discord OAuth callback
authRoutes.get('/discord/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  
  if (!code) {
    return c.json({ error: 'Authorization code not found' }, 400)
  }
  
  try {
    const clientId = c.env.DISCORD_CLIENT_ID
    const clientSecret = c.env.DISCORD_CLIENT_SECRET
    const redirectUri = `${new URL(c.req.url).origin}/auth/discord/callback`
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })
    
    const tokenData = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      return c.json({ error: 'Failed to exchange code for token', details: tokenData }, 400)
    }
    
    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })
    
    const userData = await userResponse.json()
    
    if (!userResponse.ok) {
      return c.json({ error: 'Failed to get user info', details: userData }, 400)
    }
    
    // Create JWT token (simplified - in production use proper JWT library)
    const userToken = btoa(JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: `${userData.username}#${userData.discriminator}`,
      avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
      provider: 'discord',
      timestamp: Date.now()
    }))
    
    // Log user authentication
    await logUserAction(c, userData.email || userData.username, 'discord_login', { name: userData.username })
    
    // Set cookie and redirect
    c.header('Set-Cookie', `auth_token=${userToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`)
    return c.redirect('/')
    
  } catch (error) {
    return c.json({ error: 'Authentication failed', message: error.message }, 500)
  }
})

// Logout
authRoutes.post('/logout', (c) => {
  c.header('Set-Cookie', `auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0`)
  return c.json({ success: true })
})

// Helper function to log user actions
async function logUserAction(c: any, userEmail: string, action: string, extraInfo?: any) {
  try {
    const googleSheetsApiKey = c.env.GOOGLE_SHEETS_API_KEY
    const googleSheetId = c.env.GOOGLE_SHEET_ID
    
    if (!googleSheetsApiKey || !googleSheetId) {
      console.log('Google Sheets not configured for logging')
      return
    }
    
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      userEmail,
      action,
      extraInfo: extraInfo ? JSON.stringify(extraInfo) : ''
    }
    
    // In a real implementation, you would use Google Sheets API
    // For now, we'll log to console
    console.log('User Action Log:', logEntry)
    
  } catch (error) {
    console.error('Failed to log user action:', error)
  }
}