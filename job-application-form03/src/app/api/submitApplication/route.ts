// app/api/submitApplication/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phoneNumber = formData.get('phone_number') as string;
        const cv = formData.get('cv') as File;

        if (!name || !email || !phoneNumber || !cv) {
            return NextResponse.json(
                { error: 'Please fill all fields and upload a CV.' },
                { status: 400 }
            );
        }

        // You can add the logic to send the data to your Cloudflare worker or database here

        const formDataToSend = new FormData();
        formDataToSend.append('name', name);
        formDataToSend.append('email', email);
        formDataToSend.append('phone_number', phoneNumber);
        formDataToSend.append('cv', cv);

        // Send the form data to your Cloudflare worker or another API
        const response = await fetch('https://job-application-worker.malmiwithanage.workers.dev/', {
            method: 'POST',
            body: formDataToSend,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error || 'Something went wrong!' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'CV uploaded and data saved successfully!',
            fileName: data.fileName,
            filePublicUrl: data.filePublicUrl,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'There was an error processing your request' }, { status: 500 });
    }
}
