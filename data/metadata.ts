export const metadata = {
    // Displays name and used across SEO metadata platform labels, and generated examples
    name: 'Aion',

    /**
     * Public contact information. Update this once, and components that need author contact
     * Information can reuse the same source of truth
     */
    email: 'idokodavid698@gmail.com',

    /**
     * General location used in profile/resume-style examples. This is not used for routing or localization.
     * routing or localization
     */
    location: {
        city: 'Dallas',
        country: 'United States'
    },

    /**
     * Public social accounts. Keep both the full URL and display-only URL because
     * UI links and href values, while resume/code examples often look better without the protocol.
     */
    social: {
        github: {
            username: 'PLACE-HOLDER',
            url: 'placeholder.org',

            displayUrl: 'github.com'
        },
        x: {
            username: 'PLACE-HOLDER',
            handle: 'PLACE-HOLDER',
            url: 'http://',
            displayUrl: 'x.com'
        },
    },

    /**
     * Project repo shortcuts used by components that render project-specific
     * CTAs, for example ArchitectureFlow uses resumeGenerator.url for its
     * 'View on GitHub' button. if the project does not exist, replace these
     * with a real repo or remove the consuming CTA from that component.
     * Repository link used for project component buttons, like the GitHub / Release button for ArchitectureFlow
     */
    repositories: {
        resumeGenerator: {
            url: 'http://github.com/Dave6375/resume-generator',
            releasesUrl: 'https://github.com/Dave6375/resume-generator/releases',
        },
    },
} as const;

export type Metadata = typeof metadata;