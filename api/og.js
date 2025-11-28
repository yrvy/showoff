export default async function handler(req, res) {
  const { username, shortId } = req.query

  if (!username || !shortId) {
    return res.status(400).send('Missing parameters')
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

    const response = await fetch(
      `${supabaseUrl}/rest/v1/clips?short_id=eq.${shortId}&select=*,profile:profiles(*)`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )

    const data = await response.json()
    const clip = data[0]

    if (!clip || clip.profile?.username !== username) {
      return res.status(404).send('Clip not found')
    }

    // Format stats for Discord embed
    const stats = [
      `👤 @${clip.profile.username}`,
      `👁️ ${formatNumber(clip.views)} views`,
      `❤️ ${formatNumber(clip.likes)} likes`,
      clip.game ? `🎮 ${clip.game.toUpperCase()}` : '',
    ].filter(Boolean).join(' • ')

    const description = clip.description
      ? `${clip.description}\n\n${stats}`
      : stats

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(clip.title)} - @${clip.profile.username} | ShowOff</title>

    <meta property="og:type" content="video.other">
    <meta property="og:title" content="${escapeHtml(clip.title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="https://www.showoff.wtf/${username}/${shortId}">
    <meta property="og:site_name" content="ShowOff">

    <meta property="og:video" content="${clip.video_url}">
    <meta property="og:video:secure_url" content="${clip.video_url}">
    <meta property="og:video:type" content="video/mp4">
    <meta property="og:video:width" content="1280">
    <meta property="og:video:height" content="720">

    ${clip.thumbnail_url ? `<meta property="og:image" content="${clip.thumbnail_url}">
    <meta property="og:image:width" content="1280">
    <meta property="og:image:height" content="720">` : ''}

    <meta name="twitter:card" content="player">
    <meta name="twitter:title" content="${escapeHtml(clip.title)}">
    ${clip.thumbnail_url ? `<meta name="twitter:image" content="${clip.thumbnail_url}">` : ''}

    <meta name="theme-color" content="#FFFFFF">

    <script>
      // Redirect non-bots to the React app
      if (!/bot|crawler|spider|discordbot|twitterbot|facebookexternalhit/i.test(navigator.userAgent)) {
        window.location.href = "https://www.showoff.wtf/${username}/${shortId}";
      }
    </script>
</head>
<body style="font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 20px;">
    <h1>${escapeHtml(clip.title)}</h1>
    <p>By <strong>@${clip.profile.username}</strong></p>
    ${clip.description ? `<p>${escapeHtml(clip.description)}</p>` : ''}
    <p>👁️ ${clip.views} views | ❤️ ${clip.likes} likes</p>
    ${clip.video_url ? `<video controls style="width: 100%; max-width: 800px;"><source src="${clip.video_url}" type="video/mp4"></video>` : ''}
    <p><a href="https://www.showoff.wtf/${username}/${shortId}">View on ShowOff</a></p>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.status(200).send(html)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).send('Internal server error')
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return String(text).replace(/[&<>"']/g, (m) => map[m])
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}
