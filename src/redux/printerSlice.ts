import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import PrinterPlugin, { PrinterConfig } from '@/model/ts/plugins/printer-escpos';


export const printAsync = createAsyncThunk('printer/print', async (printerConfig: PrinterConfig, { dispatch, rejectWithValue }) => {
  try {
    const result = await PrinterPlugin.printTicket(printerConfig);

    if (!result.success) {
      return rejectWithValue({ id: result.id, success: false, message: result.message ?? "Error desconocido" });
    }

    return { id: result.id, success: true, message: result.message };
  } catch (err) {
    return rejectWithValue({ id: printerConfig.id, success: false, message: (err as Error).message });
  }
});

const printerSlice = createSlice({
  name: 'printer',
  initialState: { jobs: [] as any[] },
  reducers: {
    addJob: (state, action) => {
      state.jobs.push({
        id: action.payload.id,
        status: 'queued',
        message: action.payload.message,
        timestamp: Date.now(),
      });
    },
    removeJob: (state, action) => {
      state.jobs = state.jobs.filter(job => job.id !== action.payload.id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(printAsync.pending, (state, action) => {
        const job = state.jobs.find(j => j.id === action.meta.arg.id);
        if (job) job.status = "printing";
      })
      .addCase(printAsync.fulfilled, (state, action) => {
        const { id, message } = action.payload as { id: number, message: string };

        const job = state.jobs.find(j => j.id === id);
        if (job) {
          job.status = "success";
          job.message = message;
        };
      })
      .addCase(printAsync.rejected, (state, action) => {

        const { id, message } = action.payload as { id: number, message: string };

        const job = state.jobs.find(j => j.id === id);
        if (job) {
          job.status = "error";
          job.message = message;
        }
      });
  }
});

export const { addJob, removeJob } = printerSlice.actions;
export default printerSlice.reducer;
