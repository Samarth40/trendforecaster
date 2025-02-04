import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { dashboardService } from '../services/dashboardService';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Search, Filter, Trash2, Edit, X } from 'lucide-react';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function SavedIdeas() {
  const [user] = useAuthState(auth);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, recent, platform
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [activePlatform, setActivePlatform] = useState('Instagram');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    // Subscribe to saved ideas
    dashboardService.subscribeToSavedIdeas(user.uid, (update) => {
      if (!mounted) return;

      if (update.type === 'error') {
        console.error('Error in subscription:', update.data);
        setError(update.data.message);
        return;
      }

      console.log('Received saved ideas:', update.data);
      setIdeas(update.data);
      setLoading(false);
    });

    // Cleanup function
    return () => {
      mounted = false;
      dashboardService.unsubscribeFromSavedIdeas(user.uid);
    };
  }, [user]);

  // Debug selected idea when it changes
  useEffect(() => {
    if (selectedIdea) {
      console.log('Selected idea for modal:', selectedIdea);
      console.log('Modal content:', selectedIdea.modalContent);
    }
  }, [selectedIdea]);

  // Filter and search ideas with logging
  const filteredIdeas = ideas.filter(idea => {
    console.log('Filtering idea:', idea);
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'recent') {
      const isRecent = new Date(idea.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && isRecent;
    }
    return matchesSearch && idea.platform === filter;
  });

  // Handle idea deletion with modal
  const handleDelete = async (idea) => {
    setIdeaToDelete(idea);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!ideaToDelete) return;

    try {
      toast.loading('Removing from saved...', { 
        toastId: 'deleting-idea' 
      });

      console.log('Deleting idea:', ideaToDelete.id);
      await dashboardService.deleteSavedIdea(user.uid, ideaToDelete.id);
      
      toast.update('deleting-idea', {
        render: 'Removed from saved ideas',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });

    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.update('deleting-idea', {
        render: 'Failed to remove idea',
        type: 'error',
        isLoading: false,
        autoClose: 2000
      });
    } finally {
      setIsDeleteModalOpen(false);
      setIdeaToDelete(null);
    }
  };

  // Handle idea editing
  const handleEdit = (idea) => {
    // Implement edit functionality
    console.log('Edit idea:', idea);
  };

  // Render modal content with error boundary
  const renderModalContent = (idea) => {
    try {
      if (!idea) {
        console.error('No idea provided to modal');
        return null;
      }

      console.log('Rendering modal for idea:', idea);
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-purple-500 bg-opacity-20 text-purple-300 text-sm">
                  {idea.type || 'Content'}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500 bg-opacity-20 text-blue-300 text-sm">
                  {idea.difficulty || 'Medium'} Difficulty
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-100 mt-3">
                {idea.title}
              </h2>
            </div>
            <button
              onClick={() => setSelectedIdea(null)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Overview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Overview</h3>
            <p className="text-gray-300">
              {idea.modalContent?.overview || idea.description || 'No description available'}
            </p>
          </div>

          {/* Content Structure based on type */}
          <div className="mt-4">
            {idea.modalContent?.content?.video && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-300">Video Script</h4>
                <div className="space-y-6 content-structure">
                  {idea.modalContent.content.video.sections?.map((section, i) => (
                    <div key={i} className="glass-effect p-4 rounded-lg">
                      <h5 className="text-gray-300 font-semibold mb-3">
                        {i + 1}. {section.title || `Section ${i + 1}`}
                      </h5>
                      <div className="space-y-3 text-gray-400">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-24 text-sm font-medium text-purple-300">Visual:</div>
                          <p>{section.content?.visual || 'No visual content'}</p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-24 text-sm font-medium text-purple-300">Audio:</div>
                          <p>{section.content?.audio || 'No audio content'}</p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-24 text-sm font-medium text-purple-300">Text Overlay:</div>
                          <p>{section.content?.overlay || 'No overlay content'}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Production Notes for Video */}
                  {idea.modalContent.content.video.productionNotes && (
                    <div className="glass-effect p-4 rounded-lg border-t border-gray-700">
                      <h5 className="text-gray-300 font-semibold mb-3">Production Notes</h5>
                      <div className="space-y-3 text-gray-400 text-sm">
                        <p>• Duration: {idea.modalContent.content.video.productionNotes.duration}</p>
                        <p>• Aspect Ratio: {idea.modalContent.content.video.productionNotes.aspectRatio}</p>
                        <p>• Style: {idea.modalContent.content.video.productionNotes.style}</p>
                        <p>• Music: {idea.modalContent.content.video.productionNotes.music}</p>
                        <p>• Captions: {idea.modalContent.content.video.productionNotes.captions}</p>
                        <p>• Graphics: {idea.modalContent.content.video.productionNotes.graphics}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {idea.modalContent?.content?.podcast && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-300">Podcast Script</h4>
                <div className="space-y-6 content-structure">
                  {idea.modalContent.content.podcast.sections?.map((section, i) => (
                    <div key={i} className="glass-effect p-4 rounded-lg">
                      <h5 className="text-gray-300 font-semibold mb-3">
                        {i + 1}. {section.title}
                      </h5>
                      <div className="space-y-3 text-gray-400">
                        <p className="whitespace-pre-wrap">{section.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Production Notes for Podcast */}
                  {idea.modalContent.content.podcast.productionNotes && (
                    <div className="glass-effect p-4 rounded-lg border-t border-gray-700">
                      <h5 className="text-gray-300 font-semibold mb-3">Production Notes</h5>
                      <div className="space-y-4 text-gray-400 text-sm">
                        <div>
                          <p className="font-medium text-purple-300 mb-2">Format & Duration</p>
                          <p>• Duration: {idea.modalContent.content.podcast.productionNotes.duration}</p>
                          <p>• Format: {idea.modalContent.content.podcast.productionNotes.format}</p>
                        </div>
                        <div>
                          <p className="font-medium text-purple-300 mb-2">Segments</p>
                          {idea.modalContent.content.podcast.productionNotes.segments.map((segment, i) => (
                            <p key={i}>• {segment}</p>
                          ))}
                        </div>
                        <div>
                          <p className="font-medium text-purple-300 mb-2">Technical Requirements</p>
                          <p>• Audio: {idea.modalContent.content.podcast.productionNotes.technicalRequirements.audio}</p>
                          <p>• Editing: {idea.modalContent.content.podcast.productionNotes.technicalRequirements.editing}</p>
                          <p>• Distribution: {idea.modalContent.content.podcast.productionNotes.technicalRequirements.distribution}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {idea.modalContent?.content?.article && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-300">Article Content</h4>
                <div className="space-y-6 content-structure">
                  {idea.modalContent.content.article.sections?.map((section, i) => (
                    <div key={i} className="glass-effect p-4 rounded-lg">
                      <h5 className="text-gray-300 font-semibold mb-3">
                        {i + 1}. {section.title}
                      </h5>
                      <div className="space-y-3 text-gray-400">
                        <p className="whitespace-pre-wrap">{section.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media Content */}
            {idea.modalContent?.content?.social && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-300">Social Media Content</h4>
                
                {/* Platform Tabs */}
                <div className="flex flex-col space-y-4">
                  <div className="flex space-x-2 border-b border-gray-700">
                    {['Instagram', 'Twitter', 'Threads', 'LinkedIn'].map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setActivePlatform(platform)}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                          activePlatform === platform 
                            ? 'text-purple-400' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        {platform}
                        {activePlatform === platform && (
                          <motion.div
                            layoutId="activePlatform"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                            initial={false}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Platform Content */}
                  <div className="space-y-4">
                    {activePlatform === 'Instagram' && idea.modalContent.content.social.instagram && (
                      <div className="glass-effect p-4 rounded-lg">
                        <div className="space-y-4">
                          <div>
                            <h6 className="text-sm font-semibold text-purple-300 mb-2">Instagram Caption</h6>
                            <p className="text-gray-300 whitespace-pre-wrap">
                              {idea.modalContent.content.social.instagram.caption}
                            </p>
                          </div>
                          <div>
                            <h6 className="text-sm font-semibold text-purple-300 mb-2">Hashtags</h6>
                            <p className="text-gray-400">
                              {idea.modalContent.content.social.instagram.hashtags}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activePlatform === 'Twitter' && idea.modalContent.content.social.twitter && (
                      <div className="glass-effect p-4 rounded-lg">
                        <div className="space-y-4">
                          <div>
                            <h6 className="text-sm font-semibold text-purple-300 mb-2">Twitter Thread</h6>
                            <div className="space-y-3 text-gray-300">
                              {idea.modalContent.content.social.twitter.thread?.map((tweet, i) => (
                                <p key={i} className="text-gray-300">{tweet}</p>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h6 className="text-sm font-semibold text-purple-300 mb-2">Hashtags</h6>
                            <p className="text-gray-400">
                              {idea.modalContent.content.social.twitter.hashtags}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activePlatform === 'Threads' && idea.modalContent.content.social.threads && (
                      <div className="glass-effect p-4 rounded-lg">
                        <div className="space-y-4">
                          <div>
                            <h6 className="text-sm font-semibold text-purple-300 mb-2">Threads Content</h6>
                            <div className="space-y-3 text-gray-300">
                              {idea.modalContent.content.social.threads.thread?.map((post, i) => (
                                <p key={i} className="text-gray-300">{post}</p>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h6 className="text-sm font-semibold text-purple-300 mb-2">Hashtags</h6>
                            <p className="text-gray-400">
                              {idea.modalContent.content.social.threads.hashtags}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activePlatform === 'LinkedIn' && idea.modalContent.content.social.linkedin && (
                      <div className="glass-effect p-4 rounded-lg">
                        <div className="space-y-4">
                          <div>
                            <h6 className="text-sm font-semibold text-purple-300 mb-2">LinkedIn Article</h6>
                            <div className="space-y-3 text-gray-300">
                              <p className="whitespace-pre-wrap">
                                {idea.modalContent.content.social.linkedin.article}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h6 className="text-sm font-semibold text-purple-300 mb-2">Hashtags</h6>
                            <p className="text-gray-400">
                              {idea.modalContent.content.social.linkedin.hashtags}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering modal content:', error);
      return (
        <div className="text-red-400 p-4">
          Error displaying content. Please try again or contact support.
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              Saved Ideas
            </h1>
            <p className="mt-2 text-gray-400">
              Browse and manage your saved content ideas
            </p>
          </div>
          <div className="p-3 bg-cyan-500 bg-opacity-10 rounded-lg">
            <Bookmark className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search saved ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-cyan-400 focus:outline-none text-gray-100"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-cyan-400 focus:outline-none text-gray-100"
          >
            <option value="all">All Ideas</option>
            <option value="recent">Recent</option>
            <option value="Twitter">Twitter</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          [...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="glass-effect rounded-xl p-6 h-48" />
            </div>
          ))
        ) : filteredIdeas.length > 0 ? (
          filteredIdeas.map((idea) => (
            <motion.div
              key={idea.id}
              className="glass-effect rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
              onClick={() => setSelectedIdea(idea)}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Card Header */}
              <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-purple-500 bg-opacity-20 text-purple-300 text-sm">
                        {idea.type || 'Content'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-500 bg-opacity-20 text-blue-300 text-sm">
                        {idea.difficulty || 'Medium'} Difficulty
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">{idea.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(idea);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-gray-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(idea);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-gray-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Content Preview */}
              <div className="p-6 space-y-4">
                <p className="text-gray-300 line-clamp-3">{idea.description}</p>
                
                {/* Visual Content Preview */}
                {idea.visualContent && (
                  <div className="space-y-3">
                    {/* Content Type Indicator */}
                    <div className="flex items-center gap-2">
                      {idea.visualContent.cardStyle.type === 'video' && (
                        <div className="flex items-center gap-2 text-cyan-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">Video Script</span>
                        </div>
                      )}
                      {idea.visualContent.cardStyle.type === 'article' && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                          </svg>
                          <span className="text-sm">Article</span>
                        </div>
                      )}
                    </div>

                    {/* Section Preview */}
                    {idea.visualContent.sections && idea.visualContent.sections.length > 0 && (
                      <div className="glass-effect p-4 rounded-lg">
                        <div className="text-gray-400 text-sm line-clamp-2">
                          {idea.visualContent.sections[0].title}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{idea.platform}</span>
                    <span>•</span>
                    <span>{idea.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Bookmark className="w-12 h-12 text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-300">No saved ideas found</h3>
              <p className="text-gray-400">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start saving ideas to see them here'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Idea Detail Modal */}
      <AnimatePresence>
        {selectedIdea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIdea(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl glass-effect rounded-xl p-6 max-h-[90vh] overflow-y-auto"
            >
              {renderModalContent(selectedIdea)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIdeaToDelete(null);
        }}
        onConfirm={confirmDelete}
        itemTitle={ideaToDelete?.title || ''}
      />
    </div>
  );
}

export default SavedIdeas; 