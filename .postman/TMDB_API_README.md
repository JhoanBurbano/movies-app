# TMDB API Postman Collection

This Postman collection contains all the TMDB API requests used in the MovieX application.

## 📦 Import Instructions

1. Open Postman
2. Click **Import** button (top left)
3. Select the `TMDB_API.postman_collection.json` file
4. The collection will be imported with all requests

## 🔑 Setup Variables

Before using the collection, you need to set up the environment variables:

### Required Variables

1. **`api_key`**: Your TMDB API key
   - Get your API key at: https://www.themoviedb.org/settings/api
   - Replace `YOUR_TMDB_API_KEY_HERE` in the collection variables

2. **`base_url`**: TMDB API base URL (already set to `https://api.themoviedb.org/3`)

### Optional Variables

- **`movie_id`**: Example movie ID (default: 550 - Fight Club)
- **`search_query`**: Example search query (default: "inception")

## 📋 Available Requests

### Movies Endpoints

#### 1. Get Popular Movies
- **Method**: `GET`
- **Endpoint**: `/movie/popular`
- **Query Parameters**:
  - `api_key` (required): Your TMDB API key
  - `page` (optional): Page number (default: 1)
- **Description**: Fetches a list of popular movies from TMDB

#### 2. Get Upcoming Movies
- **Method**: `GET`
- **Endpoint**: `/movie/upcoming`
- **Query Parameters**:
  - `api_key` (required): Your TMDB API key
  - `page` (optional): Page number (default: 1)
- **Description**: Fetches a list of upcoming movies from TMDB

#### 3. Get Top Rated Movies
- **Method**: `GET`
- **Endpoint**: `/movie/top_rated`
- **Query Parameters**:
  - `api_key` (required): Your TMDB API key
  - `page` (optional): Page number (default: 1)
- **Description**: Fetches a list of top rated movies from TMDB, ordered by rating. This endpoint is equivalent to a discover call with specific filters.

#### 4. Get Movie Details
- **Method**: `GET`
- **Endpoint**: `/movie/{movie_id}`
- **Path Parameters**:
  - `movie_id` (required): The movie ID
- **Query Parameters**:
  - `api_key` (required): Your TMDB API key
- **Description**: Fetches detailed information about a specific movie

### Search Endpoints

#### 5. Search Movies
- **Method**: `GET`
- **Endpoint**: `/search/movie`
- **Query Parameters**:
  - `api_key` (required): Your TMDB API key
  - `query` (required): Search query string (URL encoded)
  - `page` (optional): Page number (default: 1)
- **Description**: Searches for movies by query string

## 🔧 Usage Examples

### Example 1: Get Popular Movies
```
GET https://api.themoviedb.org/3/movie/popular?api_key=YOUR_API_KEY&page=1
```

### Example 2: Get Top Rated Movies
```
GET https://api.themoviedb.org/3/movie/top_rated?api_key=YOUR_API_KEY&page=1
```

### Example 3: Get Movie Details
```
GET https://api.themoviedb.org/3/movie/550?api_key=YOUR_API_KEY
```

### Example 4: Search Movies
```
GET https://api.themoviedb.org/3/search/movie?api_key=YOUR_API_KEY&query=inception&page=1
```

## 📝 Response Format

All endpoints return JSON responses. The structure varies by endpoint:

### Popular/Upcoming/Top Rated Movies Response
```json
{
  "page": 1,
  "results": [
    {
      "id": 550,
      "title": "Fight Club",
      "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "backdrop_path": "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
      "overview": "A ticking-time-bomb insomniac...",
      "vote_average": 8.433,
      "vote_count": 26280,
      "release_date": "1999-10-15"
    }
  ],
  "total_pages": 500,
  "total_results": 10000
}
```

### Movie Details Response
```json
{
  "id": 550,
  "title": "Fight Club",
  "overview": "A ticking-time-bomb insomniac...",
  "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "backdrop_path": "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
  "vote_average": 8.433,
  "vote_count": 26280,
  "release_date": "1999-10-15",
  "genres": [
    { "id": 18, "name": "Drama" }
  ],
  "runtime": 139,
  "original_language": "en",
  "status": "Released"
}
```

## ⚠️ Error Handling

The app handles the following error codes:

- **401 Unauthorized**: Invalid API key
- **404 Not Found**: Resource not found
- **429 Rate Limit**: Too many requests
- **500-504 Server Error**: Server issues
- **Network Error**: Connection problems
- **Timeout**: Request timeout (10 seconds)

## 🔗 Additional Resources

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Get API Key](https://www.themoviedb.org/settings/api)
- [API Rate Limits](https://developers.themoviedb.org/3/getting-started/request-rate-limiting)

## 📌 Notes

- All requests require authentication via `api_key` query parameter
- The app uses a 10-second timeout for all requests
- Search queries are automatically URL encoded in the app
- Image URLs are constructed using `EXPO_PUBLIC_TMDB_IMAGE_BASE_URL` (default: `https://image.tmdb.org/t/p/w500`)

---

**Last updated**: December 2024  
**Collection version**: 1.0.0

