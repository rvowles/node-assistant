
import {Config, HotwordConfig} from './client-config';
const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const Speaker = require('speaker');
import fs = require('fs');
import {EventEmitter} from 'events';

type HotwordMap = { [K in string]: HotwordConfig };

export class Hotword extends EventEmitter {
	private models = new Models();
	private detector;
	private matching : HotwordMap = {};
	private mic;

	constructor(private config: Config) {
		super();

		if (config.hotwords && config.hotwords.hotwordFiles && config.hotwords.hotwordFiles.length > 0) {
			this.configureModels(config.hotwords.hotwordFiles);
		} else if (config.hotwords && config.hotwords.hotwords && config.hotwords.hotwords.length > 0) {
			this.configureModelsWithSound(config.hotwords.hotwords);
		} else {
			console.error('Bad hotwords config %j', config.hotwords);
			throw new Error("Must have keywords defined");
		}

		this.setup();
	}

	private configureModels(hotwordFiles: string[]) {
		let counter = 0;

		for(let hotword of hotwordFiles) {
			console.log('adding hotword ', hotword);

			this.models.add({
				file: hotword,
				sensitivity: '0.5',
				hotwords : 'internal' + counter
			});

			counter ++;
		}
	}

	private configureModelsWithSound(hotwords: Array<HotwordConfig>) {
		hotwords.forEach((val, index) => {
			const name = 'internal' + index;

			console.log('adding hotword ', val.hotwordFile);

			this.models.add({
				file: val.hotwordFile,
				sensitivity: '0.5',
				hotwords : name
			});

			if (val.soundFile) {
				this.matching[name] = val;
			}
		});
	}


	private setup() {
		this.detector = new Detector({
			resource: "resources/common.res",
			models: this.models,
			audioGain: 2.0
		});

		this.detector.on('silence', function () {
			console.log('silence');
		});

		this.detector.on('sound', function () {
			console.log('sound');
		});

		this.detector.on('error', function () {
			console.log('error');
		});

		const self = this;

		this.detector.on('hotword', function (index, hotword) {
			self.mic.unpipe();
			record.stop();

			console.log('hotword', index, hotword);

			const match = self.matching[hotword];

			if (match && match.soundFile) {
				// we expect this criteria for sounds that play on trigger
				const speaker = new Speaker({
					channels: 1,
					bitDepth: 16,
					sampleRate: 16000
				});
				const sound = fs.createReadStream(match.soundFile);
				speaker.on('close', () => {
					self.emit('hotword', match, index);
				});

				sound.pipe(speaker);
			} else if (match) {
				self.emit('hotword', match, index);
			} else {
				self.emit('hotword');
			}

			process.nextTick(() => {
				self.detector.reset();
			});
		});
	}
	
	public start() {
		// this.setup();

		this.mic = record.start({
			threshold: 0,
			verbose: true
		});

		this.mic.pipe(this.detector);

		console.log('waiting for hotword');
	}

}




