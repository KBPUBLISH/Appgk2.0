import { getApiBaseUrl } from './apiService';

class PlayEventService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  // Record a book play/read event
  async recordBookPlay(bookId: string, userId?: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}play-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'book',
          contentId: bookId,
          userId: userId || 'anonymous',
        }),
      });
      console.log(`📊 Book play recorded: ${bookId}`);
    } catch (error) {
      console.warn('Failed to record book play event:', error);
      // Don't throw - this is non-critical
    }
  }

  // Record an episode play event
  async recordEpisodePlay(
    playlistId: string, 
    itemIndex: number, 
    episodeId?: string,
    userId?: string
  ): Promise<void> {
    try {
      await fetch(`${this.baseUrl}play-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'episode',
          contentId: episodeId || `${playlistId}_${itemIndex}`,
          playlistId,
          itemIndex,
          userId: userId || 'anonymous',
        }),
      });
      console.log(`📊 Episode play recorded: playlist ${playlistId}, track ${itemIndex}`);
    } catch (error) {
      console.warn('Failed to record episode play event:', error);
      // Don't throw - this is non-critical
    }
  }

  // Record a playlist play event
  async recordPlaylistPlay(playlistId: string, userId?: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}play-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'playlist',
          contentId: playlistId,
          userId: userId || 'anonymous',
        }),
      });
      console.log(`📊 Playlist play recorded: ${playlistId}`);
    } catch (error) {
      console.warn('Failed to record playlist play event:', error);
      // Don't throw - this is non-critical
    }
  }
}

export const playEventService = new PlayEventService();

