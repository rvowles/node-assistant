

import {Config, HotwordConfig} from './client-config';
import {EventEmitter} from 'events';
import {BotInterface} from './bot-interface';

export class CloudSpeechOrchestrator extends EventEmitter implements BotInterface {
	constructor(private config: Config, private oauth2Client) {
		super();
	}

	process(hotword: HotwordConfig) {
	}
}