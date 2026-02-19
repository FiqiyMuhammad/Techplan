/**
 * Maintenance Utility for TEDU Application
 * Handles cache management, state migrations, and cleanup of legacy data.
 */

const APP_VERSION = "1.0.1";
const STORAGE_PREFIX = "tedu_";

export const Maintenance = {
    /**
     * Initializes maintenance tasks.
     * Should be called at the root of the application.
     */
    init: () => {
        if (typeof window === 'undefined') return;
        
        console.log(`[Maintenance] Initializing TEDU Maintenance v${APP_VERSION}`);
        
        // 1. Version Check & Cache Clearing
        const lastVersion = localStorage.getItem(`${STORAGE_PREFIX}version`);
        if (lastVersion !== APP_VERSION) {
            console.warn(`[Maintenance] Version mismatch: ${lastVersion} -> ${APP_VERSION}. Performing deep cleanup...`);
            Maintenance.clearLegacyCache();
            localStorage.setItem(`${STORAGE_PREFIX}version`, APP_VERSION);
        }

        // 2. Scheduled Cleanup
        Maintenance.cleanupOrphanedKeys();
    },

    /**
     * Clears all non-essential localStorage data from previous versions.
     */
    clearLegacyCache: () => {
        if (typeof window === 'undefined') return;
        
        // Keep some keys if necessary, but here we clear everything for a fresh start
        // except high scores if we want to preserve them (let's preserve Pacman high score)
        const preservedKeys = ['tdx_mazechase_v1']; 
        const preservedData: Record<string, string | null> = {};
        
        preservedKeys.forEach(key => {
            preservedData[key] = localStorage.getItem(key);
        });

        localStorage.clear();
        console.log("[Maintenance] LocalStorage cleared.");

        // Restore preserved data
        Object.entries(preservedData).forEach(([key, value]) => {
            if (value !== null) localStorage.setItem(key, value);
        });
    },

    /**
     * Removes temporary or orphaned keys that might be left behind.
     */
    cleanupOrphanedKeys: () => {
        if (typeof window === 'undefined') return;
        
        const keysToRemove = [
            'temp_draft',
            'debug_mode',
            'old_sidebar_state'
        ];

        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`[Maintenance] Removed orphaned key: ${key}`);
            }
        });
    }
};
