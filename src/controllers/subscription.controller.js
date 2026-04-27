import mongoose, {isValidObjectId} from "mongoose"
import {Subscription} from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel ID");

    const subscribed = await Subscription.findOne({ subscriber: req.user._id, channel: channelId });
    if (subscribed) {
        await Subscription.findByIdAndDelete(subscribed._id);
        return res.status(200).json(new ApiResponse(200, { subscribed: false }, "Unsubscribed from channel"));
    } else {
        await Subscription.create({ subscriber: req.user._id, channel: channelId });
        return res.status(200).json(new ApiResponse(200, { subscribed: true }, "Subscribed to channel"));
    }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel ID");

    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "fullName userName avatar");
    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params;
    if (!isValidObjectId(subscriberId)) throw new ApiError(400, "Invalid subscriber ID");

    const channels = await Subscription.find({ subscriber: subscriberId }).populate("channel", "fullName userName avatar");
    return res.status(200).json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }
