import mongoose, { Document, Schema } from 'mongoose';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface ISubscription extends Document {
  customerId: mongoose.Types.ObjectId;
  doodhwalaId: mongoose.Types.ObjectId;
  dailyQuantity: number;
  pricePerLitre: number;
  startDate: Date;
  endDate?: Date;
  status: SubscriptionStatus;
  createdAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doodhwalaId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dailyQuantity: { type: Number, required: true, min: 0.5 },
    pricePerLitre: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
