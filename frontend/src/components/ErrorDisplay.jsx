import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

const ErrorDisplay = ({ error }) => {
  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);
  return null;
};

export default ErrorDisplay;
