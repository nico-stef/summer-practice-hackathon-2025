import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

export default function CodeEditor({ initialCode, onCodeChange }) {
  const [code, setCode] = useState(initialCode || '');

  useEffect(() => {
    setCode(initialCode || '');
  }, [initialCode]);

  const handleChange = (value, viewUpdate) => {
    setCode(value);
    if (onCodeChange) {
      onCodeChange(value);
    }
  };

  return (
    <CodeMirror
      value={code}
      height="400px"
      extensions={[javascript()]}
      onChange={handleChange}
    />
  );
}
