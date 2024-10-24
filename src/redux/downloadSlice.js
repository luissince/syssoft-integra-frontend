import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { sleep } from '../helper/utils.helper';

// Definimos el thunk asíncrono para manejar las descargas
export const downloadFileAsync = createAsyncThunk('downloads/downloadFile', async (
    { id, url }, { dispatch, rejectWithValue }
) => {
    try {
        // Obtener el objeto blob
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Verificar las cabeceras de la respuesta
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileName = contentDisposition ?
            contentDisposition.split(';')
                .find(n => n.includes('filename='))
                ?.split('=')[1]
                .replaceAll('"', '') : 'Reporte.xlsx';

        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');

        let receivedLength = 0;
        let chunks = [];

        const process = true;

        while (process) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }
            chunks.push(value);
            receivedLength += value.length;

            const progress = Math.round((receivedLength / contentLength) * 100);
            await sleep(500)
            dispatch(progressDownload({ id, fileName, progress, received: receivedLength, total: contentLength }));
        }

        // const blob = new Blob(chunks);
        const blob = new Blob(chunks, {
            type: response.headers.get('content-type')
        });

        // Crear un objeto URL temporal
        const blobUrl = window.URL.createObjectURL(blob);

        // Crear un enlace temporal y activar la descarga
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.click();

        // Limpiar el objeto URL temporal
        window.URL.revokeObjectURL(blobUrl);

        return { id, success: true };
    } catch (error) {
        return rejectWithValue({ id, error: error.message ?? "Ocurrió un error inesperado" });
    }
});

const downloadSlice = createSlice({
    name: 'downloads',
    initialState: {
        downloads: [],
    },
    reducers: {
        startDownload: (state, action) => {
            const { id, url } = action.payload;
            state.downloads.push({
                id,
                url,
                status: 'start',
                fileName: '',
                progress: 0,
                received: 0,
                total: 0,
                timestamp: Date.now()
            });
        },
        progressDownload: (state, action) => {
            const download = state.downloads.find(d => d.id === action.payload.id);
            if (download) {
                download.status = 'downloading';
                download.fileName = action.payload.fileName;
                download.progress = action.payload.progress;
                download.received = action.payload.received;
                download.total = action.payload.total;
            }
        },
        successDownload: (state, action) => {
            const download = state.downloads.find(d => d.id === action.payload.id);
            if (download) {
                download.status = 'success';
            }
        },
        removeDownload: (state, action) => {
            state.downloads = state.downloads.filter(d => d.id !== action.payload.id);
        },
        errorDownload: (state, action) => {
            const download = state.downloads.find(d => d.id === action.payload.id);
            if (download) {
                download.status = 'error';
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Cuando empieza la descarga
            .addCase(downloadFileAsync.pending, (state, action) => {
                const { id, url } = action.meta.arg;
                state.downloads.push({
                    id,
                    url,
                    status: 'start',
                    fileName: '',
                    progress: 0,
                    received: 0,
                    total: 0,
                    timestamp: Date.now()
                });
            })
            // Cuando termina la descarga
            .addCase(downloadFileAsync.fulfilled, (state, action) => {
                const download = state.downloads.find(d => d.id === action.payload.id);
                if (download) {
                    download.status = 'success';
                }
            })
            // Si falla la descarga
            .addCase(downloadFileAsync.rejected, (state, action) => {
                const download = state.downloads.find(d => d.id === action.payload.id);
                if (download) {
                    download.status = 'error';
                    download.error = action.payload.error;
                }
            })
    },
});

export const { startDownload, progressDownload, successDownload, removeDownload, errorDownload } = downloadSlice.actions;

export default downloadSlice.reducer;