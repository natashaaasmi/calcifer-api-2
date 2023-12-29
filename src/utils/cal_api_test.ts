//set up gcal API to pull events from
import { calendar_v3, google } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';
import Calendar = calendar_v3.Calendar;
import Schema$Event = calendar_v3.Schema$Event;

const CLIENT_ID = '379576427887-99ucv73jkv9gb16m82i2jc3srmnst1vk.apps.googleusercontent.com'
const API_KEY = 'AIzaSyD5bkN0TaYLJCeT2bSbfERjOg0m_tqa39A'

const SCOPES = 'https://www.googleapis.com/auth/calendar'

const auth: OAuth2Client = new google.auth.OAuth2(CLIENT_ID, API_KEY);
const calendar: Calendar = google.calendar({ version: 'v3', auth })

const oauth2Client = new google.auth.OAuth2({
    clientId: CLIENT_ID,
    clientSecret: API_KEY,
    redirectUri: 'http://localhost:3000/api/cal_api_test',
});

const fs = require('fs');
const readline = require('readline');

const TOKEN_PATH = 'token.json';
fs.readFile('credentials.json', (err:string, content: any) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    //authorize(JSON.parse(content), listEvents);
    authorize(JSON.parse(content), getEvents);
});

function authorize(credentials,callback){
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id,client_secret,redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH,(err:NodeJS.ErrnoException,token:object)=>{
        if (err) return getNewToken(oAuth2Client,callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}
function getNewToken(oAuth2Client,callback){
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question("Enter the code from that page here: ",(code:string)=>{
        rl.close();
        oAuth2Client.getToken(code,(err:Error,token:Credentials)=>{
            if (err) return console.error('Error retrieving access token',err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH,JSON.stringify(token),(err:Error)=>{
                if (err) return console.error(err);
                console.log('Token stored to',TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}



let tokenClient;
export async function getEvents() {
    const events = await calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        timeMax: (new Date(new Date().getTime() + 24 * 60 * 60 * 1000)).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    });
    return events
}
