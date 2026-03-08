import mongoose, { Schema } from "mongoose";

const providerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    availabilityStatus: {
      type: Boolean,
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    categories: [
      {
        categoryId: {
          type: Schema.Types.ObjectId,
          ref: "ServiceCategory",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ProviderProfile = mongoose.model("ProviderProfile", providerSchema);
export default ProviderProfile;
