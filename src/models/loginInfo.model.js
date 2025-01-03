import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const loginSchema = new Schema(
    {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        loginInfo: {
            isDone: {
                type: Boolean,
                default: false,
            },
            time: {
                type: Date,
                required: true,
            },
        },
        logoutInfo: {
            isDone: {
                type: Boolean,
                default: false,
            },
            time: {
                type: Date,
                required: true,
            },
        },
    },
    { timestamps: true }
);

loginSchema.plugin(mongooseAggregatePaginate);

export const LoginInfo = mongoose.model("Login", loginSchema);
