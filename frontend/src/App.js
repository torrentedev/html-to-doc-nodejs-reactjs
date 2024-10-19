import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/convert', { html }, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'output.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Conversión exitosa');
    } catch (error) {
      toast.error('Ha pasado un error');
    }
    setIsLoading(false);
  };

  return (
    <div className="App">
      <h1>Convertir HTML a DOCX</h1>
      <textarea
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        placeholder="Pega tu código HTML aquí"
      />
      <button onClick={handleConvert}>
        {isLoading ? 'Procesando la solicitud...' : 'Convertir a DOC'}
      </button>
      <ToastContainer />
    </div>
  );
};

export default App;
