export default class OverlayManager {
    constructor(options = {}) {
        this.opacity = 0;
        this.elapsed = 0;
        this.active = false;
        this.overlayElement = this.createOverlay();
    }

    start() {
        this.elapsed = 0;
        this.active = true;
        this.updateGradientOpacity(0);
    }

    stop() {
        this.active = false;
        this.updateGradientOpacity(0);
    }

    tick(delta) {
        if (!this.active) return;

        this.elapsed += delta / 1000;
        this.updateGradientOpacity(Math.min(1, this.elapsed / 100));
    }

    createOverlay() {
        const overlayElement = document.createElement('span');
        overlayElement.classList.add('overlay');

        overlayElement.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 100%)`;
        document.querySelector('.experience').appendChild(overlayElement);

        return overlayElement;
    }

    updateGradientOpacity(opacity) {
        this.overlayElement.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, 0) 100%)`;
    }
}
