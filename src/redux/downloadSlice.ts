import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getFileNameFromContentDisposition, saveBlob } from '../helper/utils.helper';
import { DownloadSlice } from '@/model/ts/interface/download';
import { downloadProgress } from '@/network/rest/api-client';
import axios from 'axios';

// Definimos el thunk asíncrono para manejar las descargas

/**
 * Thunk para descargar un archivo.
 *
 * @returns {Promise<*>} Resultado de la descarga o rechazo mediante `rejectWithValue`.
 */
export const downloadFileAsync = createAsyncThunk(
  'downloads/downloadFile',
  async (
    {
      id,
      fileName,
      request,
    }: DownloadSlice,
    { dispatch, rejectWithValue, signal }
  ) => {
    try {
      const response = await downloadProgress(request, signal, (progress) => {
        dispatch(
          progressDownload({
            id,
            fileName,
            ...progress,
          })
        );
      });

      const fileNameDownload = getFileNameFromContentDisposition(response.headers['content-disposition']) ?? fileName;

      saveBlob(response.data, fileNameDownload);

      dispatch(
        progressDownload({
          id,
          fileNameDownload,
          progress: 100,
          received: response.data.size,
          total: response.data.size,
        })
      );

      return {
        id,
        success: true,
      };
    } catch (error) {

      let message = error.message || 'Error descargando archivo';

      if (!axios.isAxiosError(error)) {
        message = 'Error desconocido';
      } else {
        const data = error.response?.data;
        if (data instanceof Blob) {
          message = await data.text();
        } else if (typeof data === 'string') {
          message = data;
        } else if (data && typeof data === 'object') {
          message = data.message ?? error.message;
        }
      }

      return rejectWithValue({
        id,
        error: message,
      });
    }
  }
);

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
        timestamp: Date.now(),
      });
    },
    progressDownload: (state, action) => {
      const download = state.downloads.find((d) => d.id === action.payload.id);
      if (download) {
        download.status = 'downloading';
        download.fileName = action.payload.fileName;
        download.progress = action.payload.progress;
        download.received = action.payload.received;
        download.total = action.payload.total;
      }
    },
    successDownload: (state, action) => {
      const download = state.downloads.find((d) => d.id === action.payload.id);
      if (download) {
        download.status = 'success';
      }
    },
    removeDownload: (state, action) => {
      state.downloads = state.downloads.filter(
        (d) => d.id !== action.payload.id,
      );
    },
    errorDownload: (state, action) => {
      const download = state.downloads.find((d) => d.id === action.payload.id);
      if (download) {
        download.status = 'error';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Cuando empieza la descarga
      .addCase(downloadFileAsync.pending, (state, action) => {
        const { id, fileName } = action.meta.arg;

        state.downloads.push({
          id,
          status: 'start',
          fileName: fileName,
          progress: 0,
          received: 0,
          total: 0,
          timestamp: Date.now(),
        });
      })
      // Cuando termina la descarga
      .addCase(downloadFileAsync.fulfilled, (state, action) => {
        const download = state.downloads.find((d) => d.id === action.payload.id);
        if (download) {
          download.status = 'success';
        }
      })
      // Si falla la descarga
      .addCase(downloadFileAsync.rejected, (state, action) => {
        const { id, error } = action.payload as { id: number, error: string };

        const download = state.downloads.find((d) => d.id === id);
        if (download) {
          download.status = 'error';
          download.error = error;
        }
      });
  },
});

export const {
  startDownload,
  progressDownload,
  successDownload,
  removeDownload,
  errorDownload,
} = downloadSlice.actions;

export default downloadSlice.reducer;
