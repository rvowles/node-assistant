// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
'use strict';
var grpc = require('grpc');
var google_assistant_embedded_v1alpha1_embedded_assistant_pb = require('../../../../google/assistant/embedded/v1alpha1/embedded_assistant_pb.js');
var google_api_annotations_pb = require('../../../../google/api/annotations_pb.js');
var google_rpc_status_pb = require('../../../../google/rpc/status_pb.js');

function serialize_google_assistant_embedded_v1alpha1_ConverseRequest(arg) {
  if (!(arg instanceof google_assistant_embedded_v1alpha1_embedded_assistant_pb.ConverseRequest)) {
    throw new Error('Expected argument of type google.assistant.embedded.v1alpha1.ConverseRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_google_assistant_embedded_v1alpha1_ConverseRequest(buffer_arg) {
  return google_assistant_embedded_v1alpha1_embedded_assistant_pb.ConverseRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_google_assistant_embedded_v1alpha1_ConverseResponse(arg) {
  if (!(arg instanceof google_assistant_embedded_v1alpha1_embedded_assistant_pb.ConverseResponse)) {
    throw new Error('Expected argument of type google.assistant.embedded.v1alpha1.ConverseResponse');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_google_assistant_embedded_v1alpha1_ConverseResponse(buffer_arg) {
  return google_assistant_embedded_v1alpha1_embedded_assistant_pb.ConverseResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


// Service that implements Google Assistant API.
var EmbeddedAssistantService = exports.EmbeddedAssistantService = {
  // Initiates or continues a conversation with the embedded assistant service.
  // Each call performs one round-trip, sending an audio request to the service
  // and receiving the audio response. Uses bidirectional streaming to receive
  // results, such as the `END_OF_UTTERANCE` event, while sending audio.
  //
  // A conversation is one or more gRPC connections, each consisting of several
  // streamed requests and responses.
  // For example, the user says *Add to my shopping list* and the assistant
  // responds *What do you want to add?*. The sequence of streamed requests and
  // responses in the first gRPC message could be:
  //
  // *   ConverseRequest.config
  // *   ConverseRequest.audio_in
  // *   ConverseRequest.audio_in
  // *   ConverseRequest.audio_in
  // *   ConverseRequest.audio_in
  // *   ConverseResponse.event_type.END_OF_UTTERANCE
  // *   ConverseResponse.result.microphone_mode.DIALOG_FOLLOW_ON
  // *   ConverseResponse.audio_out
  // *   ConverseResponse.audio_out
  // *   ConverseResponse.audio_out
  //
  // The user then says *bagels* and the assistant responds
  // *OK, I've added bagels to your shopping list*. This is sent as another gRPC
  // connection call to the `Converse` method, again with streamed requests and
  // responses, such as:
  //
  // *   ConverseRequest.config
  // *   ConverseRequest.audio_in
  // *   ConverseRequest.audio_in
  // *   ConverseRequest.audio_in
  // *   ConverseResponse.event_type.END_OF_UTTERANCE
  // *   ConverseResponse.result.microphone_mode.CLOSE_MICROPHONE
  // *   ConverseResponse.audio_out
  // *   ConverseResponse.audio_out
  // *   ConverseResponse.audio_out
  // *   ConverseResponse.audio_out
  //
  // Although the precise order of responses is not guaranteed, sequential
  // ConverseResponse.audio_out messages will always contain sequential portions
  // of audio.
  converse: {
    path: '/google.assistant.embedded.v1alpha1.EmbeddedAssistant/Converse',
    requestStream: true,
    responseStream: true,
    requestType: google_assistant_embedded_v1alpha1_embedded_assistant_pb.ConverseRequest,
    responseType: google_assistant_embedded_v1alpha1_embedded_assistant_pb.ConverseResponse,
    requestSerialize: serialize_google_assistant_embedded_v1alpha1_ConverseRequest,
    requestDeserialize: deserialize_google_assistant_embedded_v1alpha1_ConverseRequest,
    responseSerialize: serialize_google_assistant_embedded_v1alpha1_ConverseResponse,
    responseDeserialize: deserialize_google_assistant_embedded_v1alpha1_ConverseResponse,
  },
};

exports.EmbeddedAssistantClient = grpc.makeGenericClientConstructor(EmbeddedAssistantService);
