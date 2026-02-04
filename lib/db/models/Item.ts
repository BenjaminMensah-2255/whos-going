import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IItem extends Document {
  _id: mongoose.Types.ObjectId;
  runId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    runId: {
      type: Schema.Types.ObjectId,
      ref: 'Run',
      required: [true, 'Run ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [1, 'Item name must be at least 1 character'],
      maxlength: [200, 'Item name must be less than 200 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [999, 'Quantity must be less than 1000'],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
      max: [99999, 'Price must be less than 100,000'],
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
ItemSchema.index({ runId: 1, userId: 1 });
ItemSchema.index({ runId: 1 });

export const Item = models.Item || model<IItem>('Item', ItemSchema);
