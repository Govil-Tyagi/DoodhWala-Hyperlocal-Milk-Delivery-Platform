import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  doodhwalaId: mongoose.Types.ObjectId;
  scheduleId: mongoose.Types.ObjectId;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  date: Date;
  note?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doodhwalaId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule', required: true },
    quantity: { type: Number, required: true, min: 0.5 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
      default: 'pending',
    },
    date: { type: Date, required: true },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
