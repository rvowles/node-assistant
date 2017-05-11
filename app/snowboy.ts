import {Config} from './client-config';
import {EventEmitter} from 'events';
const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
import fs = require('fs');

export class SnowboyModel {
	public hotword: string;
	public file: string;

	constructor(init?:Partial<SnowboyModel>) {
		Object.assign(this, init);
	}
}

export class SnowboyHotword extends EventEmitter {
	private models = new Models();
	private detector;
	private mic;

	constructor(models: SnowboyModel[], private config: Config) {
		super();

		for (let mod of models) {
			this.models.add({
				file: mod.file,
				sensitivity: '0.5',
				hotwords: mod.hotword
			});
		}

		this.setup();
	}

	private setup() {
		this.detector = new Detector({
			resource: "resources/common.res",
			models: this.models,
			audioGain: 2.0
		});

		this.detector.on('silence', () => {
			this.config.debug('silence');
		});

		this.detector.on('sound', () => {
			this.config.debug('sound');
		});

		this.detector.on('error', () => {
			this.config.debug('error');
		});

		this.detector.on('hotword', (index, hotword) => {
			this.mic.unpipe();
			record.stop();

			this.config.debug('hotword', index, hotword);

			this.emit('hotword', hotword, index);

			process.nextTick(() => {
				this.detector.reset();
			});
		});
	}

	public start() {
		this.mic = record.start({
			threshold: 0,
			verbose: this.config.verbose,
			recordProgram: this.config.record.programme
		});

		this.mic.pipe(this.detector);

		console.log('waiting for hotword');
	}

}