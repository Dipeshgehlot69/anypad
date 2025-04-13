# AnyPad - Real-time Collaborative Whiteboard

AnyPad is a real-time collaborative whiteboard application where multiple users can share text, images, and links in a shared workspace.

## Features

- Real-time collaboration
- Text editing
- Image uploads
- Link sharing
- Draggable elements
- Multiple users per board
- Simple board creation and joining

## Setup

### Backend Setup

1. Navigate to the root directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `public/uploads` directory for file uploads
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Open the application in your browser (default: http://localhost:3000)
2. Create a new board by clicking "Create New Board"
3. Share the generated Board ID with others
4. Other users can join by entering the Board ID and clicking "Join"
5. Start collaborating in real-time!

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - Socket.io-client
  - React-draggable
  - React-dropzone

- Backend:
  - Node.js
  - Express
  - Socket.io
  - Multer (for file uploads)