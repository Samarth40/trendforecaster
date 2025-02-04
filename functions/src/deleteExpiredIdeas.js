const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.deleteExpiredIdeas = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    try {
      // Query for expired ideas
      const expiredIdeasQuery = await db
        .collection('savedIdeas')
        .where('expiresAt', '<=', now)
        .get();

      // Batch delete expired ideas
      const batch = db.batch();
      expiredIdeasQuery.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      if (expiredIdeasQuery.docs.length > 0) {
        await batch.commit();
        console.log(`Deleted ${expiredIdeasQuery.docs.length} expired ideas`);
      }

      return null;
    } catch (error) {
      console.error('Error deleting expired ideas:', error);
      return null;
    }
  }); 