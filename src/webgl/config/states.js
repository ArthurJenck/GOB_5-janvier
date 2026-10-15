export const states = {
    intro: {
        domElement: '.intro-ui',
        onEnter: () => {},
        onLeave: () => {},
    },
    experience: {
        domElement: '.experience',
        onEnter: (app) => {
            app.experienceStarted = true;
            app.startExperience();
        },
        onLeave: (app) => {
            app.experienceStarted = false;
            app.stopExperience();
        },
    },
    ending: {
        domElement: '.ending',
        onEnter: () => {},
        onLeave: () => {},
    },
};
