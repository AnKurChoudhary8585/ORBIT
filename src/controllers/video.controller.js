import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const filter = {};
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }
    if (userId) filter.owner = userId;

    const sortOptions = {};
    if (sortBy && sortType) {
        sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
    } else {
        sortOptions.createdAt = -1;
    }

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    
    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) throw new ApiError(400, "Title and description are required");

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!videoLocalPath) throw new ApiError(400, "Video file is required");
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

    const videoUpload = await uploadOnCloudinary(videoLocalPath);
    console.log("Cloudinary video upload result:", videoUpload);
    if (!videoUpload || (!videoUpload.url && !videoUpload.secure_url)) {
        throw new ApiError(400, "Video upload failed unexpectedly. Check server console.");
    }

    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
    console.log("Cloudinary thumbnail upload result:", thumbnailUpload);
    if (!thumbnailUpload || (!thumbnailUpload.url && !thumbnailUpload.secure_url)) {
        throw new ApiError(400, "Thumbnail upload failed unexpectedly. Check server console.");
    }

    const video = await Video.create({
        title,
        description,
        duration: videoUpload.duration || 0,
        videoFile: videoUpload.url || videoUpload.secure_url,
        thumbnail: thumbnailUpload.url || thumbnailUpload.secure_url,
        owner: req.user._id,
        isPublished: true
    });

    return res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");
    const video = await Video.findById(videoId).populate("owner", "fullName userName avatar");
    if (!video) throw new ApiError(404, "Video not found");
    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    const thumbnailLocalPath = req.file?.path;
    if (thumbnailLocalPath) {
        const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
        if (thumbnailUpload?.url || thumbnailUpload?.secure_url) {
            updateFields.thumbnail = thumbnailUpload.url || thumbnailUpload.secure_url;
        }
    }

    const video = await Video.findOneAndUpdate(
        { _id: videoId, owner: req.user._id },
        { $set: updateFields },
        { new: true }
    );

    if (!video) throw new ApiError(404, "Video not found or unauthorized");
    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");
    const video = await Video.findOneAndDelete({ _id: videoId, owner: req.user._id });
    if (!video) throw new ApiError(404, "Video not found or unauthorized");
    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");
    
    const video = await Video.findOne({ _id: videoId, owner: req.user._id });
    if (!video) throw new ApiError(404, "Video not found or unauthorized");

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(new ApiResponse(200, video, "Publish status toggled successfully"));
})

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus }
