import { enviarEmailSunat } from '@/network/rest/principal.network';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface EmailPayload {
  to: {
    address: string;
    name?: string;
  };
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    href: string;
    contentType?: string;
  }[];
}

interface EmailJob {
  id: number;
  to: string;
  status: 'sending' | 'success' | 'error';
  message: string;
  timestamp: number;
}

interface EmailAsyncPayload {
  id: number;
  payload: EmailPayload;
}

export const emailAsync = createAsyncThunk(
  'email/send',
  async ({ id, payload }: EmailAsyncPayload, { rejectWithValue }) => {
    try {
      const result = await enviarEmailSunat(payload);

      if (!result.success) {
        return rejectWithValue({
          id,
          error: result.message ?? 'Error al enviar el correo',
        });
      }

      return {
        id,
        success: true,
        message: result.message ?? 'Correo enviado correctamente',
      };

    } catch (error) {
      return rejectWithValue({
        id,
        error: (error as Error).message ?? 'Error desconocido',
      });
    }
  }
);

const emailSlice = createSlice({
  name: 'email',
  initialState: {
    jobs: [] as EmailJob[],
  },
  reducers: {
    removeJob: (state, action) => {
      state.jobs = state.jobs.filter(
        job => job.id !== action.payload.id
      );
    },
  },
  extraReducers: builder => {
    builder
      .addCase(emailAsync.pending, (state, action) => {
        const { id, payload } = action.meta.arg;

        state.jobs.push({
          id,
          to: payload.to.address,
          status: 'sending',
          message: 'Enviando correo...',
          timestamp: Date.now(),
        });
      })
      .addCase(emailAsync.fulfilled, (state, action) => {
        const job = state.jobs.find(
          j => j.id === action.payload.id
        );

        if (job) {
          job.status = 'success';
          job.message = action.payload.message;
        }
      })
      .addCase(emailAsync.rejected, (state, action) => {
        const id = action.meta.arg.id;
        const job = state.jobs.find(j => j.id === id);

        if (job) {
          job.status = 'error';
          job.message =
            (action.payload as { error: string } | undefined)?.error ??
            action.error.message ??
            'Error desconocido';
        }
      });
  },
});

export const { removeJob } = emailSlice.actions;
export default emailSlice.reducer;