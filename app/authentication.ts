
import fs = require('fs');
import {Config} from './client-config';
import {EventEmitter} from 'events';
import readline = require('readline');
const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;

class Credentials {
	public access_token: string;
	public refresh_token: string;
	public token_type: string;
	public expiry_date: number;
}


export class Authentication extends EventEmitter {
	private oauth2Client;
	private credentials: Credentials;

	constructor(private config: Config) {
		super();

		const auth = this.config.authentication;

		if (!auth || !auth.clientId || !auth.clientSecret || auth.clientId == 'YOUR_CLIENT_ID' || auth.clientSecret === 'YOUR_CLIENT_SECRET') {
			throw new Error('You have not set up your client id and client secret in the config.json file');
		}

		if (!auth.codeRedirectUri) {
			auth.codeRedirectUri = 'urn:ietf:wg:oauth:2.0:oob';
		}

		if (!auth.googleOAuthEndpoint) {
			auth.googleOAuthEndpoint = 'https://www.googleapis.com/oauth2/v4/';
		}

		if (!auth.scope && !auth.scopes) {
			auth.scopes = ['https://www.googleapis.com/auth/assistant-sdk-prototype', 'https://www.googleapis.com/auth/cloud-platform'];
		} else if (!auth.scopes) {
			auth.scopes = [auth.scope];
		}

		if (!auth.urlGoogleAccount){
			auth.urlGoogleAccount = 'https://accounts.google.com/o/oauth2/v2/auth';
		}

		if (!auth.credentialsFilePath) {
			auth.credentialsFilePath = './credentials.json';
		}

		if (!auth.maxDelayBeforeRefresh) {
			auth.maxDelayBeforeRefresh = 300000;
		}

		this.oauth2Client = new OAuth2(
			auth.clientId,
			auth.clientSecret,
			auth.codeRedirectUri
		);

	}

	private saveCredentials(creds : Credentials) {
		this.oauth2Client.setCredentials(creds);
		this.credentials = creds;
		const file = fs.createWriteStream(this.config.authentication.credentialsFilePath);
		file.write(JSON.stringify(creds));
		file.end();
	}

	public loadCredentials() {
		const auth = this.config.authentication;

		console.log('trying to load credentials... ', auth.credentialsFilePath);
		
		if (fs.existsSync(auth.credentialsFilePath)) {
			this.credentials = <Credentials>require(auth.credentialsFilePath);
			this.oauth2Client.setCredentials(this.credentials);
		}

		if (!this.credentials || !this.credentials.access_token) {
			const url = this.oauth2Client.generateAuthUrl({
				access_type: 'offline',

				// whatever scopes they need, at least the Assistant one normally
				scope: auth.scopes
			});

			console.log('Please copy the below URL into your browser and paste in the reply');
			console.log(url);

			const codeReader = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
				terminal: false
			});

			codeReader.question('code: ', (code) => {
				if (!code) {
					process.exit(-1);
				}

				this.config.debug('using code ', code, 'to get tokens');

				this.oauth2Client.getToken(code, (err, tokens) => {
					// Now tokens contains an access_token and an optional refresh_token. Save them.
					console.log('got tokens %j', tokens);

					if (!err) {
						this.saveCredentials(<Credentials>tokens);
						this.emit('oauth-ready', this.oauth2Client);
					}
				});
			});
		} else {
			this.emit('oauth-ready', this.oauth2Client);
		}
	}

	public getClient() {
		return this.oauth2Client;
	}
}