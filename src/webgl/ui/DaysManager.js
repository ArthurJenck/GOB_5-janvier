const params = {
    startAt: 81,
};

export default class DaysManager {
    constructor(options = {}) {
        this.ended = false;

        this.debugger = options.debugger;

        this.debugFolder = this.createDebugFolder();

        this.element = this.findHTMLElement();
        this.remaining = this.writeRemaining(params.startAt);
    }

    findHTMLElement() {
        const element = document.querySelector('#countdown');
        return element;
    }

    writeRemaining(remaining) {
        this.element.textContent = remaining;
        return remaining;
    }

    start() {
        this.decrease();
        this.interval = setInterval(() => {
            this.decrease();
        }, 1000);
    }

    stop() {
        return clearInterval(this.interval);
    }

    reset() {
        this.stop();
        this.remaining = this.writeRemaining(params.startAt);
    }

    decrease() {
        if (this.remaining <= 0) return (this.ended = true);

        this.remaining -= 1;
        this.writeRemaining(this.remaining);
    }

    /**
     * Debug
     */
    createDebugFolder() {
        if (!this.debugger) return;

        const daysFolder = this.debugger.addFolder({ title: 'Days' });
        daysFolder.addButton({ title: 'Start' }).on('click', () => {
            this.start();
        });
        daysFolder.addButton({ title: 'Stop' }).on('click', () => {
            this.stop();
        });
        daysFolder.addButton({ title: 'Reset' }).on('click', () => {
            this.reset();
        });
        daysFolder.addBinding(params, 'startAt').on('change', () => {
            this.reset();
        });

        return daysFolder;
    }
}
