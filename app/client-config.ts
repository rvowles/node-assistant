
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

export class AmazonPollyConfig {
	public region : string;
	public voiceId : string;
	public accessKeyId : string;
	public secretAccessKey : string;
}

export class ApiAiConfig {
	public client_access_token : string;
	public latitude : number;
	public longitude : number;
	public timezone : string;
}

export enum HotwordType {
	ASSISTANT = <any>'ASSISTANT',
	CLOUD_SPEECH = <any>'CLOUD_SPEECH'
}

export class HotwordConfig {
	public hotwordFile : string;
	public soundFile : string;
	public name : string;
	public type : HotwordType;
	public apiAiConfig : ApiAiConfig;
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
	public polly : AmazonPollyConfig;
}