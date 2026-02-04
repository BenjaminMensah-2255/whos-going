import mongoose, { Schema, model, models, Document } from 'mongoose';

export type RunStatus = 'open' | 'closed' | 'completed';

export interface IRun extends Document {
  _id: mongoose.Types.ObjectId;
  vendorName: string;
  runnerUserId: mongoose.Types.ObjectId;
  departureTime: Date;
  note?: string;
  status: RunStatus;
  createdAt: Date;
  updatedAt: Date;
}

const RunSchema = new Schema<IRun>(
  {
    vendorName: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
      minlength: [2, 'Vendor name must be at least 2 characters'],
      maxlength: [100, 'Vendor name must be less than 100 characters'],
    },
    runnerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Runner user ID is required'],
    },
    departureTime: {
      type: Date,
      required: [true, 'Departure time is required'],
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: 'Departure time must be in the future',
      },
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note must be less than 500 characters'],
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'completed'],
      default: 'open',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for efficient querying
RunSchema.index({ status: 1, departureTime: -1 });
RunSchema.index({ runnerUserId: 1 });

export const Run = models.Run || model<IRun>('Run', RunSchema);
