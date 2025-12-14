# Collars Movies

A React Native mobile application built with Expo SDK 54 that displays Popular and Upcoming movies from TMDB (The Movie Database) with offline save functionality.

## Features

- **Movies Tab**: Browse Popular and Upcoming movies in horizontal carousels
- **Search**: Real-time movie search with 400ms debounce
- **Movie Details**: Rich movie information including poster, rating, genres, runtime, and overview
- **Save Movies**: Save movies for offline viewing with haptic feedback
- **Saved Tab**: View all saved movies with full offline support
- **Dark Mode**: Automatic light/dark theme support
- **Error Handling**: Comprehensive error handling with retry functionality
- **Pull to Refresh**: Refresh movie lists with pull-to-refresh gesture

## Prerequisites

- **Node.js 20+** (22+ recommended)
- **npm** or **yarn**
- **Expo CLI** (installed globally or via npx)
- **Ruby 3.0+** (required for iOS builds with CocoaPods)
  - Only needed if running `npx expo run:ios` or building native apps
  - Not required for Expo Go development
  - Check version: `ruby --version`
- **TMDB API key** ([Get one here](https://www.themoviedb.org/settings/api))

## Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_TMDB_API_KEY=your_api_key_here
   EXPO_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
   EXPO_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Testing

### Unit Tests

Run unit tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### End-to-End Tests

E2E tests are located in the `e2e/` directory and use [Maestro](https://maestro.mobile.dev/).

**Prerequisites**:
1. Install Maestro: `curl -Ls "https://get.maestro.mobile.dev" | bash`
2. Build the app: 
   - iOS: `npx expo run:ios` (requires Ruby 3.0+)
   - Android: `npx expo run:android`

**Run E2E tests**:
```bash
# Run all tests
npm run test:e2e

# Run for iOS
npm run test:e2e:ios

# Run for Android
npm run test:e2e:android

# Run a specific test
maestro test e2e/01-navigation.yaml
```

See `e2e/README.md` for detailed documentation.

## Architecture

### Directory Structure

```
src/
├── app/                    # Application layer
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   └── components/         # Reusable UI components
├── domain/                 # Domain layer (business logic)
│   └── movie/              # Movie domain models
├── infrastructure/         # Infrastructure layer
│   ├── api/                # TMDB API client
│   └── storage/            # AsyncStorage persistence
├── hooks/                  # Custom React hooks
├── ui/                     # UI theme system
│   └── theme/              # Colors, spacing, typography
└── utils/                  # Utility functions
```

### Architecture Decisions

**Clean Architecture**: The app follows a layered architecture separating concerns:
- **Domain Layer**: Pure business logic, no dependencies on frameworks
- **Infrastructure Layer**: External concerns (API, storage)
- **Application Layer**: UI components and navigation
- **Hooks Layer**: React-specific data fetching and state management

**Benefits**:
- Easy to test (domain logic isolated)
- Easy to swap implementations (e.g., different storage backend)
- Clear separation of concerns
- Type-safe throughout

### Navigation Layout

The app uses React Navigation v7 with a bottom tab navigator containing two stacks:

```
RootTabs (Bottom Tabs)
├── MoviesTab
│   └── MoviesStack
│       ├── Movies (list screen)
│       └── MovieDetail (shared detail screen)
└── SavedTab
    └── SavedStack
        ├── Saved (list screen)
        └── MovieDetail (shared detail screen)
```

**Design Choice**: Each tab has its own stack to maintain navigation history independently. The `MovieDetail` screen is shared but exists in both stacks, allowing users to navigate back to the correct tab context.

### Offline Strategy

**Saved Movies Storage**:
- Movies are saved as normalized `SavedMovie` objects containing all fields needed for offline rendering
- Uses `@react-native-async-storage/async-storage` for persistence
- Saved movies include: `id`, `title`, `posterUrl`, `overview`, `rating`, `releaseDate`, `genres[]`, `runtime`, `language`, `savedAt`

**Offline-First Detail View**:
- `useMovieDetail` hook checks saved movies first before attempting API fetch
- If API fails but saved data exists, uses saved data
- If no saved data and API fails, shows error with retry option
- This ensures saved movies are always viewable offline, even after app restart

**Network Detection**:
- Uses `@react-native-community/netinfo` to monitor connectivity
- `useNetworkStatus` hook provides real-time network status
- UI adapts based on connectivity (shows offline indicator, prevents API calls)

**Image Caching**:
- Movie posters are cached locally using `expo-file-system`
- Images are downloaded and stored when online
- Cached images are used automatically when offline
- Cache persists across app restarts

**Sync Queue**:
- Operations (save/remove movies) are queued when offline
- Queue is automatically processed when network becomes available
- Retry mechanism with max retries to handle transient failures
- Ensures data consistency even with intermittent connectivity

**Trade-offs**:
- ✅ Full offline support for saved movies
- ✅ Graceful degradation when network unavailable
- ✅ Image caching for offline viewing
- ✅ Automatic sync when connectivity restored
- ⚠️ Saved movies may become stale (no auto-refresh)
- ⚠️ Storage limited by device capacity (not a concern for typical use)
- ⚠️ Image cache grows over time (can be cleared manually)

### Error Handling Strategy

**Centralized Error Management**:
- All TMDB API errors are mapped to `TMDBError` with specific error codes
- Error codes: `UNAUTHORIZED`, `NOT_FOUND`, `RATE_LIMIT`, `SERVER_ERROR`, `NETWORK_ERROR`, `TIMEOUT`
- User-friendly messages displayed in UI
- Technical details logged via logger utility

**Error Recovery**:
- All error states provide retry functionality
- Network errors show clear messaging
- Rate limit errors guide users to wait
- Server errors indicate temporary issues

**Trade-offs**:
- ✅ Consistent error handling across app
- ✅ User-friendly messages
- ⚠️ Some error details hidden from users (by design for UX)

### UI/UX Decisions

**List Presentation**:
- **Popular/Upcoming**: Horizontal carousels in vertical scroll
- **Rationale**: Better for browsing large collections, familiar mobile pattern
- **Alternative Considered**: SectionList with horizontal lists - similar UX, chose simpler implementation

**Performance Optimizations**:
- `FlatList` with `initialNumToRender`, `windowSize`, `removeClippedSubviews`
- `React.memo` for `MovieCard` component
- Debounced search (400ms) to reduce API calls
- Image caching via `expo-image`

**Theming**:
- Uses React Native's `useColorScheme` for automatic theme detection
- All colors via theme tokens (no hardcoded colors)
- Supports system light/dark mode

## Trade-offs & Decisions

### TypeScript Strict Mode
- **Decision**: Enabled strict mode for type safety
- **Trade-off**: More verbose but catches errors at compile time
- **Benefit**: Prevents runtime errors, better IDE support

### No State Management Library
- **Decision**: Use React hooks + custom hooks for state
- **Trade-off**: Simpler for this app size, but could scale to Redux/Zustand if needed
- **Benefit**: Less boilerplate, easier to understand

### AsyncStorage for Persistence
- **Decision**: Use AsyncStorage for saved movies
- **Trade-off**: Not suitable for large datasets, but sufficient for user's saved movies
- **Benefit**: Simple, no external dependencies, works offline

### Horizontal Carousels vs Vertical List
- **Decision**: Horizontal carousels for Popular/Upcoming
- **Trade-off**: More scrolling, but better for browsing
- **Alternative**: Could use SectionList with horizontal sections (similar UX)

### Search Implementation
- **Decision**: Replace sections with search results when query active
- **Trade-off**: Can't see popular/upcoming while searching
- **Benefit**: Cleaner UI, focused search experience

## Manual QA Checklist

### Movies Tab
- [ ] Popular movies load and display correctly
- [ ] Upcoming movies load and display correctly
- [ ] Movie cards show poster, title, rating, year
- [ ] Tapping movie navigates to detail screen
- [ ] Pull-to-refresh works
- [ ] Search bar appears at top
- [ ] Search debounces correctly (400ms)
- [ ] Search results replace sections when query active
- [ ] Empty search shows appropriate message
- [ ] Error state shows with retry button
- [ ] Loading skeleton appears on initial load

### Movie Detail Screen
- [ ] Hero poster displays correctly
- [ ] All movie information displays (title, rating, year, overview, genres, runtime, language)
- [ ] Overview expand/collapse works
- [ ] Save button toggles correctly
- [ ] Haptic feedback on save/remove
- [ ] Saved state persists after navigation
- [ ] Works offline for saved movies
- [ ] Error state with retry works

### Saved Tab
- [ ] Displays all saved movies
- [ ] Movie cards match Movies tab style
- [ ] Tapping movie navigates to detail
- [ ] Detail screen works offline
- [ ] Empty state shows when no saved movies
- [ ] Pull-to-refresh works
- [ ] Updates when movie saved from detail screen

### Theming
- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] Theme switches with system preference
- [ ] No hardcoded colors visible

### Error Handling
- [ ] Network error shows friendly message
- [ ] 401 error shows API key message
- [ ] 404 error shows not found message
- [ ] 429 error shows rate limit message
- [ ] Retry button works on all errors

### Offline Testing
- [ ] Save movie while online
- [ ] Turn off network
- [ ] Navigate to Saved tab
- [ ] Open saved movie detail
- [ ] Verify all information displays
- [ ] Restart app
- [ ] Verify saved movies persist
- [ ] Verify detail screen works offline

## Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Environment Variables

Required environment variables (set in `.env`):
- `EXPO_PUBLIC_TMDB_API_KEY`: Your TMDB API key
- `EXPO_PUBLIC_TMDB_BASE_URL`: TMDB API base URL (default: https://api.themoviedb.org/3)
- `EXPO_PUBLIC_TMDB_IMAGE_BASE_URL`: TMDB image base URL (default: https://image.tmdb.org/t/p/w500)

## License

Private project for take-home assessment.

