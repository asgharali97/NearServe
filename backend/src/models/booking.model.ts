import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    priceSnapShot: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "requested",
        "confirmed",
        "inprogress",
        "completed",
        "cancelled",
      ],
      default: "requested",
    },
    address: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    images: [{ type: String }],
    workNotes: {
      type: String,
    },
    afterImages: [{ type: String }],
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
