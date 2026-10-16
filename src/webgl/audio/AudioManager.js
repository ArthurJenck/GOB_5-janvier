export default class AudioManager {
    constructor(options = {}) {
        this.kettleDelay = options.kettleDelay;

        this.context = new AudioContext();
        this.sounds = new Map();
        this.activeSounds = new Map();

        this.loadSfx('music', '/sounds/music.mp3');
        this.loadSfx('youWin', '/sounds/youWin.mp3');
        this.loadSfx('kettle', '/sounds/kettle.mp3');
        this.loadSfx('ding', '/sounds/ding.mp3');
    }

    startExperience() {
        this.playSfx('music');

        setTimeout(() => {
            this.playSfx('kettle', 0.5, 20);
        }, this.kettleDelay * 1000);
    }

    async loadSfx(slug, url) {
        const data = await fetch(url);
        if (!data.ok) return;
        const arrayBuffer = await data.arrayBuffer();
        await this.context.decodeAudioData(arrayBuffer, (buffer) => this.sounds.set(slug, buffer));

        return this.sounds;
    }

    async resume() {
        if (this.context.state !== 'running') await this.context.resume();
    }

    async playSfx(slug, volume = 1, fadeIn = 0) {
        const buffer = this.sounds.get(slug);
        if (!buffer) return;

        await this.resume();

        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();

        source.buffer = buffer;
        gainNode.gain.value = Math.max(0, Math.min(1, volume));

        if (fadeIn) {
            const start = this.context.currentTime;
            const end = start + fadeIn;

            gainNode.gain.linearRampToValueAtTime(0.01, start);
            gainNode.gain.linearRampToValueAtTime(1, end);
        }

        source.connect(gainNode);
        gainNode.connect(this.context.destination);

        const sources = this.activeSounds.get(slug) ?? new Set();
        sources.add(source);
        this.activeSounds.set(slug, sources);

        source.start();
    }

    stopSfx(slug) {
        const sources = this.activeSounds.get(slug);
        if (!sources) return;

        this.activeSounds.delete(slug);

        for (const source of sources) {
            source.stop();
        }
    }
}
