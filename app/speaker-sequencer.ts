
import {AudioConfig, Config} from './client-config';
import {EventEmitter} from 'events';
const Speaker = require('speaker');

export class SpeakerSequencer extends EventEmitter {
	private speaker;
	private speakerData = [];
	private dataActive = false;
	private finishedInput = false;

	constructor(private config : Config) {
		super();

		if (!config.audio) {
			config.audio = new AudioConfig();
		}

		const audio = config.audio;

		if (!audio.sampleRate) {
			audio.sampleRate = 16000;
		}

		if (!audio.sampleSizeInBits) {
			audio.sampleSizeInBits = 16;
		}

		if (!audio.channels) {
			audio.channels = 1;
		}

		this.speaker = new Speaker({
			channels: audio.channels,
			bitDepth: audio.sampleSizeInBits,
			sampleRate: audio.sampleRate
		});
	}
	
	public setSpeakerFinished(finished: boolean) {
		this.finishedInput = finished;
	}

	private speakerDone(err) {
		if (!err) {
			if (this.speakerData.length > 0) {
				this.dataActive = true;
				const data = this.speakerData[0];
				this.speakerData = this.speakerData.slice(1);

				// yes, recursive
				// console.log('speaker writing - ', this.dataActive);
				this.speaker._write(data, '', (err) => {
					// console.log('speaker done');

					this.speakerDone(err);
				});
			} else {
				this.dataActive = false;
			}
		} else {
			this.dataActive = false;
		}

		if (!this.dataActive && this.finishedInput) {
			this.emit('speaker-closed');
			this.speaker.close();
		}
	}

	public speakerWrite(data) {
		if (this.finishedInput) {
			return;
		}
		
		// console.log('speaker data - active?', this.dataActive, data.length);
		this.speakerData.push(data);

		if (!this.dataActive) {
			this.speakerDone(null);
		}
	}
}
