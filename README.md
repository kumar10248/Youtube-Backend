```md
# YouTube Backend

This is the backend for a YouTube-like application built with Node.js, Express, and MongoDB.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/utube_backend.git
    cd utube_backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add your environment variables (see [Environment Variables](#environment-variables)).

## Usage

To start the development server, run:
```sh
npm run dev
```

## Environment Variables

The following environment variables are required:

- `PORT`: The port on which the server will run.
- `MONGODB_URI`: The MongoDB connection string.
- `CORS_ORIGIN`: The allowed origin for CORS.
- `ACCESS_TOKEN_SECRET`: The secret key for access tokens.
- `ACCESS_TOKEN_EXPIRY`: The expiry time for access

 tokens

.
- `REFRESH_TOKEN_SECRET`: The secret key for signing refresh tokens.
- `REFRESH_TOKEN_EXPIRY`: The expiry time for refresh tokens.

Example `.env` file:
```
PORT=8000
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
```

## Project Structure

```
.env
.gitignore
.prettierignore
.prettierrc


package.json


public/
  temp/
    .gitkeep


README.md


src/
  

app.js


  

constants.js


  controllers/
    

comment.controller.js


    

dashboard.controller.js


    

healthcheck.controller.js


    

like.controller.js


    

playlist.controller.js


    

subscription.controller.js


    

tweet.controller.js


    

user.controller.js


    

video.controller.js


  db/
    

db.js


  

index.js


  middlewares/
    

auth.middleware.js


    

multer.middleware.js


  models/
    

comments.model.js


    

like.model.js


    

playlist.model.js


    

subscription.model.js


    

tweet.model.js


    

user.model.js


    

video.model.js


  routes/
    

comment.routes.js


    

dashboard.routes.js


    

healthcheck.routes.js


    

like.routes.js


    

playlist.routes.js


    

subscription.routes.js


    

tweet.routes.js


    

user.routes.js


    

video.routes.js


  utils/
    

apiError.js


    

ApiResponse.js


    

asyncHandler.js


    cloudinary.js
```

## API Endpoints

### Authentication

- `POST /auth/login`: Login a user.
- `POST /auth/register`: Register a new user.
- `POST /auth/refresh-token`: Refresh access token.

### Users

- `GET /users`: Get all users.
- `GET /users/:id`: Get a user by ID.
- `PUT /users/:id`: Update a user by ID.
- `DELETE /users/:id`: Delete a user by ID.

### Videos

- `GET /videos`: Get all videos.
- `GET /videos/:id`: Get a video by ID.
- `POST /videos`: Create a new video.
- `PUT /videos/:id`: Update a video by ID.
- `DELETE /videos/:id`: Delete a video by ID.

### Comments

- `GET /comments/:videoId`: Get all comments for a video.
- `POST /comments/:videoId`: Add a comment to a video.
- `PATCH /comments/c/:commentId`: Update a comment.
- `DELETE /comments/c/:commentId`: Delete a comment.

### Likes

- `POST /likes/toggle/v/:videoId`: Toggle like on a video.
- `POST /likes/toggle/c/:commentId`: Toggle like on a comment.
- `POST /likes/toggle/t/:tweetId`: Toggle like on a tweet.
- `GET /likes/videos`: Get all liked videos.

### Playlists

- `POST /playlists`: Create a new playlist.
- `GET /playlists/:playlistId`: Get a playlist by ID.
- `PATCH /playlists/:playlistId`: Update a playlist.
- `DELETE /playlists/:playlistId`: Delete a playlist.
- `PATCH /playlists/add/:videoId/:playlistId`: Add a video to a playlist.
- `PATCH /playlists/remove/:videoId/:playlistId`: Remove a video from a playlist.
- `GET /playlists/user/:userId`: Get all playlists of a user.

### Subscriptions

- `GET /subscriptions/c/:channelId`: Get subscribed channels.
- `POST /subscriptions/c/:channelId`: Toggle subscription.
- `GET /subscriptions/u/:subscriberId`: Get user channel subscribers.

### Tweets

- `POST /tweets`: Create a tweet.
- `GET /tweets/user/:userId`: Get user tweets.
- `PATCH /tweets/:tweetId`: Update a tweet.
- `DELETE /tweets/:tweetId`: Delete a tweet.

### Dashboard

- `GET /dashboard/stats`: Get channel stats.
- `GET /dashboard/videos`: Get all videos uploaded by the channel.

### Healthcheck

- `GET /healthcheck`: Healthcheck endpoint.

## License

This project is licensed under the ISC License.
```