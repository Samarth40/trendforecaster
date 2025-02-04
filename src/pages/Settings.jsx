import { useState } from 'react';
import { auth } from '../config/firebase';

function Settings() {
  const [user] = useState(auth.currentUser);
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    trends: true,
    performance: false,
  });

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-xl p-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Settings
        </h1>
        <p className="mt-2 text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-6">Profile</h2>
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div className="ml-6">
                  <button className="px-4 py-2 rounded-lg text-white animated-gradient hover:opacity-90 transition-opacity">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg bg-gray-800 border-gray-700 text-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg bg-gray-800 border-gray-700 text-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    value={user?.email}
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  className="w-full rounded-lg bg-gray-800 border-gray-700 text-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  rows="4"
                  placeholder="Tell us about yourself"
                ></textarea>
              </div>

              <div>
                <button className="px-6 py-2 rounded-lg text-white animated-gradient hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-6">
              Security
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg bg-gray-800 border-gray-700 text-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg bg-gray-800 border-gray-700 text-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg bg-gray-800 border-gray-700 text-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <button className="px-6 py-2 rounded-lg text-white animated-gradient hover:opacity-90 transition-opacity">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Preferences */}
        <div className="space-y-6">
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-6">
              Notifications
            </h2>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-100 capitalize">{key} Notifications</p>
                    <p className="text-sm text-gray-400">
                      Receive {key} notifications about your activity
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                      value ? 'bg-purple-400' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-6">
              Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language
                </label>
                <select className="w-full rounded-lg bg-gray-800 border-gray-700 text-gray-300 focus:border-purple-500 focus:ring-purple-500">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time Zone
                </label>
                <select className="w-full rounded-lg bg-gray-800 border-gray-700 text-gray-300 focus:border-purple-500 focus:ring-purple-500">
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC-8 (Pacific Time)</option>
                  <option>UTC+0 (London)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 