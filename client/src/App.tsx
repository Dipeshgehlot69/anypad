import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Box, TextField, Button, Typography, Paper, IconButton } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Draggable from 'react-draggable';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';

interface Element {
  id: string;
  type: 'text' | 'image' | 'link';
  content: string;
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [boardId, setBoardId] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [elements, setElements] = useState<Element[]>([]);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('board-state', (state) => {
      setContent(state.content);
      setElements(state.elements);
    });

    socket.on('content-updated', (newContent) => {
      setContent(newContent);
    });

    socket.on('element-added', (element) => {
      setElements(prev => [...prev, element]);
    });
  }, [socket]);

  const createNewBoard = () => {
    if (!socket) return;
    const newBoardId = Math.random().toString(36).substring(7);
    setBoardId(newBoardId);
    setIsCreator(true);
    socket.emit('join-board', newBoardId);
  };

  const joinBoard = () => {
    if (!socket || !boardId) return;
    socket.emit('join-board', boardId);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (socket) {
      socket.emit('update-content', { boardId, content: newContent });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (!socket) return;
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        const element: Element = {
          id: Math.random().toString(36).substring(7),
          type: 'image',
          content: reader.result as string,
          x: 100,
          y: 100
        };
        socket.emit('add-element', { boardId, element });
      };
      reader.readAsDataURL(file);
    }
  });

  const addLink = () => {
    if (!socket) return;
    const url = prompt('Enter URL:');
    if (url) {
      const element: Element = {
        id: Math.random().toString(36).substring(7),
        type: 'link',
        content: url,
        x: 100,
        y: 100
      };
      socket.emit('add-element', { boardId, element });
    }
  };

  return (
    <Box sx={{ height: '100vh', p: 2 }}>
      {!boardId ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto', mt: 4 }}>
          <Button variant="contained" onClick={createNewBoard}>
            Create New Board
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="Enter Board ID"
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
            />
            <Button variant="contained" onClick={joinBoard}>
              Join
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Typography variant="h6">Board ID: {boardId}</Typography>
            <IconButton {...getRootProps()}>
              <input {...getInputProps()} />
              <AddIcon />
            </IconButton>
            <IconButton onClick={addLink}>
              <LinkIcon />
            </IconButton>
          </Box>
          <Paper
            ref={contentRef}
            sx={{
              flex: 1,
              p: 2,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <TextField
              fullWidth
              multiline
              value={content}
              onChange={handleContentChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            {elements.map((element) => (
              <Draggable key={element.id} defaultPosition={{ x: element.x, y: element.y }}>
                <Box
                  sx={{
                    position: 'absolute',
                    cursor: 'move',
                    p: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1
                  }}
                >
                  {element.type === 'image' && (
                    <img src={element.content} alt="Uploaded" style={{ maxWidth: 200 }} />
                  )}
                  {element.type === 'link' && (
                    <a href={element.content} target="_blank" rel="noopener noreferrer">
                      {element.content}
                    </a>
                  )}
                </Box>
              </Draggable>
            ))}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default App; 