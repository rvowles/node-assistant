import {Config, RecordConfig} from './client-config';
import GoogleAuth = require('google-auth-library');
import {AssistantClient} from './assistant';
import {Hotword} from './hotword';
import {Authentication} from './authentication';
import fs = require('fs');
const debug = require('debug');

let allConfig;

if (process.env.VOICE_CONFIG) {
	allConfig = <Config>require(process.env.VOICE_CONFIG);
} else if (!fs.exists('./config.json')) {
	console.error('Cannot find config.json file, please specify full path in VOICE_CONFIG environment variable.');
	process.exit(-1);
} else {
	allConfig = <Config>require('./config.json');
}

allConfig.debug = debug('node-assistant');

if (process.env.DEBUG === 'node-assistant') {
	allConfig.verbose = true; // for other logging
}

if (!allConfig.record) {
	allConfig.record = new RecordConfig();
	allConfig.record.programme = 'rec';
}

const hotword = new Hotword(allConfig);

const auth = new Authentication(allConfig);

auth.on('oauth-ready', (oauth2Client) => {
	console.log('We have configured credentials, now listening for hotword.');

	const assistant = new AssistantClient(allConfig, oauth2Client);

	hotword.on('hotword', (match, index) => {
		process.nextTick(() => {
			allConfig.debug('assistant');
			assistant.requestAssistant();
		});
	});

	hotword.start();

	assistant.on('speaker-closed', () => {
		// we seem to get this callback slightly before the speaker has finished
		// which can cause it to be cut off
		setTimeout(() => {
			hotword.start();
		}, 500);
	});

	console.log('press enter to finish');
	process.stdin.resume();
	process.stdin.on('data', () => {
		 process.exit(0);
	});
});

auth.loadCredentials();
