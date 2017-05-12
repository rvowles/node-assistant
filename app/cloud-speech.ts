

import {Config, HotwordConfig, ApiAiConfig} from './client-config';
import {EventEmitter} from 'events';
import {BotInterface} from './bot-interface';
import grpc = require('grpc');
import fs = require('fs');
import request = require('request');
const record = require('node-record-lpcm16');
import {
	StreamingRecognizeResponse, StreamingRecognizeRequest,
	StreamingRecognitionConfig, RecognitionConfig
} from './google/cloud/speech/v1/cloud_speech_pb';
import AudioEncoding = RecognitionConfig.AudioEncoding;
import {Writable} from 'stream';
import {TextToSpeech} from './text-to-speech';
const SpeechClient = require('./google/cloud/speech/v1/cloud_speech_grpc_pb').SpeechClient;

let sessionId = 1;

export class CloudSpeechOrchestrator extends EventEmitter implements BotInterface {
	private speechClient : any;
	private callCreds : any;
	private finished : boolean;
	private context : any;
	private sessionId : string;
	private text : string;

	constructor(private config: Config, private oauth2Client, private tts : TextToSpeech) {
		super();

		this.setupCloudSpeechClient();

		this.callCreds = new grpc.Metadata();
	}

	private setupCloudSpeechClient() {
		const caCerts = fs.readFileSync('./ca.crt');
		const url = 'speech.googleapis.com';
		const sslCreds = grpc.credentials.createSsl(caCerts);
		const call_creds = grpc.credentials.createFromGoogleCredential(this.oauth2Client);

		this.speechClient = new SpeechClient(url,
			grpc.credentials.combineChannelCredentials(sslCreds, call_creds));

	}

	private speechResponse(data : StreamingRecognizeResponse) {
		if (data.hasError()) {
			console.log('error ', data.getError());
		}

		if (data.getSpeechEventType()) {
			console.log('event ', data.getSpeechEventType());
		}

		const results = data.getResultsList();

		let final = false;

		if (results && results.length > 0) {
			results.forEach(val => {
				console.log('stability: ', val.getStability());
				console.log('is final?: ', val.getIsFinal());
				final = final || val.getIsFinal();
				console.log('alternatives: ' );
				this.text = null;
				val.getAlternativesList().forEach(alt => {
					if (!this.text) {
						this.text = alt.getTranscript();
					}

					console.log(" -- ", alt.getTranscript(), " (confidence " + alt.getConfidence() + ")");
				})
			});
		}

		if (final && !this.finished) {
			this.finished = true;
			this.emit('end');
		}
	}

	private createAudioConfig() : StreamingRecognizeRequest {
		const req = new RecognitionConfig();

		req.setEncoding(AudioEncoding.LINEAR16);
		req.setSampleRateHertz(16000);
		req.setLanguageCode('en');

		const config = new StreamingRecognitionConfig();

		config.setInterimResults(false);
		config.setSingleUtterance(true);
		config.setConfig(req);

		const srr = new StreamingRecognizeRequest();
		srr.setStreamingConfig(config);

		return srr;
	}

	private setupConversationAudioRequestStream(converseStream: Writable) : Writable {
		const audioPipe = new Writable();
		const size = this.config.assistant.chunkSize;

		audioPipe._write = (chunk, enc, next) => {
			if (this.finished) {
				return;
			}
			this.config.debug('audio');

			if (!chunk.length) {
				this.config.debug('ignoring');
				return;
			}

			const parts = Math.ceil(chunk.length / size);

			for(let count = 0; count < parts; count ++) {
				const converseRequest = new StreamingRecognizeRequest();
				const end = ((count+1) * size) > chunk.length ? chunk.length : ((count+1) * size);
				const bit = new Uint8Array(chunk.slice(count * size, end));

				converseRequest.setAudioContent(bit);
				try {
					converseStream.write(converseRequest);
				} catch (err) {
					console.error(err);
				}
			}

			next();
		};

		audioPipe.on('end', () => {
			this.config.debug('end of audio');
			converseStream.end();
		});

		return audioPipe;
	}
	
	private setupCloudSpeechStream() {
		const options = {};
		const writer = this.speechClient.streamingRecognize(this.callCreds, options);

		writer.on('data', (data : StreamingRecognizeResponse) => {
			this.speechResponse(data);
		});

		writer.on('end', (err) => {
			if (err) {
				this.config.debug('failed ', err);
			} else if (!this.finished) {
				this.finished = true;
				// this.speaker.setSpeakerFinished(true);
				this.config.debug('finished ');
				this.emit('end');
			}
		});

		this.config.debug('write audio config');
		writer.write(this.createAudioConfig());
		return writer;
	}

	private apiAi(apiConfig : ApiAiConfig, text : string) {
		if (!this.context) {
			this.context = [];
		}
		if (!this.sessionId) {
			this.sessionId = sessionId.toString();
			sessionId ++;
		}

		const messageBody = <any>{
			query: text,
			contexts: this.context,
			sessionId: this.sessionId,
			lang: 'en'
		};

		if (apiConfig.timezone) {
			messageBody.timezone = apiConfig.timezone;
		}

		if (apiConfig.latitude && apiConfig.longitude) {
			messageBody.location = {longitude: apiConfig.longitude, latitude: apiConfig.latitude};
		}

		const options = {
			method: 'POST',
			url: 'https://api.api.ai/v1/query?v=20150910',
			auth: {
				bearer: apiConfig.client_access_token
			},
			json: true,
			body: messageBody
		};

		console.log('making request');
		request(options, (err, resp, respBody) => {
			if (err) {
				console.log('failed ', err);
				this.emit('bot-complete');
			} else {
				if (respBody.status && respBody.status.code === 200) {
					this.context = respBody.result.contexts;
					const text = respBody.result.fulfillment.speech || respBody.result.fulfillment.displayText;

					console.log('text is ', text, this.tts == null);

					if (this.tts) {
						this.tts.speak(text, () => {
							this.emit('bot-complete');
						});
					}  else {
						this.emit('bot-complete');
					}
				}
			}

			// this oculd cause a loop of polly says the hotword
			this.emit('bot-complete');
		});
	}

	process(hotword: HotwordConfig) {
		this.finished = false;

		const converseStream = this.setupCloudSpeechStream();
		const audioRequestStream = this.setupConversationAudioRequestStream(converseStream);

		console.log('starting cloud speech');
		const audio = record.start({verbose: this.config.verbose, threshold: 0, silence: '10.0', recordProgram: this.config.record.programme});
		audio.on('end', () => {
			this.config.debug('closing conversation');
			record.stop();
			converseStream.end();
		});

		this.on('end', () => {
			this.config.debug('final utterance');
			record.stop();
			converseStream.end();
			
			if (this.text === 'shutdown') {
				process.exit(0);
			}

			if (hotword.apiAiConfig) {
				this.apiAi(hotword.apiAiConfig, this.text);
			} else {
				this.emit('bot-complete');
			}
		});

		audio.pipe(audioRequestStream);
	}
}
