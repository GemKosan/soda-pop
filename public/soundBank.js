export const Sound = {
  POP: "pop",
}

class SoundBank {
	constructor() {
		this.sounds = {
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
