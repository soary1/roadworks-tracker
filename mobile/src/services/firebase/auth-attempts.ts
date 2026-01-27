import { firestore } from './routeworks-tracker';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

// Configuration
const MAX_FAILED_ATTEMPTS = 3;

interface LoginAttempt {
  userId: string;
  email: string;
  failedAttempts: number;
  isLocked: boolean;
  lockedAt: Timestamp | null;
  lastFailedAttempt: Timestamp | null;
}

/**
 * Récupère le statut de tentatives de connexion d'un utilisateur
 */
export async function getLoginAttempt(email: string): Promise<LoginAttempt | null> {
  try {
    const docRef = doc(firestore, 'loginAttempts', email);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as LoginAttempt;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des tentatives:', error);
    return null;
  }
}

/**
 * Vérifie si un compte est actuellement bloqué
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const attempt = await getLoginAttempt(email);
  return attempt?.isLocked || false;
}

/**
 * Enregistre une tentative de connexion échouée
 */
export async function recordFailedAttempt(email: string, userId?: string): Promise<{
  isLocked: boolean;
  failedAttempts: number;
}> {
  try {
    const docRef = doc(firestore, 'loginAttempts', email);
    const attempt = await getLoginAttempt(email);
    
    let newFailedAttempts = 1;
    let newIsLocked = false;
    
    if (attempt) {
      newFailedAttempts = (attempt.failedAttempts || 0) + 1;
      
      // Si on dépasse le maximum, bloquer le compte définitivement
      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        newIsLocked = true;
      }
    } else {
      newFailedAttempts = 1;
    }

    // Enregistrer la tentative
    await setDoc(docRef, {
      userId: userId || null,
      email,
      failedAttempts: newFailedAttempts,
      isLocked: newIsLocked || attempt?.isLocked || false,
      lockedAt: (newIsLocked && !attempt?.isLocked) ? serverTimestamp() : (attempt?.lockedAt || null),
      lastFailedAttempt: serverTimestamp()
    }, { merge: true });

    return {
      isLocked: newIsLocked || attempt?.isLocked || false,
      failedAttempts: newFailedAttempts
    };
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tentative échouée:', error);
    throw error;
  }
}

/**
 * Réinitialise les tentatives échouées après une connexion réussie
 */
export async function resetLoginAttempts(email: string): Promise<void> {
  try {
    const docRef = doc(firestore, 'loginAttempts', email);
    await setDoc(docRef, {
      failedAttempts: 0,
      lastFailedAttempt: null
    }, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des tentatives:', error);
    throw error;
  }
}

/**
 * Débloque manuellement un compte (à utiliser par un administrateur)
 */
export async function unlockAccount(email: string): Promise<void> {
  try {
    const docRef = doc(firestore, 'loginAttempts', email);
    await setDoc(docRef, {
      isLocked: false,
      failedAttempts: 0,
      lockedAt: null,
      lastFailedAttempt: null
    }, { merge: true });
  } catch (error) {
    console.error('Erreur lors du déverrouillage du compte:', error);
    throw error;
  }
}
