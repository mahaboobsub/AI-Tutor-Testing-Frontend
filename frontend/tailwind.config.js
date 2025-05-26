/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' if you prefer OS-level theme preference
  theme: {
    extend: {
      colors: {
        // Define your professional blues/grays and accent colors here
        // Example:
        'primary': {
          light: '#A7C7E7', // Light blue
          DEFAULT: '#3B82F6', // Blue
          dark: '#1E40AF',  // Dark blue
        },
        'secondary': {
          light: '#E5E7EB', // Light gray
          DEFAULT: '#6B7280', // Gray
          dark: '#374151',  // Dark gray
        },
        'accent': '#F59E0B', // Amber/Orange accent
        'background': {
          light: '#F9FAFB', // Very light gray for light mode background
          dark: '#111827',  // Very dark gray/blue for dark mode background
        },
        'surface': {
            light: '#FFFFFF', // White for light mode surfaces (cards, etc.)
            dark: '#1F2937',  // Darker gray for dark mode surfaces
        },
        'text': {
            light: '#111827', // Dark text for light mode
            dark: '#E5E7EB',  // Light text for dark mode
        },
        'text-muted': {
            light: '#6B7280',
            dark: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Example: Using Inter font
      },
      // Add custom animations, transitions, etc.
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0'},
          '100%': { transform: 'translateX(0)', opacity: '1'},
        }
        // ... more keyframes
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideInLeft: 'slideInLeft 0.5s ease-out',
        // ... more animations
      }
    },
  },
  plugins: [],
}