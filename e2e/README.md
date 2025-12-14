# End-to-End Tests with Maestro

This directory contains end-to-end (e2e) tests for the Collars Movies app using [Maestro](https://maestro.mobile.dev/), a modern mobile testing framework.

## Prerequisites

1. **Install Maestro**:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

   Or using Homebrew (macOS):
   ```bash
   brew tap mobile-dev-inc/tap
   brew install maestro
   ```

2. **Build the app**:
   - For iOS: Build using `npx expo run:ios` or create a development build
   - For Android: Build using `npx expo run:android` or create a development build

## Test Files

| File | Description |
|------|-------------|
| `01-navigation.yaml` | Tests navigation between Movies and Saved tabs |
| `02-movies-list.yaml` | Tests Popular, Upcoming, and Top Rated movie lists |
| `03-search.yaml` | Tests movie search functionality |
| `04-movie-detail.yaml` | Tests movie detail screen and overview expand/collapse |
| `05-save-movie.yaml` | Tests save/unsave movie functionality |
| `06-pull-to-refresh.yaml` | Tests pull-to-refresh on both screens |
| `07-theme-toggle.yaml` | Tests theme switching (light/dark/system) |
| `08-saved-screen.yaml` | Tests saved movies screen and empty states |
| `09-offline-support.yaml` | Tests offline functionality for saved movies |
| `10-error-handling.yaml` | Tests error states and retry functionality |

## Running Tests

### iOS

1. **Start the app**:
   ```bash
   npx expo run:ios
   ```

2. **Get the app ID**:
   ```bash
   maestro test --format junit e2e/01-navigation.yaml
   ```
   Maestro will show the app ID if needed.

3. **Run a single test**:
   ```bash
   maestro test e2e/01-navigation.yaml
   ```

4. **Run all tests**:
   ```bash
   maestro test e2e/
   ```

### Android

1. **Start the app**:
   ```bash
   npx expo run:android
   ```

2. **Run tests**:
   ```bash
   maestro test e2e/01-navigation.yaml
   ```

### Using Environment Variables

Set the app ID as an environment variable:

```bash
export APP_ID=com.collars.movies
maestro test e2e/
```

Or inline:
```bash
APP_ID=com.collars.movies maestro test e2e/
```

## Test Structure

Each test file follows this structure:

```yaml
appId: ${APP_ID}
---
# Test description
- launchApp
- assertVisible: "Element"
- tapOn: "Button"
- waitForAnimationToEnd
```

## Common Maestro Commands

- `launchApp`: Launches the app
- `assertVisible`: Asserts an element is visible
- `tapOn`: Taps on an element
- `inputText`: Inputs text
- `scroll`: Scrolls in a direction
- `back`: Navigates back
- `waitForAnimationToEnd`: Waits for animations to complete
- `clearText`: Clears text input

## Notes

1. **Optional Elements**: Some tests use `optional: true` for elements that may not always be present (e.g., when no movies are saved).

2. **Point Coordinates**: Some tests use `point: "50%,30%"` for tapping when specific element IDs are not available. Adjust these based on your screen layout.

3. **Network Requirements**: Some tests require network connectivity. The offline test (`09-offline-support.yaml`) requires disabling network.

4. **Timing**: Tests include `waitForAnimationToEnd` to handle loading states. Adjust timing if needed.

## CI/CD Integration

Maestro can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Maestro Tests
  run: |
    maestro test e2e/ --format junit > test-results.xml
```

## Troubleshooting

1. **App not found**: Ensure the app is built and installed on the device/simulator.

2. **Elements not found**: 
   - Check that element text matches exactly
   - Use `optional: true` for conditional elements
   - Verify app state before assertions

3. **Tests timing out**: 
   - Add more `waitForAnimationToEnd` calls
   - Increase timeout values if needed

4. **Flaky tests**: 
   - Add explicit waits
   - Use more specific selectors
   - Check for race conditions

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro Best Practices](https://maestro.mobile.dev/getting-started/best-practices)
- [Maestro Commands Reference](https://maestro.mobile.dev/reference/commands)

