

import AWS = require('aws-sdk');
import {Config} from './client-config';
import {EventEmitter} from 'events';
import {TextToSpeech} from './text-to-speech';

const Speaker = require('speaker');

export class AmazonPolly extends EventEmitter implements TextToSpeech {
	private polly;

	constructor(private config : Config) {
		super();
		
		// the shared ini profiles just don't work!
		AWS.config = new AWS.Config();
		AWS.config.accessKeyId = config.polly.accessKeyId;
		AWS.config.secretAccessKey = config.polly.secretAccessKey;

		this.polly = new AWS.Polly({
			signatureVersion: 'v4', region: config.polly.region
		});
	}

	public speak(text : string, callback: () => any) {
		console.log('asking polly for ', text);

		const speaker = new Speaker({
			channels: this.config.audio.channels,
			bitDepth: this.config.audio.sampleSizeInBits,
			sampleRate: this.config.audio.sampleRate
		});

		this.polly.synthesizeSpeech({
			Text: text,
			OutputFormat: 'pcm',
			VoiceId: this.config.polly.voiceId,
		}, (err, data) => {
			if (err) {
				speaker.close();
				callback();
			} else if (data.AudioStream instanceof Buffer) {
				// this means it doesn't crash on mac os x
				speaker._write(data.AudioStream, '', () => {
					setTimeout(() => {
						speaker.close();
						callback();
					}, 1000);
				});
			}
		});
	}
}