import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { toast } from 'react-toastify';
import api from '../api';
import { 
  API_QUESTION_ENDPOINT, 
  ERROR_EMPTY_QUESTION, 
  ERROR_NO_FILE_UPLOAD, 
  ERROR_GETTING_ANSWER, 
  PLACEHOLDER_TEXT 
} from '../constants';

// Message bubble styles
const userMessageStyle = {
  backgroundColor: '#e3f2fd',
  borderRadius: '18px 18px 0 18px',
  padding: '10px 15px',
  marginBottom: '8px',
  maxWidth: '80%',
  alignSelf: 'flex-end',
  wordBreak: 'break-word'
};

const aiMessageStyle = {
  backgroundColor: '#f5f5f5',
  borderRadius: '18px 18px 18px 0',
  padding: '10px 15px',
  marginBottom: '8px',
  maxWidth: '80%',
  alignSelf: 'flex-start',
  wordBreak: 'break-word'
};

const ChatInterface = ({ fileHash }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      toast.error(ERROR_EMPTY_QUESTION, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!fileHash) {
      toast.error(ERROR_NO_FILE_UPLOAD, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const userMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post(API_QUESTION_ENDPOINT, {
        question: userMessage.text,
        file_hash: fileHash,
      });

      const aiMessage = {
        text: response.data.answer,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error getting answer:', error);
      toast.error(error.response?.data?.detail || ERROR_GETTING_ANSWER, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, height: '500px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Ask questions about the document
      </Typography>
      <Box
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          mb: 2, 
          display: 'flex', 
          flexDirection: 'column',
          p: 2
        }}
      >
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 10 }}>
            Ask a question about the PDF to start the conversation
          </Typography>
        ) : (
          messages.map((message, index) => (
            <Box 
              key={index} 
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Box sx={message.sender === 'user' ? userMessageStyle : aiMessageStyle}>
                <Typography variant="body1">{message.text}</Typography>
              </Box>
            </Box>
          ))
        )}
        {loading && (
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              mb: 2
            }}
          >
            <Box sx={aiMessageStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body1">Thinking...</Typography>
              </Box>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={PLACEHOLDER_TEXT}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading || !fileHash}
          multiline
          maxRows={3}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={loading || !inputText.trim() || !fileHash}
                  sx={{ 
                    bgcolor: inputText.trim() && !loading ? 'primary.main' : 'grey.300',
                    color: 'white',
                    '&:hover': {
                      bgcolor: inputText.trim() && !loading ? 'primary.dark' : 'grey.300',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'grey.300',
                      color: 'grey.500',
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Paper>
  );
};

export default ChatInterface;
