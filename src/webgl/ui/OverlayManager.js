export default class OverlayManager {
    constructor(options = {}) {
        this.opacity = 0;
        this.overlayElement = this.createOverlay();
    }

    tick(elasped) {
        const opacity = elasped / (60 * 100);
        this.updateGradientOpacity(opacity);
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
