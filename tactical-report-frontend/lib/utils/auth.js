import Cookies from 'js-cookie';

const CREDENTIALS = {
    username: "admin",
    password: "admin"
}

export const login = (username, password) => {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
        Cookies.set('isAuthenticated', 'true', {expires: 1});
        return true;
    }
    return false;
}

export const logout = () => {
    Cookies.remove('isAuthenticated');
}

export const isAuthenticated = () => {
    return Cookies.get('isAuthenticated') === 'true';
}