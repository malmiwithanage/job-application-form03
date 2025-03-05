export default {
    async fetch(request, env, ctx) {
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        const PUBLIC_URL_PREFIX = 'https://pub-24990f2f31744f558e74dd8d73328de5.r2.dev/metana/';

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

                // Store the full public URL in `cv_public_url`
                const filePublicUrl = `${PUBLIC_URL_PREFIX}${fileName}`;

                // Insert applicant data with full public URL
                await env.DB.prepare(
                    'INSERT INTO applicants (name, email, phone_number, cv_public_url) VALUES (?, ?, ?, ?)'
                ).bind(name, email, phoneNumber, filePublicUrl).run();

                return new Response(JSON.stringify({
                    message: 'CV uploaded and data saved successfully!',
                    fileName: fileName,
                    filePublicUrl: filePublicUrl
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