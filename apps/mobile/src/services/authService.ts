import { auth } from '../lib/supabase';

export const signUp = auth.signUp;
export const signIn = auth.signIn;
export const signOut = auth.signOut;
export const updatePassword = auth.updatePassword;
export const resetPassword = auth.resetPassword;
export const verifyRecoveryCode = auth.verifyRecoveryCode;
export const verifySignupCode = auth.verifySignupCode;
export const resendConfirmationCode = auth.resendConfirmationCode;
export const deleteAccount = auth.deleteAccount;
export const getSession = auth.getSession;
