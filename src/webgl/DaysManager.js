const REMAINING_DAYS = 81;

export default class DaysManager {
    constructor(options = {}) {
        this.ended = false;

        this.element = this.findHTMLElement();
        this.remaining = this.writeRemaining(REMAINING_DAYS);
    }

    findHTMLElement() {
        const element = document.querySelector('#countdown');
        return element;
    }

    writeRemaining(remaining) {
        this.element.textContent = remaining;
        return remaining;
    }

    startInterval() {
        return setInterval(() => {
            this.decrease();
        }, 1000);
    }

    stopInterval() {
        return clearInterval(this.interval);
    }

    decrease() {
        if (this.remaining <= 0) return (this.ended = true);

        this.remaining -= 1;
        this.writeRemaining(this.remaining);
    }
}
