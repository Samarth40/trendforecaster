import { db } from '../config/firebase';
import { 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

class ActivityTracker {
  constructor() {
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.activityCount = 0;
    this.isTracking = false;
    this.userId = null;
    this.updateInterval = null;
  }

  startTracking(userId) {
    if (this.isTracking) return;
    
    this.userId = userId;
    this.isTracking = true;
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.activityCount = 0;

    // Update session start in Firestore
    this.updateSessionStart();

    // Start interval to update active time
    this.updateInterval = setInterval(() => {
      this.updateActiveTime();
    }, 60000); // Update every minute
  }

  stopTracking() {
    if (!this.isTracking) return;

    this.isTracking = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Update final session duration
    this.updateSessionDuration();
  }

  recordActivity() {
    if (!this.isTracking) return;

    this.activityCount++;
    this.lastActivityTime = Date.now();
    this.updateActivityStats();
  }

  async updateSessionStart() {
    if (!this.userId) return;

    const userStatsRef = doc(db, 'userStats', this.userId);
    await updateDoc(userStatsRef, {
      currentSessionStart: serverTimestamp(),
      'performance.sessionDuration': 0,
      'dailyActivity.todayActions': 0,
      lastActive: serverTimestamp()
    });
  }

  async updateSessionDuration() {
    if (!this.userId) return;

    const duration = Date.now() - this.sessionStartTime;
    const userStatsRef = doc(db, 'userStats', this.userId);
    await updateDoc(userStatsRef, {
      'performance.sessionDuration': duration,
      lastActive: serverTimestamp()
    });
  }

  async updateActiveTime() {
    if (!this.userId || !this.isTracking) return;

    const activeTime = Date.now() - this.sessionStartTime;
    const userStatsRef = doc(db, 'userStats', this.userId);
    await updateDoc(userStatsRef, {
      'performance.activeTime': activeTime,
      lastActive: serverTimestamp()
    });
  }

  async updateActivityStats() {
    if (!this.userId) return;

    const userStatsRef = doc(db, 'userStats', this.userId);
    await updateDoc(userStatsRef, {
      'dailyActivity.todayActions': increment(1),
      lastActive: serverTimestamp()
    });
  }

  getSessionDuration() {
    return Date.now() - this.sessionStartTime;
  }

  getActiveTime() {
    return Date.now() - this.lastActivityTime;
  }

  getTodayActions() {
    return this.activityCount;
  }
}

export const activityTracker = new ActivityTracker(); 