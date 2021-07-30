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
				new Audio('resources/click.wav'),
				new Audio('resources/click.wav'),
				new Audio('resources/click.wav'),
			],
			complete: [
				new Audio('resources/complete.wav'),
			],
			miss: [
				new Audio('resources/miss.wav'),
				new Audio('resources/miss.wav'),
				new Audio('resources/miss.wav'),
			],
			pop: [
				new Audio('resources/pop1.wav'),
				new Audio('resources/pop2.wav'),
				new Audio('resources/pop3.wav'),
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
