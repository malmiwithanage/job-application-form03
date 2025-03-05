export default {
    async fetch(request, env, ctx) {
        // Cloudflare R2 public URL prefix
        const PUBLIC_URL_PREFIX = 'https://pub-24990f2f31744f558e74dd8d73328de5.r2.dev/metana/';

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

                // Validate other required fields
                const name = formData.get('name');
                const email = formData.get('email');
                const phoneNumber = formData.get('phone_number');

                // Validation checks for other fields
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

                // Save applicant details with R2 filename and original filename
                const d1Response = await env.DB.prepare(
                    'INSERT INTO applicants (name, email, phone_number, cv_public_url, original_filename) VALUES (?, ?, ?, ?, ?)'
                ).bind(name, email, phoneNumber, fileName, fileName).run();

                return new Response(JSON.stringify({
                    message: 'CV uploaded and data saved successfully!',
                    fileUrl: `${PUBLIC_URL_PREFIX}${fileName}`
                }), { 
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                });

            } catch (error) {
                console.error('Error processing form submission:', error);
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