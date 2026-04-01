import { ref, push, serverTimestamp } from 'firebase/database';

/**
 * Logs an activity to the /logs node in Firebase Realtime Database.
 * 
 * @param {object} db - Firebase database instance
 * @param {string} menu - The module name (e.g., 'Surat Masuk')
 * @param {string} keterangan - Action description
 * @param {object} user - Current user object from AuthContext
 */
export const logActivity = async (db, menu, keterangan, user) => {
  if (!db || !menu || !keterangan) return;
  
  const logRef = ref(db, 'logs');
  const newLog = {
    tanggal: new Date().toISOString(),
    timestamp: serverTimestamp(),
    menu: menu,
    keterangan: keterangan,
    petugas: user?.name || user?.username || 'System'
  };

  try {
    await push(logRef, newLog);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
