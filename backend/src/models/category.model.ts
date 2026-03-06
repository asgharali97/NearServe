import mongoose, { Schema } from "mongoose";

const serviceCategory = new Schema(
    {
        name:{
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {timestamps: true}
)

const ServiceCategory = mongoose.model('ServiceCategory', serviceCategory)
export default ServiceCategory