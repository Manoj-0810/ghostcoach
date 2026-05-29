import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { uploadSession } from '../services/api';
import { useAuth } from './AuthContext';

const UploadContext = createContext(null);

export function UploadProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const abortControllerRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Clear upload state automatically on logout/unauthenticated shifts
  useEffect(() => {
    if (!isAuthenticated) {
      resetUploadState();
    }
  }, [isAuthenticated]);

  // Sync deletion event with cached result
  useEffect(() => {
    const handleSessionDeleted = (e) => {
      if (result && result.id === e.detail.id) {
        setResult(null);
      }
    };
    window.addEventListener('session-deleted', handleSessionDeleted);
    return () => window.removeEventListener('session-deleted', handleSessionDeleted);
  }, [result]);

  const resetUploadState = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setFile(null);
    setPreview(null);
    setLoading(false);
    setError('');
    setResult(null);
    setDragActive(false);
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setError('Analysis cancelled.');
  };

  const executeUpload = async (selectedFile) => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    setResult(null);

    // Instantiate new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await uploadSession(selectedFile, { signal: controller.signal });
      setResult(res.data.data);
      return res.data.data;
    } catch (err) {
      if (axios.isCancel(err) || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        setError('Analysis cancelled.');
        return null;
      }
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <UploadContext.Provider
      value={{
        file,
        setFile,
        preview,
        setPreview,
        loading,
        setLoading,
        error,
        setError,
        result,
        setResult,
        dragActive,
        setDragActive,
        resetUploadState,
        cancelUpload,
        executeUpload,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
}

export default UploadContext;
