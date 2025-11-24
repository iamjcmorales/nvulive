const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Manejar CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: ''
    };
  }

  // Solo permitir método PATCH
  if (event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed. Use PATCH.' })
    };
  }

  try {
    const accessToken = process.env.VIMEO_ACCESS_TOKEN;
    
    if (!accessToken) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing Vimeo access token.' })
      };
    }

    // Obtener datos del cuerpo de la petición
    const body = JSON.parse(event.body || '{}');
    const { videoId, newName } = body;

    if (!videoId || !newName) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Missing required parameters: videoId and newName' 
        })
      };
    }

    // Validar que newName no esté vacío y tenga longitud razonable
    if (newName.trim().length === 0 || newName.length > 200) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Video name must be between 1 and 200 characters' 
        })
      };
    }

    // Hacer petición PATCH a la API de Vimeo
    const vimeoUrl = `https://api.vimeo.com/videos/${videoId}`;
    
    const response = await fetch(vimeoUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newName.trim()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vimeo API Error:', response.status, errorText);
      
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: `Vimeo API error: ${response.status}`,
          details: errorText
        })
      };
    }

    // Si la respuesta es exitosa, obtener los datos actualizados
    const updatedVideo = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Video renamed successfully',
        video: {
          id: updatedVideo.uri.replace('/videos/', ''),
          name: updatedVideo.name,
          link: updatedVideo.link
        }
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      })
    };
  }
};