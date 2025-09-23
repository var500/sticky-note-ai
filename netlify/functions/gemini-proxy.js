// This is your secure Netlify Function.
// It runs on Netlify's servers and has secure access to your environment variables.

// The `handler` function is the entry point for the serverless function.
exports.handler = async function(event, context) {
  // Only allow POST requests.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Get the prompt from the request body sent by the browser.
    const { prompt } = JSON.parse(event.body);

    // Get your secret API key from the environment variables you set in the Netlify UI.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API key is not set in Netlify environment variables.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    // Call the actual Gemini API from the server.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch from Gemini API.' })
      };
    }

    const data = await response.json();

    // Send the successful response back to your front-end application.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("Proxy function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
