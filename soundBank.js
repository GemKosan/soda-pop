export const Sound = {
	CLICK: "click",
	COMPLETE: "complete",
	MISS: "miss",
	POP: "pop",
}

class SoundBank {
	constructor() {
		// multiple sounds on queue to allow concurrent playing
		this.sounds = {
			click: [
				new Howl({
					src: ['resources/click.mp3', 'resources/click.ogg'],
				}),
			],
			complete: [
				new Howl({
					src: ['resources/complete.mp3', 'resources/complete.ogg'],
				}),
			],
			miss: [
				new Howl({
					src: ['resources/missed.mp3', 'resources/missed.ogg'],
				}),
			],
			pop: [
				new Howl({
					src: ['resources/pop1.mp3', 'resources/pop1.ogg'],
				}),
				new Howl({
					src: ['resources/pop2.mp3', 'resources/pop2.ogg'],
				}),
				new Howl({
					src: ['resources/pop3.mp3', 'resources/pop3.ogg'],
				}),
			],
		}
	}

	play(key) {
		const variations = this.sounds[key];
		if (!variations) {
			return;
		}
		const sound = variations.shift();
		variations.push(sound);
		sound.play();
	}
}

export default SoundBank;
