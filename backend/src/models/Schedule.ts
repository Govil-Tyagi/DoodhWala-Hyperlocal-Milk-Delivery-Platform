import mongoose, { Document, Schema } from 'mongoose';

export interface ISchedule extends Document {
  doodhwalaId: mongoose.Types.ObjectId;
  date: Date;
  arrivalTime: string; // "07:30"
  availableQuantity: number; // litres
  pricePerLitre: number;
  isActive: boolean;
  createdAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    doodhwalaId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    arrivalTime: { type: String, required: true },
    availableQuantity: { type: Number, required: true, min: 0 },
    pricePerLitre: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One schedule per doodhwala per day
ScheduleSchema.index({ doodhwalaId: 1, date: 1 }, { unique: true });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);
