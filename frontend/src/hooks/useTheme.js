import { useContext } from 'react';
import { AppStateContext } from '../contexts/AppStateContext'; // Assuming theme is in AppStateContext

export const useTheme = () => {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('useTheme must be used within an AppStateProvider');
    }
    return { theme: context.theme, toggleTheme: context.toggleTheme };
};