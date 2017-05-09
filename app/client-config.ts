
export class AuthenticationConfig {
	public clientId: string;
	public clientSecret: string;
	// one or other
	public scope: string;
	public scopes: string[];
	public codeRedirectUri: string;
	public googleOAuthEndpoint: string;
	public urlGoogleAccount: string;
	public credentialsFilePath: string;
	public maxDelayBeforeRefresh: number;
}

export class HotwordConfig {
	public hotwordFile : string;
	public soundFile : string;
	public name : string;
}

export class HotwordsConfig {
	public hotwordFiles : string[];
	public hotwords : Array<HotwordConfig>;
}

export class AssistantConfig {
	public assistantApiEndpoint : string;
	public audioSampleRate : number;
	public chunkSize : number;
	public volumePercent : number;
}

export class AudioConfig {
	public sampleRate : number;
	public sampleSizeInBits : number;
	public channels : number;
}

export class RecordConfig {
	public programme : string;
}

export class Config {
	public debug : any; // comes from index.ts
	public verbose : boolean;
	public authentication: AuthenticationConfig;
	public assistant : AssistantConfig;
	public audio : AudioConfig;
	public record : RecordConfig;
	public hotwords : HotwordsConfig;
}