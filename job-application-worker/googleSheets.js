const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

// Load client secrets from a local file
const credentials = JSON.parse(fs.readFileSync('credentials.json')); // Ensure 'credentials.json' is your OAuth credentials file

// If modifying this, adjust the redirect URI in the Google Cloud Console
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

// Authorize and get the OAuth client
function authorize(callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]
    );

    // Check if we have previously stored a token
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

// Get a new token if the current one does not exist or is expired
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to ' + TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

// Write data to a specific Google Sheet
function saveToGoogleSheets(auth, extractedData) {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1m7LboojjOkqp1njB7JVrt1Q5S34Z61f6EQjbtguHUCs'; // Replace with your Google Sheets ID
    const range = 'Sheet1!A1'; // Modify the range if needed

    const values = [
        [extractedData.name, extractedData.email, extractedData.phone],
    ];

    const resource = {
        values,
    };

    sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource,
    }, (err, response) => {
        if (err) {
            console.error('The API returned an error: ' + err);
            return;
        }
        console.log('Data added to Google Sheets:', response.data);
    });
}

// Sample extracted data from a CV (for example purposes)
const extractedData = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '123-456-7890',
};

// Authorize and save the data to Google Sheets
authorize((auth) => {
    saveToGoogleSheets(auth, extractedData);
});
