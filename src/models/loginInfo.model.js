import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const loginSchema = new Schema(
    {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
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
                validate: {
                    validator: function (v) {
                        return v > this.loginInfo.time;
                    },
                    message: "Logout time must be after login time.",
                },
            },
        },
    },
    { timestamps: true }
);

loginSchema.plugin(mongooseAggregatePaginate);

export const LoginInfo = mongoose.model("LoginInfo", loginSchema);
