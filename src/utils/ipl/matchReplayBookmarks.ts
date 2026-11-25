
import type { MatchReplay } from "./matchReplayEngine";

export type ReplayBookmarkCategory =
  | "wicket"
  | "boundary"
  | "turning-point"
  | "important-over"
  | "custom";

export interface MatchReplayBookmark {
  id: string;
  matchId: string;
  frameIndex: number;
  category: ReplayBookmarkCategory;
  title: string;
  note: string;
  createdAt: number;
}

export class MatchReplayBookmarkManager {
  private bookmarks = new Map<string, MatchReplayBookmark>();

  addBookmark(
    replay: MatchReplay,
    frameIndex: number,
    category: ReplayBookmarkCategory,
    title: string,
    note = "",
  ): MatchReplayBookmark {
    if (
      !Number.isInteger(frameIndex) ||
      frameIndex < 0 ||
      frameIndex >= replay.totalFrames
    ) {
      throw new Error("Invalid replay frame index.");
    }

    if (!title.trim()) {
      throw new Error("Bookmark title cannot be empty.");
    }

    const bookmark: MatchReplayBookmark = {
      id: `${replay.matchId}-${frameIndex}-${Date.now()}`,
      matchId: replay.matchId,
      frameIndex,
      category,
      title: title.trim(),
      note: note.trim(),
      createdAt: Date.now(),
    };

    this.bookmarks.set(bookmark.id, bookmark);

    return { ...bookmark };
  }

  removeBookmark(bookmarkId: string): boolean {
    return this.bookmarks.delete(bookmarkId);
  }

  getBookmarks(matchId: string): MatchReplayBookmark[] {
    return Array.from(this.bookmarks.values())
      .filter((bookmark) => bookmark.matchId === matchId)
      .sort((a, b) => a.frameIndex - b.frameIndex)
      .map((bookmark) => ({ ...bookmark }));
  }

  getBookmarksByCategory(
    matchId: string,
    category: ReplayBookmarkCategory,
  ): MatchReplayBookmark[] {
    return this.getBookmarks(matchId).filter(
      (bookmark) => bookmark.category === category,
    );
  }

  clearMatchBookmarks(matchId: string): number {
    let removed = 0;

    for (const [id, bookmark] of this.bookmarks.entries()) {
      if (bookmark.matchId === matchId) {
        this.bookmarks.delete(id);
        removed++;
      }
    }

    return removed;
  }
}
