// package: google.assistant.embedded.v1alpha1
// file: google/assistant/embedded/v1alpha1/embedded_assistant.proto

import * as jspb from "google-protobuf";
import * as google_api_annotations_pb from "../../../../google/api/annotations_pb";
import * as google_rpc_status_pb from "../../../../google/rpc/status_pb";

export class ConverseConfig extends jspb.Message {
  hasAudioInConfig(): boolean;
  clearAudioInConfig(): void;
  getAudioInConfig(): AudioInConfig | undefined;
  setAudioInConfig(value?: AudioInConfig): void;

  hasAudioOutConfig(): boolean;
  clearAudioOutConfig(): void;
  getAudioOutConfig(): AudioOutConfig | undefined;
  setAudioOutConfig(value?: AudioOutConfig): void;

  hasConverseState(): boolean;
  clearConverseState(): void;
  getConverseState(): ConverseState | undefined;
  setConverseState(value?: ConverseState): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConverseConfig.AsObject;
  static toObject(includeInstance: boolean, msg: ConverseConfig): ConverseConfig.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConverseConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConverseConfig;
  static deserializeBinaryFromReader(message: ConverseConfig, reader: jspb.BinaryReader): ConverseConfig;
}

export namespace ConverseConfig {
  export type AsObject = {
    audioInConfig?: AudioInConfig.AsObject,
    audioOutConfig?: AudioOutConfig.AsObject,
    converseState?: ConverseState.AsObject,
  }
}

export class AudioInConfig extends jspb.Message {
  getEncoding(): AudioInConfig.Encoding;
  setEncoding(value: AudioInConfig.Encoding): void;

  getSampleRateHertz(): number;
  setSampleRateHertz(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AudioInConfig.AsObject;
  static toObject(includeInstance: boolean, msg: AudioInConfig): AudioInConfig.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AudioInConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AudioInConfig;
  static deserializeBinaryFromReader(message: AudioInConfig, reader: jspb.BinaryReader): AudioInConfig;
}

export namespace AudioInConfig {
  export type AsObject = {
    encoding: AudioInConfig.Encoding,
    sampleRateHertz: number,
  }

  export enum Encoding {
    ENCODING_UNSPECIFIED = 0,
    LINEAR16 = 1,
    FLAC = 2,
  }
}

export class AudioOutConfig extends jspb.Message {
  getEncoding(): AudioOutConfig.Encoding;
  setEncoding(value: AudioOutConfig.Encoding): void;

  getSampleRateHertz(): number;
  setSampleRateHertz(value: number): void;

  getVolumePercentage(): number;
  setVolumePercentage(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AudioOutConfig.AsObject;
  static toObject(includeInstance: boolean, msg: AudioOutConfig): AudioOutConfig.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AudioOutConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AudioOutConfig;
  static deserializeBinaryFromReader(message: AudioOutConfig, reader: jspb.BinaryReader): AudioOutConfig;
}

export namespace AudioOutConfig {
  export type AsObject = {
    encoding: AudioOutConfig.Encoding,
    sampleRateHertz: number,
    volumePercentage: number,
  }

  export enum Encoding {
    ENCODING_UNSPECIFIED = 0,
    LINEAR16 = 1,
    MP3 = 2,
    OPUS_IN_OGG = 3,
  }
}

export class ConverseState extends jspb.Message {
  getConversationState(): Uint8Array | string;
  getConversationState_asU8(): Uint8Array;
  getConversationState_asB64(): string;
  setConversationState(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConverseState.AsObject;
  static toObject(includeInstance: boolean, msg: ConverseState): ConverseState.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConverseState, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConverseState;
  static deserializeBinaryFromReader(message: ConverseState, reader: jspb.BinaryReader): ConverseState;
}

export namespace ConverseState {
  export type AsObject = {
    conversationState: Uint8Array | string,
  }
}

export class AudioOut extends jspb.Message {
  getAudioData(): Uint8Array | string;
  getAudioData_asU8(): Uint8Array;
  getAudioData_asB64(): string;
  setAudioData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AudioOut.AsObject;
  static toObject(includeInstance: boolean, msg: AudioOut): AudioOut.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AudioOut, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AudioOut;
  static deserializeBinaryFromReader(message: AudioOut, reader: jspb.BinaryReader): AudioOut;
}

export namespace AudioOut {
  export type AsObject = {
    audioData: Uint8Array | string,
  }
}

export class ConverseResult extends jspb.Message {
  getSpokenRequestText(): string;
  setSpokenRequestText(value: string): void;

  getSpokenResponseText(): string;
  setSpokenResponseText(value: string): void;

  getConversationState(): Uint8Array | string;
  getConversationState_asU8(): Uint8Array;
  getConversationState_asB64(): string;
  setConversationState(value: Uint8Array | string): void;

  getMicrophoneMode(): ConverseResult.MicrophoneMode;
  setMicrophoneMode(value: ConverseResult.MicrophoneMode): void;

  getVolumePercentage(): number;
  setVolumePercentage(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConverseResult.AsObject;
  static toObject(includeInstance: boolean, msg: ConverseResult): ConverseResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConverseResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConverseResult;
  static deserializeBinaryFromReader(message: ConverseResult, reader: jspb.BinaryReader): ConverseResult;
}

export namespace ConverseResult {
  export type AsObject = {
    spokenRequestText: string,
    spokenResponseText: string,
    conversationState: Uint8Array | string,
    microphoneMode: ConverseResult.MicrophoneMode,
    volumePercentage: number,
  }

  export enum MicrophoneMode {
    MICROPHONE_MODE_UNSPECIFIED = 0,
    CLOSE_MICROPHONE = 1,
    DIALOG_FOLLOW_ON = 2,
  }
}

export class ConverseRequest extends jspb.Message {
  hasConfig(): boolean;
  clearConfig(): void;
  getConfig(): ConverseConfig | undefined;
  setConfig(value?: ConverseConfig): void;

  hasAudioIn(): boolean;
  clearAudioIn(): void;
  getAudioIn(): Uint8Array | string;
  getAudioIn_asU8(): Uint8Array;
  getAudioIn_asB64(): string;
  setAudioIn(value: Uint8Array | string): void;

  getConverseRequestCase(): ConverseRequest.ConverseRequestCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConverseRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ConverseRequest): ConverseRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConverseRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConverseRequest;
  static deserializeBinaryFromReader(message: ConverseRequest, reader: jspb.BinaryReader): ConverseRequest;
}

export namespace ConverseRequest {
  export type AsObject = {
    config?: ConverseConfig.AsObject,
    audioIn: Uint8Array | string,
  }

  export enum ConverseRequestCase {
    CONVERSE_REQUEST_NOT_SET = 0,
    CONFIG = 1,
    AUDIO_IN = 2,
  }
}

export class ConverseResponse extends jspb.Message {
  hasError(): boolean;
  clearError(): void;
  getError(): google_rpc_status_pb.Status | undefined;
  setError(value?: google_rpc_status_pb.Status): void;

  hasEventType(): boolean;
  clearEventType(): void;
  getEventType(): ConverseResponse.EventType;
  setEventType(value: ConverseResponse.EventType): void;

  hasAudioOut(): boolean;
  clearAudioOut(): void;
  getAudioOut(): AudioOut | undefined;
  setAudioOut(value?: AudioOut): void;

  hasResult(): boolean;
  clearResult(): void;
  getResult(): ConverseResult | undefined;
  setResult(value?: ConverseResult): void;

  getConverseResponseCase(): ConverseResponse.ConverseResponseCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConverseResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ConverseResponse): ConverseResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConverseResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConverseResponse;
  static deserializeBinaryFromReader(message: ConverseResponse, reader: jspb.BinaryReader): ConverseResponse;
}

export namespace ConverseResponse {
  export type AsObject = {
    error?: google_rpc_status_pb.Status.AsObject,
    eventType: ConverseResponse.EventType,
    audioOut?: AudioOut.AsObject,
    result?: ConverseResult.AsObject,
  }

  export enum EventType {
    EVENT_TYPE_UNSPECIFIED = 0,
    END_OF_UTTERANCE = 1,
  }

  export enum ConverseResponseCase {
    CONVERSE_RESPONSE_NOT_SET = 0,
    ERROR = 1,
    EVENT_TYPE = 2,
    AUDIO_OUT = 3,
    RESULT = 5,
  }
}

