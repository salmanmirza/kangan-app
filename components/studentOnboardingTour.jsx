import React, { useEffect, useState } from 'react';
import Joyride from 'react-joyride';

export default function StudentOnboardingTour({ role, onFinish }) {
    const [run, setRun] = useState(false);

    useEffect(() => {
        const checkMount = () => {
            const profileEl = document.querySelector('.joyride-profile');
            const chatbotEl = document.querySelector('.joyride-chatbot');
            return profileEl && chatbotEl;
        };

        const waitForTargets = setInterval(() => {
            if (checkMount()) {
                clearInterval(waitForTargets);
                setRun(true);
            }
        }, 300); // check every 300ms

        return () => clearInterval(waitForTargets);
    }, []);



    const steps = [
        {
            target: '.joyride-profile',
            content: 'Access your profile, settings, and logout from here.',
            placement: 'left',
        },
        {
            target: '.joyride-dashboard-link',
            content: 'This is your dashboard. It shows an overview of your course activity.',
        },
        {
            target: '.joyride-courses-link',
            content: 'View your enrolled courses here.',
        },
        {
            target: '.joyride-assignments-link',
            content: 'Track and submit your assignments from this section.',
        },
        {
            target: '.joyride-submissions-link',
            content: 'Review your submissions and feedback here.',
        },

        {
            target: '.joyride-chatbot',
            content: 'Need help anytime? This assistant can answer your questions.',
            placement: 'top-end',
        },

    ];

    return (
        <Joyride
            run={run}
            steps={steps}
            continuous
            showSkipButton
            showProgress
            scrollToFirstStep
            styles={{
                options: { zIndex: 10000 }, tooltipContainer: {
                    textAlign: 'left',
                },
            }}
            callback={(data) => {
                const { status } = data;
                if (['finished', 'skipped'].includes(status)) {
                    setRun(false);
                    if (typeof onFinish === 'function') {
                        onFinish(); // Call back to parent to update localStorage and user state
                    }
                }
            }}
        />
    );
}
