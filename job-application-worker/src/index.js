export default {
    async fetch(request, env, ctx) {
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'POST') {
            try {
                const formData = await request.formData();
                const file = formData.get('cv');

                // Extract original filename
                const originalFileName = file.name;

                // Sanitize the original filename
                const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.]/g, '_');

                // Generate unique filename with timestamp
                const fileName = `${Date.now()}_${sanitizedFileName}`;
                const fileData = await file.arrayBuffer();
                const r2Key = `metana/${fileName}`;

                // Upload file to Cloudflare R2 storage
                await env.metana.put(r2Key, fileData, {
                    httpMetadata: { 
                        contentType: file.type 
                    }
                });

                // Validate required fields
                const name = formData.get('name');
                const email = formData.get('email');
                const phoneNumber = formData.get('phone_number');

                if (!name || !email || !phoneNumber) {
                    return new Response(JSON.stringify({
                        error: 'Missing required fields',
                        missingFields: {
                            name: !name,
                            email: !email,
                            phoneNumber: !phoneNumber
                        }
                    }), { 
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json'
                        }
                    });
                }

                // Store only the filename in `cv_public_url` (without original_filename column)
                const d1Response = await env.DB.prepare(
                    'INSERT INTO applicants (name, email, phone_number, cv_public_url) VALUES (?, ?, ?, ?)'
                ).bind(name, email, phoneNumber, fileName).run();

                return new Response(JSON.stringify({
                    message: 'CV uploaded and data saved successfully!',
                    fileName: fileName
                }), { 
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                });

            } catch (error) {
                return new Response(JSON.stringify({
                    error: 'There was an error processing your request',
                    details: error.message
                }), { 
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                });
            }
        }

        return new Response('Only POST requests are accepted', { 
            status: 400,
            headers: corsHeaders
        });
    }
};
