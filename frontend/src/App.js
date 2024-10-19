import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
    const [html, setHtml] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState(null);
    const [images, setImages] = useState([]);
    const [base64, setBase64] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleConvert = async () => {
        setIsLoading(true);
        setProgress(0);

        try {
            const response = await axios.post('http://localhost:3001/convert', { html }, {
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    const total = progressEvent.total;
                    const current = progressEvent.loaded;
                    const percentCompleted = Math.floor((current / total) * 100);
                    setProgress(percentCompleted);
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'output.docx');
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Conversión completa');
        } catch (error) {
            console.error('Error during conversion request:', error);
            toast.error('Error durante la conversión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Por favor selecciona un archivo');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);
        setProgress(0);

        try {
            const response = await axios.post('http://localhost:3001/upload', formData, {
                responseType: 'blob',
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total;
                    const current = progressEvent.loaded;
                    const percentCompleted = Math.floor((current / total) * 100);
                    setProgress(percentCompleted);
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'output.docx');
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Conversión completa');
        } catch (error) {
            console.error('Error during file upload:', error);
            toast.error('Error durante la conversión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadImages = async () => {
        if (!file) {
            toast.error('Por favor selecciona un archivo');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);
        setProgress(0);

        try {
            const response = await axios.post('http://localhost:3001/upload-images', formData, {
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total;
                    const current = progressEvent.loaded;
                    const percentCompleted = Math.floor((current / total) * 100);
                    setProgress(percentCompleted);
                }
            });

            setImages(response.data.images);

            toast.success('Imágenes procesadas y guardadas en la carpeta out_images');
        } catch (error) {
            console.error('Error during image processing:', error);
            toast.error('Error durante el procesamiento de imágenes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBase64ToPng = async () => {
        if (!base64) {
            toast.error('Por favor pega un código de imagen base64');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/base64-to-png', { base64 }, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'image.png');
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Imagen convertida y descargada');
        } catch (error) {
            console.error('Error during base64 to PNG conversion:', error);
            toast.error('Error durante la conversión de base64 a PNG');
        }
    };

    return (
        <div className="App container">
            <h1>Convertir HTML a DOCX</h1>
            <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Pega tu código HTML aquí"
                className="form-control"
            />
            <button onClick={handleConvert} disabled={isLoading} className="btn btn-primary mt-3">
                {isLoading ? `Procesando... ${progress}%` : 'Convertir a DOC'}
            </button>
            <div className="mt-3">
                <input type="file" accept=".txt" onChange={handleFileChange} className="form-control-file" />
                <button onClick={handleUpload} disabled={isLoading || !file} className="btn btn-secondary mt-3">
                    {isLoading ? `Cargando... ${progress}%` : 'Cargar y Convertir'}
                </button>
                <button onClick={handleUploadImages} disabled={isLoading || !file} className="btn btn-info mt-3 ml-2">
                    {isLoading ? `Procesando... ${progress}%` : 'Procesar Imágenes'}
                </button>
            </div>
            {isLoading && <div className="progress mt-3">
                <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }}></div>
            </div>}
            <div className="mt-3">
                <h2>Convertir Base64 a PNG</h2>
                <textarea
                    value={base64}
                    onChange={(e) => setBase64(e.target.value)}
                    placeholder="Pega tu código base64 aquí"
                    className="form-control"
                    rows="5"
                />
                <button onClick={handleBase64ToPng} className="btn btn-success mt-3">
                    Convertir y Descargar PNG
                </button>
            </div>
            <div className="row mt-3">
                {images.map((image, index) => (
                    <div key={index} className="col-md-3">
                        <div className="card mb-3 shadow-sm">
                            <img src={image} className="card-img-top rounded" alt={`Procesada ${index + 1}`} />
                            <div className="card-body">
                                <h5 className="card-title">Imagen {index + 1}</h5>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <ToastContainer />
        </div>
    );
};

export default App;





















