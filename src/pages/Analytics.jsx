function Analytics() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-xl p-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Analytics Dashboard
        </h1>
        <p className="mt-2 text-gray-400">
          Track and analyze your content performance metrics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Impressions',
            value: '2.4M',
            change: '+12.5%',
            color: 'purple',
          },
          {
            title: 'Engagement Rate',
            value: '4.8%',
            change: '+2.1%',
            color: 'cyan',
          },
          {
            title: 'Content Published',
            value: '156',
            change: '+8.2%',
            color: 'pink',
          },
          {
            title: 'Avg. Response Time',
            value: '2.3h',
            change: '-15%',
            color: 'green',
          },
        ].map((stat, index) => (
          <div key={index} className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                <p className={`mt-2 text-3xl font-bold text-${stat.color}-400`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 bg-${stat.color}-500 bg-opacity-10 rounded-lg`}>
                <svg
                  className={`w-6 h-6 text-${stat.color}-400`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <span
                  className={`text-${
                    stat.change.startsWith('+') ? 'green' : 'red'
                  }-400 text-sm font-medium`}
                >
                  {stat.change}
                </span>
                <span className="ml-2 text-gray-400 text-sm">from last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">
            Engagement Overview
          </h2>
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-400">Engagement chart will be implemented here</p>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">
            Content Performance
          </h2>
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-400">Performance chart will be implemented here</p>
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-4">
          Recent Content Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-4 text-gray-400 font-medium">Content</th>
                <th className="pb-4 text-gray-400 font-medium">Type</th>
                <th className="pb-4 text-gray-400 font-medium">Impressions</th>
                <th className="pb-4 text-gray-400 font-medium">Engagement</th>
                <th className="pb-4 text-gray-400 font-medium">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[1, 2, 3].map((_, index) => (
                <tr key={index}>
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center justify-center text-white">
                        AI
                      </div>
                      <div className="ml-4">
                        <p className="text-gray-100">The Future of AI</p>
                        <p className="text-sm text-gray-400">Published 2 days ago</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500 bg-opacity-10 text-purple-400">
                      Blog Post
                    </span>
                  </td>
                  <td className="py-4">
                    <p className="text-gray-100">24.5K</p>
                    <p className="text-sm text-green-400">+12.3%</p>
                  </td>
                  <td className="py-4">
                    <p className="text-gray-100">5.2%</p>
                    <p className="text-sm text-green-400">+0.8%</p>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-cyan-400 h-2 rounded-full"
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                      <span className="ml-4 text-gray-100">75%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics; 