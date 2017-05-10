

import {HotwordConfig} from './client-config';

export interface BotInterface {
	process(hotword : HotwordConfig);
}