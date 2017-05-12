import {Config, RecordConfig, HotwordType} from './client-config';
import GoogleAuth = require('google-auth-library');
import {Hotword} from './hotword';
import {Authentication} from './authentication';
import fs = require('fs');
import {SnowboyHotword, SnowboyModel} from './snowboy';
import {AmazonPolly} from './polly';
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

const polly = allConfig.polly ? new AmazonPolly(allConfig) : null;

const hotword = new Hotword(allConfig, polly);

// now make the model to match the hotwords with snowboy
const snowboyModel = [];
hotword.getHotwords().forEach(val => {
	const model = new SnowboyModel({hotword: val.key, file: val.config.hotwordFile});
	snowboyModel.push(model);
});

const snowboy = new SnowboyHotword(snowboyModel, allConfig);
snowboy.on('hotword', (word, index) => {
	hotword.hotwordDetected(word, index);
});

const auth = new Authentication(allConfig);


auth.on('oauth-ready', (oauth2Client) => {
	console.log('We have configured credentials, now listening for hotword.');

	// create the clients for each hotword
	hotword.configureHotwords(oauth2Client);

	hotword.on('hotword-complete', () => {
		snowboy.start();
	});

	snowboy.start();

	console.log('press enter to finish');
	process.stdin.resume();
	process.stdin.on('data', () => {
		 process.exit(0);
	});
});

auth.loadCredentials();
