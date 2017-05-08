
const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const readline = require('readline');
const fs = require('fs');
const Speaker = require('speaker');

const codeReader = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

const models = new Models();

let mic;

models.add({
	file: 'resources/new_world.pmdl',
	sensitivity: '0.5',
	hotwords : 'snowboy'
});

const detector = new Detector({
	resource: "resources/common.res",
	models: models,
	audioGain: 2.0
});

detector.on('silence', function () {
	console.log('silence');
});

detector.on('sound', function () {
	console.log('sound');
});

detector.on('error', function () {
	console.log('error');
});

detector.on('hotword', function (index, hotword) {
	mic.unpipe();
	record.stop();
	console.log('hotword', index, hotword);

	const speaker = new Speaker({
		channels: 1,
		bitDepth: 16,
		sampleRate: 16000
	});
	const sound = fs.readFileSync('resources/ding.wav', {encoding: 'binary'});
	speaker.on('close', () => {
		codeReader.question('code: ', (code) => {

			setTimeout(() => {
				"use strict";
				mic = record.start({
					threshold: 0,
					verbose: true
				});

				mic.pipe(detector);
			}, 500);


		});
	});

	sound.pipe(speaker);
});

codeReader.question('code: ', (code) => {

	mic = record.start({
		threshold: 0,
		verbose: true
	});

	mic.pipe(detector);


});

console.log('press enter to finish');
process.stdin.resume();
process.stdin.on('data', () => {
	// process.exit(0);
});


	