import mongoose,{Schema} from "mongoose";

const reviewSchema = new Schema(
    {
        bookingId:{
            type:Schema.Types.ObjectId,
            ref:"Booking",
            required:true,
            unique:true
        },
        customerId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        providerId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        rating:{
            type:Number,
            enum:[1,2,3,4,5],
            required:true
        },
        comment:{
            type:String,
            required:true
        },
        isHidden:{
            type:Boolean,
            default:false
        }
    },
    {timestamps:true}
)

const Review = mongoose.model("Review",reviewSchema)
export default Review