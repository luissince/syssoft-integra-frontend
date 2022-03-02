import { RESTORE_TOKEN, SIGN_IN, SIGN_OUT } from './types';

export const restoreToken = (user) => (
    {
        type: RESTORE_TOKEN,
        token: user
    }
)

export const signIn = (user) => (
    {
        type: SIGN_IN,
        token: user
    }
)

export const signOut = () => (
    {
        type: SIGN_OUT
    }
)
