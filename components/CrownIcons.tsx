import React from 'react';

const wrapper = (path: React.ReactNode) => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        
        <g transform="translate(12, 12) scale(0.8) translate(-12, -12)">
            <g transform="translate(0, 0)">
                {path}
            </g>
        </g>
    </svg>
);

// This is CrownIcon2 from the previous version, now the default.
export const CrownIcon: React.FC = () => wrapper(<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 2c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>);

// FIX: Define and export CROWN_ICONS to fix the import error in IconSelectionModal.
const CrownIcon1: React.FC = () => wrapper(<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/>);
const CrownIcon3: React.FC = () => wrapper(<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"/>);
const CrownIcon4: React.FC = () => wrapper(<path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>);
const CrownIcon5: React.FC = () => wrapper(<path d="M12 2l-5.5 9h11L12 2zm0 10.5l-2.5-4.5h5l-2.5 4.5zM6 20h12v-2H6v2z"/>);

export const CROWN_ICONS = [
    { id: 1, component: CrownIcon1 },
    { id: 2, component: CrownIcon },
    { id: 3, component: CrownIcon3 },
    { id: 4, component: CrownIcon4 },
    { id: 5, component: CrownIcon5 },
];