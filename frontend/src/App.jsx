import React, { useState } from 'react';
import FileUpload from './components/FileUpload.jsx';

function App() {
  const [fileHash, setFileHash] = useState('');

  const handleFileUploaded = (hash) => {
    setFileHash(hash);
  };

  return (
    <>
      <FileUpload onFileUploaded={handleFileUploaded} />
    </>
  );
}

export default App;
