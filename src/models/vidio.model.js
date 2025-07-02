import mongoose from "mongoose"
import { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const VideoSchema = new mongoose.Schema({

    videoFile:{
        type: String,
        required: true
    },
    thumbnails: {
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true
    },
    time:{
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    view:{
        type: Number,
        default: 0

    },
    isPublished:{
        type: Boolean,
        default: true
    },
    owener:{
        type: Schema.Types.ObjectId,
        ref: "user"
    }

    },
    {
        timestamps: true
    }
)

VideoSchema.plugin(mongooseAggregatePaginate)

export const video = mongoose.model("video", VideoSchema)