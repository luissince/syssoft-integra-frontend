
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import ErrorResponse from '@/model/class/error-response';
import { sendDocumentWhatsapp, sendTextWhatsapp } from '@/network/rest/api-client';

interface WhatsAppMessage {
  id: string;
  to: string;
  message: string;
  type: 'text' | 'pdf';
  status: 'pending' | 'success' | 'error';
  timestamp: number;
  error?: string;
}

interface SendWhatsAppPayload {
  id: string;
  to: string;
  message: string;
  type: 'text' | 'pdf';
  url?: string;
  filename?: string;
  caption?: string;
}

interface SendWhatsAppResult {
  id: string;
  success: boolean;
}

interface SendWhatsAppError {
  id: string;
  error: string;
}

interface WhatsAppState {
  messages: WhatsAppMessage[];
}

const initialState: WhatsAppState = {
  messages: [],
};

/**
 * Thunk para enviar mensajes de WhatsApp.
 * Permite enviar texto o documentos PDF.
 */
export const sendWhatsAppAsync = createAsyncThunk<
  SendWhatsAppResult,
  SendWhatsAppPayload,
  { rejectValue: SendWhatsAppError }
>(
  'whatsapp/sendMessage',
  async (params, { rejectWithValue }) => {
    const { id, to, message, type, url, filename, caption } = params;

    try {
      let response;

      if (type === 'text') {
        response = await sendTextWhatsapp({
          to,
          message,
        });
      } else {
        if (!url || !filename) {
          return rejectWithValue({
            id,
            error: 'La URL y el nombre del PDF son obligatorios.',
          });
        }

        response = await sendDocumentWhatsapp({
          to,
          url,
          filename,
          caption: caption ?? message,
        });
      }

      if (!response.success) {
        return rejectWithValue({
          id,
          error: response.message,
        });
      }

      return {
        id,
        success: true,
      };
    } catch (error: unknown) {
      let messageError = 'Error enviando mensaje por WhatsApp.';

      if (axios.isAxiosError(error)) {
        const errorResponse = new ErrorResponse(error);
        messageError = errorResponse.getMessage();
      } else if (error instanceof Error) {
        messageError = error.message;
      }

      return rejectWithValue({
        id,
        error: messageError,
      });
    }
  },
);

const whatsappSlice = createSlice({
  name: 'whatsapp',
  initialState,
  reducers: {
    removeWhatsAppMessage: (state, action) => {
      state.messages = state.messages.filter(
        (item) => item.id !== action.payload,
      );
    },

    clearWhatsAppMessages: (state) => {
      state.messages = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(sendWhatsAppAsync.pending, (state, action) => {
        const { id, to, message, type } = action.meta.arg;

        // Evita duplicar el registro si se vuelve a despachar el mismo ID.
        const existing = state.messages.find((item) => item.id === id);

        if (existing) {
          existing.status = 'pending';
          existing.error = undefined;
          return;
        }

        state.messages.push({
          id,
          to,
          message,
          type,
          status: 'pending',
          timestamp: Date.now(),
        });
      })

      .addCase(sendWhatsAppAsync.fulfilled, (state, action) => {
        const item = state.messages.find(
          (message) => message.id === action.payload.id,
        );

        if (item) {
          item.status = 'success';
          item.error = undefined;
        }
      })

      .addCase(sendWhatsAppAsync.rejected, (state, action) => {
        const payload = action.payload;

        const id = payload?.id ?? action.meta.arg.id;
        const item = state.messages.find((message) => message.id === id);

        if (item) {
          item.status = 'error';
          item.error =
            payload?.error ??
            action.error.message ??
            'No se pudo enviar el mensaje.';
        }
      });
  },
});

export const {
  removeWhatsAppMessage,
  clearWhatsAppMessages,
} = whatsappSlice.actions;

export default whatsappSlice.reducer;
