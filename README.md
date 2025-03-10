# Job Application Form

This is a **Next.js** job application form that collects user details and resumes, stores them in **Cloudflare R2** and **Cloudflare D1**, and integrates with **Google Sheets** and an API for automation.

## 🚀 Features
- Users submit **name, email, phone number, and CV**.
- CVs are uploaded to **Cloudflare R2** and a **public link** is generated.
- User details and the CV’s public link are stored in **Cloudflare D1**.
- Data is **pushed to Google Sheets** using Google API.
- Google Sheets data is sent to an **API endpoint**.
- An **automated email reply** is sent **the next day** to applicants.

## 🛠 Tech Stack
- **Frontend:** Next.js, Tailwind CSS
- **Cloud Storage:** Cloudflare R2
- **Database:** Cloudflare D1
- **Hosting:** Netlify
- **Automation:** Google API, Worker API

## 🌍 Live Demo
[**Job Application Form**](https://67c86be394f0040007a77032--bucolic-cobbler-914215.netlify.app/)  
[**Worker Endpoint**](https://job-application-worker.malmiwithanage.workers.dev/)  
[**Sample CV URL**](https://pub-24990f2f31744f558e74dd8d73328de5.r2.dev/metana/1741193135899_resume07.pdf)  
