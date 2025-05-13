import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box
} from '@mui/material';
import FileUpload from './components/FileUpload.jsx';
import ChatInterface from './components/ChatInterface.jsx';


function App() {
  const [fileHash, setFileHash] = useState('');

  const handleFileUploaded = (hash) => {
    setFileHash(hash);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          PDF Document Question Answering
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Upload a PDF file and ask questions about its content
        </Typography>
        <FileUpload
          onFileUploaded={handleFileUploaded}
        />
        {fileHash && (
          <ChatInterface
            key={fileHash}
            fileHash={fileHash}
          />
        )}
      </Box>
    </Container>
  );
}

export default App;
