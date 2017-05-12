
import {Writable} from 'stream';
const record = require('node-record-lpcm16');
import grpc = require('grpc');
const EmbeddedAssistantClient = require('./google/assistant/embedded/v1alpha1/embedded_assistant_grpc_pb').EmbeddedAssistantClient;
import fs = require('fs');
import {Config, AssistantConfig, HotwordConfig} from './client-config';

import {
	AudioInConfig, AudioOutConfig, ConverseState,
	ConverseConfig, ConverseRequest, ConverseResponse
} from './google/assistant/embedded/v1alpha1/embedded_assistant_pb';
import {SpeakerSequencer} from './speaker-sequencer';
import {EventEmitter} from 'events';
import {BotInterface} from './bot-interface';


export class AssistantClient extends EventEmitter implements BotInterface{
	private currentConversationState: Uint8Array;
	private callCreds;
	private assistant;
	private speaker : SpeakerSequencer;
	private finished : boolean;

	constructor( private config: Config, private oauth2Client ) {
		super();
		
		this.callCreds = new grpc.Metadata();

		this.setupAssistant();

		this.finished = false;
	}

	private setupAssistant() {
		// this file actually comes from node_modules/grpc/etc/roots.pem
		const caCerts = fs.readFileSync('./ca.crt');

		if (!this.config.assistant) {
			this.config.assistant = new AssistantConfig();
		}

		const assistantConfig = this.config.assistant;

		if (!assistantConfig.assistantApiEndpoint) {
			assistantConfig.assistantApiEndpoint = 'embeddedassistant.googleapis.com';
		}

		if (!assistantConfig.audioSampleRate) {
			assistantConfig.audioSampleRate = 16000;
		}

		if (!assistantConfig.chunkSize) {
			assistantConfig.chunkSize = 6400;
		}

		if (!assistantConfig.volumePercent) {
			assistantConfig.volumePercent = 80;
		}

		const sslCreds = grpc.credentials.createSsl(caCerts);
		const call_creds = grpc.credentials.createFromGoogleCredential(this.oauth2Client);

		this.assistant = new EmbeddedAssistantClient(assistantConfig.assistantApiEndpoint,
			grpc.credentials.combineChannelCredentials(sslCreds, call_creds) );
	}

	private createAudioConfig() : ConverseRequest {
		const audioInConfig = new AudioInConfig();
		audioInConfig.setEncoding(AudioInConfig.Encoding.LINEAR16);
		audioInConfig.setSampleRateHertz(this.config.assistant.audioSampleRate);

		const audioOutConfig = new AudioOutConfig();
		audioOutConfig.setSampleRateHertz(this.config.assistant.audioSampleRate);
		audioOutConfig.setEncoding(AudioOutConfig.Encoding.LINEAR16);
		audioOutConfig.setVolumePercentage(80);

		const converseConfig = new ConverseConfig();
		converseConfig.setAudioInConfig(audioInConfig);
		converseConfig.setAudioOutConfig(audioOutConfig);

		if (this.currentConversationState) {
			const converseState = new ConverseState();
			converseState.setConversationState(this.currentConversationState);
			converseConfig.setConverseState(converseState);
		}

		const converseRequest = new ConverseRequest();
		converseRequest.setConfig(converseConfig);

		return converseRequest;
	}

	private converseResponse(resp: ConverseResponse) {
		if (resp.hasEventType()) {
			console.log('event', resp.getEventType());

			if (resp.getEventType() === ConverseResponse.EventType.END_OF_UTTERANCE) {
				console.log('end of utterance');
				record.stop();
			}

			this.emit('event', resp.getEventType());
		}

		if (resp.hasAudioOut()) {
			this.speaker.speakerWrite(resp.getAudioOut().getAudioData());
		}

		if (resp.hasError()) {
			const error = resp.getError();
			console.log('ERROR ', error.getMessage());
			console.log('code: ', error.getCode());
			console.log('failures: ', error.getDetailsList());
			this.emit('error', error);
		}

		if (resp.hasResult()) {
			const result = resp.getResult();

			console.log('request text', result.getSpokenRequestText());
			this.emit('request-text', result.getSpokenRequestText());
			console.log('response text', result.getSpokenResponseText());
			console.log('microphone mode', result.getMicrophoneMode());
			// console.log('conversation state', result.getConversationState());
			console.log('volume ', result.getVolumePercentage());
			this.emit('result', result);
		}

		if (!resp.hasEventType() && !resp.hasAudioOut() && !resp.hasError() && !resp.hasResult()) {
			console.log('unknown packet', resp);
		}
	}

	private setupConversationAudioRequestStream(converseStream: Writable) : Writable {
		const audioPipe = new Writable();
		const size = this.config.assistant.chunkSize;
		
		audioPipe._write = (chunk, enc, next) => {
			this.config.debug('audio');
			
			if (!chunk.length) {
				this.config.debug('ignoring');
				return;
			}

			const parts = Math.ceil(chunk.length / size);

			for(let count = 0; count < parts; count ++) {
				const converseRequest = new ConverseRequest();
				const end = ((count+1) * size) > chunk.length ? chunk.length : ((count+1) * size);
				const bit = new Uint8Array(chunk.slice(count * size, end));

				// console.log(bit.length);
				converseRequest.setAudioIn(bit);
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

	private setupConversationStream(): Writable {
		const options = {};
		const writer = this.assistant.converse(this.callCreds, options);

		writer.on('data', (data : ConverseResponse) => {
			this.converseResponse(data);
		});
		
		writer.on('end', (err) => {
			if (err) {
				this.config.debug('failed ', err);
			} else {
				this.finished = true;
				this.speaker.setSpeakerFinished(true);
				this.config.debug('finished ');
				this.emit('end');
			}
		});

		this.config.debug('write audio config');
		writer.write(this.createAudioConfig());
		return writer;
	}

	public process(hotword : HotwordConfig) {
		const converseStream = this.setupConversationStream();
		const audioRequestStream = this.setupConversationAudioRequestStream(converseStream);

		this.speaker = new SpeakerSequencer(this.config);

		// propagate this out
		this.speaker.on('speaker-closed', () => {
			this.emit('bot-complete');
		});

		console.log('starting assistant');
		const audio = record.start({verbose: this.config.verbose, recordProgram: this.config.record.programme});

		audio.on('end', () => {
			this.config.debug('closing conversation');
			record.stop();
			converseStream.end();
		});

		audio.pipe(audioRequestStream);
	}
}