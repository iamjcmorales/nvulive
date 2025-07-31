const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Manejar CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: ''
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const userId = params.userId || process.env.VIMEO_USER_ID;
    const folderId = params.folderId || process.env.VIMEO_FOLDER_ID;
    const accessToken = process.env.VIMEO_ACCESS_TOKEN;

    if (!userId || !folderId || !accessToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId, folderId, or access token.' })
      };
    }

    let videos = [];
    let apiUrl = `https://api.vimeo.com/users/${userId}/folders/${folderId}/videos?fields=uri,name,description,duration,pictures,stats,link&per_page=50`;

    while (apiUrl) {
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: `Vimeo API error: ${response.status}` })
        };
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        videos = videos.concat(data.data.map(video => ({
          id: video.uri.replace('/videos/', ''),
          title: video.name,
          description: video.description || '',
          thumbnail: video.pictures?.base_link || '',
          link: video.link
        })));
      }

      apiUrl = data.paging && data.paging.next ? `https://api.vimeo.com${data.paging.next}` : null;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(videos)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 