'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const Apply = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [cv, setCv] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Drag & Drop functionality using react-dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] }, // Only allow PDFs
        multiple: false,
        onDrop: (acceptedFiles) => {
            setCv(acceptedFiles[0]); // Set the uploaded file
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !phoneNumber || !cv) {
            setMessage('Please fill all fields and upload your CV.');
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone_number', phoneNumber);
        formData.append('cv', cv);

        try {
            const response = await fetch('/api/submitApplication', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('CV uploaded and data saved successfully!');
                // Reset the form
                setName('');
                setEmail('');
                setPhoneNumber('');
                setCv(null);
            } else {
                setMessage(data.error || 'Something went wrong!');
            }
        } catch (error) {
            setMessage('There was an error processing your request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex justify-center items-center">
            <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Apply for This Job</h1>
                <form onSubmit={handleSubmit}>

                  <div className="mb-4">
                    {/* Drag & Drop File Upload */}
                    <label className="block text-sm font-medium text-black">Resume/CV</label>
                    <div {...getRootProps()} className="mb-4 mt-4 border-2 border-dashed border-gray-400 rounded-md p-6 text-center cursor-pointer hover:border-gray-600 transition">
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p className="text-blue-600 font-medium">Drop your resume here...</p>
                        ) : (
                            <p className="text-gray-600">
                                <strong>Click or drag file to this area to upload your Resume</strong><br />
                                <span className="text-sm">Please make sure to upload a PDF</span>
                            </p>
                        )}
                        {cv && <p className="mt-2 text-sm text-green-600">Selected file: {cv.name}</p>}
                    </div>
                    </div>
                  
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-black">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-black">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-black">Phone Number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>

                    

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#d0fc03] text-black py-2 rounded-md mt-4 hover:bg-[#b8e002] focus:outline-none focus:ring-2 focus:ring-[#b8e002] disabled:opacity-50 cursor-pointer"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>

                {message && <p className="text-center mt-4 text-sm text-orange-400">{message}</p>}
            </div>
        </div>
    );
};

export default Apply;
