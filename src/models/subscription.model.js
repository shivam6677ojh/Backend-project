import mongoose from "mongoose";
import { Schema } from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "user"
        },
        channel:{
            type: Schema.Types.ObjectId, // one to who subscriber is subscribing
            ref: "user"
        }
        
},
    {
        timestamps: true
    }
)

export default subscription = mongoose.model("subscription", SubscriptionSchema);

