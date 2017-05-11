
import {Config, HotwordConfig, HotwordType} from './client-config';
const Speaker = require('speaker');
import fs = require('fs');
import {EventEmitter} from 'events';
import {BotInterface} from './bot-interface';
import {CloudSpeechOrchestrator} from './cloud-speech';
import {AssistantClient} from './assistant';

type HotwordMap = { [K in string]: HotwordConfig };
type HotwordBot = { [Z in string]: BotInterface };

export class HotwordKey {
	public config : HotwordConfig;
	public key : string;

	constructor(init?:Partial<HotwordKey>) {
		Object.assign(this, init);
	}
}

export class Hotword extends EventEmitter {
	private matching : HotwordMap = {};
	private bots : HotwordBot = {};
	private counter : number;

	constructor(private config: Config) {
		super();

		if (config.hotwords && config.hotwords.hotwordFiles && config.hotwords.hotwordFiles.length > 0) {
			this.configureModels(config.hotwords.hotwordFiles);
		} else if (config.hotwords && config.hotwords.hotwords && config.hotwords.hotwords.length > 0) {
			this.configureModelsWithSound(config.hotwords.hotwords);
		} else {
			this.config.debug('Bad hotwords config %j', config.hotwords);
			throw new Error("Must have keywords defined");
		}
	}

	public getHotwords() : Array<HotwordKey> {
		// oh for Object.values
		const hotwords = [];

		for(let key of Object.keys(this.matching)) {
			hotwords.push(new HotwordKey({config:this.matching[key], key:key}));
		}

		return hotwords;
	}

	private configureModels(hotwordFiles: string[]) {
		for(let hotword of hotwordFiles) {
			this.config.debug('adding hotword ', hotword);

			const keyName = 'internal' + this.counter;

			const c = new HotwordConfig();
			c.type = HotwordType.ASSISTANT;
			c.name = keyName;

			this.matching[keyName] = c;

			this.counter ++;
		}
	}

	private configureModelsWithSound(hotwords: Array<HotwordConfig>) {
		hotwords.forEach((val, index) => {

			console.log('registering ', val);

			const name = 'internal' + index;

			this.config.debug('adding hotword ', val.hotwordFile);

			this.matching[name] = val;
		});
	}

	public hotwordDetected(hotword, index) {
		const match = this.matching[hotword];

		if (match && match.soundFile) {
			// we expect this criteria for sounds that play on trigger
			const speaker = new Speaker({
				channels: 1,
				bitDepth: 16,
				sampleRate: 16000
			});
			const sound = fs.createReadStream(match.soundFile);
			speaker.on('close', () => {
				this.dispatch(match, hotword);
			});

			sound.pipe(speaker);
		} else if (match) {
			this.dispatch(match, hotword);
		} else {
			this.dispatch(new HotwordConfig(), hotword);
		}
	}

	private dispatch(match : HotwordConfig, hotword : string) {
		process.nextTick(() => {
			this.bots[hotword].process(match);
		});
	}
	
	public configureHotwords(oauth2Client) {
		for(let key of Object.keys(this.matching)) {
			let newBot : BotInterface;
			let ee : EventEmitter;

			console.log('key ', key, this.matching[key], this.matching[key].type === HotwordType.CLOUD_SPEECH);
			if (this.matching[key].type === HotwordType.CLOUD_SPEECH) {
				newBot = ee = new CloudSpeechOrchestrator(this.config, oauth2Client);
			} else {
				newBot = ee = new AssistantClient(this.config, oauth2Client);
			}

			this.bots[key] = newBot;

			ee.on('bot-complete', () => {
				setTimeout(() => {
					this.emit('hotword-complete');
				}, 500);
			});
		}
	}
}




