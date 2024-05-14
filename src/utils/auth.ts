
export const isAuthenticated = (): boolean => {
    if (typeof window !== 'undefined') {
        // Check for a token or a session
        const token = localStorage.getItem('token'); // or use cookies
        return !!token;
    }
    return false;
};
