export const states = {
    intro: {
        domElement: '.intro-ui',
        onEnter: () => {},
        onLeave: () => {},
    },
    experience: {
        domElement: '.experience',
        onEnter: (app) => {
            const guiElement = document.querySelector('.tp-dfwv');
            if (guiElement) guiElement.style.display = 'block';

            app.experienceStarted = true;
            app.startExperience();
        },
        onLeave: (app) => {
            const guiElement = document.querySelector('.tp-dfwv');
            if (guiElement) guiElement.style.display = 'hidden';

            app.audioManager.stopSfx('music');
            app.audioManager.stopSfx('kettle');

            app.experienceStarted = false;
            app.stopExperience();
        },
    },
    ending: {
        domElement: '.ending',
        onEnter: async (app) => {
            app.audioManager.playSfx('ding');
        },
        onLeave: (app) => {
            app.startExperience();
        },
    },
};
