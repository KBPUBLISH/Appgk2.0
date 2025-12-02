# Daily Video Lesson Feature - Implementation Plan

## Overview
A daily video lesson system with Instagram story-style presentation, including video content, devotional reading, and interactive activities. Users earn 50 gold coins for completion.

---

## Feature Components

### 1. Frontend (Main App)

#### A. Explore Page Integration
**Location:** `pages/ExplorePage.tsx` (or create if doesn't exist)

**UI Elements:**
- **Lesson Card Container** (wider format, prominent placement under feature banner)
  - Thumbnail image
  - Title overlay
  - "NEW" badge for today's lesson
  - Progress indicator (if partially completed)
  - Lock icon for future lessons

**Implementation:**
```typescript
interface DailyLesson {
  _id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  videoDuration: number;
  devotionalText: string;
  activityType: 'quiz' | 'reflection';
  activityData: QuizQuestion[] | ReflectionPrompt[];
  scheduledDate: string;
  isCompleted?: boolean;
  coinReward: number; // 50
}
```

#### B. Video Lesson Modal
**Component:** `components/features/VideoLessonModal.tsx`

**Screens:**
1. **Video Screen**
   - Full-screen video player
   - Progress bar at top (Instagram story style)
   - Tap left/right to skip (optional)
   - Auto-advance to devotional when complete
   - Optional captions overlay

2. **Devotional Screen**
   - Scrollable text content
   - Beautiful typography
   - "Continue" button at bottom
   - Progress indicator at top

3. **Activity Screen**
   - **Quiz Mode:**
     - Multiple choice questions
     - Immediate feedback
     - Score tracking
   - **Reflection Mode:**
     - Self-assessment prompts
     - 1-5 scale sliders
     - Text input for notes (optional)
   - "Complete Lesson" button

4. **Completion Screen**
   - Celebration animation
   - "+50 Gold Coins" display
   - Summary of responses
   - "Done" button to close

**State Management:**
```typescript
interface LessonProgress {
  currentScreen: 'video' | 'devotional' | 'activity' | 'complete';
  videoProgress: number;
  activityAnswers: any[];
  startedAt: Date;
  completedAt?: Date;
}
```

---

### 2. Backend API

#### A. Database Schema
**Collection:** `dailylessons`

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  thumbnailUrl: String,
  videoUrl: String,
  videoDuration: Number, // seconds
  captions: [{
    timestamp: Number,
    text: String
  }],
  devotionalText: String,
  activityType: String, // 'quiz' | 'reflection'
  activityData: {
    // For quiz
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      aiGenerated: Boolean
    }],
    // For reflection
    prompts: [{
      prompt: String,
      type: String, // 'scale' | 'text'
      aiGenerated: Boolean
    }]
  },
  scheduledDate: Date,
  isPublished: Boolean,
  coinReward: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Collection:** `lessoncompletions`

```javascript
{
  _id: ObjectId,
  userId: String,
  lessonId: ObjectId,
  completedAt: Date,
  videoWatchTime: Number,
  activityAnswers: Mixed,
  coinsAwarded: Number
}
```

#### B. API Routes
**File:** `backend/src/routes/dailyLessons.js`

```javascript
// Public routes
GET    /api/daily-lessons/today          // Get today's lesson
GET    /api/daily-lessons/upcoming       // Get next 7 days
GET    /api/daily-lessons/:id            // Get specific lesson
POST   /api/daily-lessons/:id/complete   // Mark as complete, award coins

// Portal routes (admin)
GET    /api/daily-lessons                // List all lessons
POST   /api/daily-lessons                // Create new lesson
PUT    /api/daily-lessons/:id            // Update lesson
DELETE /api/daily-lessons/:id            // Delete lesson
POST   /api/daily-lessons/:id/generate-activity  // AI generate quiz/reflection
GET    /api/daily-lessons/calendar/:year/:month  // Calendar view
```

#### C. AI Integration
**Service:** `backend/src/services/lessonAIService.js`

```javascript
// Generate quiz questions from captions
async function generateQuizFromCaptions(captions) {
  // Use OpenAI/Gemini to analyze captions
  // Generate 3-5 multiple choice questions
  // Return structured quiz data
}

// Generate reflection prompts from captions
async function generateReflectionPrompts(captions) {
  // Use AI to create thoughtful prompts
  // Return 3-5 self-reflection questions
}
```

---

### 3. Portal (Admin Interface)

#### A. Daily Lessons Management Page
**Location:** `projects-portal/src/pages/DailyLessonsPage.tsx`

**Features:**
- List view of all lessons (table format)
- Filter by status (draft, scheduled, published)
- Search by title
- Quick actions (edit, delete, duplicate)
- "Create New Lesson" button

#### B. Lesson Editor
**Component:** `projects-portal/src/pages/DailyLessonEditor.tsx`

**Sections:**

1. **Basic Info**
   - Title input
   - Description textarea
   - Thumbnail upload
   - Video upload (with progress)

2. **Captions Editor**
   - Timestamp + text pairs
   - Add/remove caption rows
   - Import from SRT file
   - Preview with video

3. **Devotional Content**
   - Rich text editor
   - Preview pane

4. **Activity Builder**
   - Toggle: Quiz vs Reflection
   - **Quiz Mode:**
     - Manual question entry
     - "AI Generate" button (uses captions)
     - Edit generated questions
   - **Reflection Mode:**
     - Manual prompt entry
     - "AI Generate" button
     - Choose scale (1-5, 1-10)

5. **Publishing**
   - Schedule date picker
   - Coin reward input (default 50)
   - Preview button
   - Publish/Save Draft buttons

#### C. Calendar View
**Component:** `projects-portal/src/pages/LessonCalendar.tsx`

**Features:**
- Month view calendar
- Drag-and-drop scheduling
- Visual indicators (published, draft, empty)
- Click date to create/edit lesson
- Bulk scheduling tools

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create database schemas
- [ ] Build backend API routes
- [ ] Set up file upload for videos/thumbnails
- [ ] Create basic VideoLessonModal component
- [ ] Implement video player with progress bar

### Phase 2: Portal Editor (Week 2)
- [ ] Build DailyLessonEditor page
- [ ] Implement caption editor
- [ ] Add devotional text editor
- [ ] Create activity builder UI
- [ ] Test lesson creation flow

### Phase 3: AI Integration (Week 3)
- [ ] Set up AI service (OpenAI/Gemini)
- [ ] Implement quiz generation
- [ ] Implement reflection generation
- [ ] Add AI generation UI in portal
- [ ] Test and refine prompts

### Phase 4: Calendar & Scheduling (Week 4)
- [ ] Build calendar view component
- [ ] Implement scheduling logic
- [ ] Add drag-and-drop functionality
- [ ] Create bulk scheduling tools
- [ ] Test scheduling system

### Phase 5: Main App Integration (Week 5)
- [ ] Add lesson card to Explore page
- [ ] Complete all modal screens
- [ ] Implement completion tracking
- [ ] Add coin reward system
- [ ] Test full user flow

### Phase 6: Polish & Testing (Week 6)
- [ ] Add animations and transitions
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Performance optimization
- [ ] User testing and bug fixes

---

## Technical Considerations

### Video Hosting
- **Option 1:** Google Cloud Storage (current setup)
- **Option 2:** Cloudflare Stream (better for video)
- **Option 3:** YouTube (unlisted videos)

**Recommendation:** Use GCS for now, migrate to Cloudflare Stream if needed for better streaming performance.

### Caption Format
- Support SRT file import
- Store as JSON array in database
- Sync with video player for display

### AI Provider
- **OpenAI GPT-4:** Best quality, moderate cost
- **Google Gemini:** Good quality, lower cost
- **Claude:** Excellent for educational content

**Recommendation:** Start with Gemini (already integrated), add OpenAI as fallback.

### Coin System Integration
- Verify user hasn't already completed today's lesson
- Award coins only once per lesson
- Update user's coin balance in database
- Show coin animation on completion

---

## UI/UX Design Notes

### Lesson Card (Explore Page)
```
┌─────────────────────────────────────┐
│  [Thumbnail with gradient overlay]  │
│                                     │
│  Daily Lesson                       │
│  "Walking in Faith"            [NEW]│
│  ━━━━━━━━━━━━━━━━━━━━━━━━ 0%      │
└─────────────────────────────────────┘
```

### Progress Bar (Top of Modal)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Video | Devotional | Activity
  ●        ○           ○
```

### Activity Screen (Quiz Example)
```
┌─────────────────────────────────────┐
│ Question 2 of 5                     │
│                                     │
│ What did Jesus teach about prayer?  │
│                                     │
│ ○ Pray only in church               │
│ ● Pray without ceasing              │
│ ○ Pray once a day                   │
│ ○ Pray only on Sundays              │
│                                     │
│          [Next Question]            │
└─────────────────────────────────────┘
```

---

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── DailyLesson.js
│   │   └── LessonCompletion.js
│   ├── routes/
│   │   └── dailyLessons.js
│   └── services/
│       └── lessonAIService.js

projects-portal/
└── src/
    ├── pages/
    │   ├── DailyLessonsPage.tsx
    │   ├── DailyLessonEditor.tsx
    │   └── LessonCalendar.tsx
    └── components/
        └── lesson/
            ├── CaptionEditor.tsx
            ├── ActivityBuilder.tsx
            └── LessonPreview.tsx

(main app)/
├── pages/
│   └── ExplorePage.tsx
├── components/
│   └── features/
│       └── VideoLessonModal.tsx
└── services/
    └── dailyLessonService.ts
```

---

## Next Steps

1. **Review this plan** - Confirm approach and priorities
2. **Set up database** - Create collections and indexes
3. **Start with Phase 1** - Build core infrastructure
4. **Iterate and test** - Get feedback at each phase

Would you like me to start implementing any specific part of this plan?
