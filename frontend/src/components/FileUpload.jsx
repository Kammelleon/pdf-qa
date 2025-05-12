import React, { useRef, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-toastify';
import api from '../api';
import {
  API_UPLOAD_ENDPOINT, 
  ERROR_NO_FILE, 
  ERROR_UPLOAD_FILE
} from '../constants';
import { validatePdfFile } from '../utils/PdfValidator.jsx';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const FileUpload = ({ onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    await processFile(droppedFile);
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    await processFile(selectedFile);
  };

  const handleDropZoneClick = () => {
    fileInputRef.current.click();
  };

  const processFile = async (selectedFile) => {
    setFile(null);
    setFileName('');

    if (!selectedFile) return;

    try {
      const validationResult = await validatePdfFile(selectedFile);

      if (!validationResult.isValid) {
        if (validationResult.error) {
          toast.error(validationResult.error, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
    } catch (error) {
      console.error('Error validating PDF:', error);
      toast.error('Error validating PDF file', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error(ERROR_NO_FILE, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setUploadLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(API_UPLOAD_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onFileUploaded(response.data.file_hash);
      toast.success(`File "${response.data.filename}" uploaded successfully!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.detail || ERROR_UPLOAD_FILE, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Upload PDF Document
      </Typography>

      {/* Drag and drop area */}
      <Box
        sx={{
          border: isDragging ? '2px dashed #1976d2' : '2px dashed #cccccc',
          borderRadius: '4px',
          p: 3,
          mb: 3,
          backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
          transition: 'all 0.3s',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.04)'
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDropZoneClick}
      >
        {fileName ? (
          <Typography variant="body1" align="center" sx={{ color: isDragging ? '#1976d2' : 'text.primary' }}>
            Selected file: <strong>{fileName}</strong>
          </Typography>
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 60, color: isDragging ? '#1976d2' : '#757575', mb: 2 }} />
            <Typography variant="body1" align="center" sx={{ color: isDragging ? '#1976d2' : 'text.secondary' }}>
              Drag and drop a PDF file here or select the file from disk
            </Typography>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          style={{ display: 'none' }}
        />
      </Box>

      {/* Upload button */}
      <Button
        variant="contained"
        onClick={handleFileUpload}
        disabled={!file || uploadLoading}
        startIcon={uploadLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
      >
        {uploadLoading ? 'Uploading...' : 'Upload'}
      </Button>
    </Paper>
  );
};

export default FileUpload;
