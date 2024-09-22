// const Post = require('../models/Post'); // Assuming the Post model is in a models folder
import {Post} from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/user.model.js"


const createPost = asyncHandler(async (req, res) => {

    const {content} = req.body
    // console.log(req.body)

    
    const userName = req.user.username;

    //console.log(req)

    const imageLocalPath = req.files?.image[0].path;
  
     
    if (!imageLocalPath) {
        throw new ApiError(400, "img is required")
    }

    const image = await uploadOnCloudinary(imageLocalPath)
   

    if (!image) {
        throw new ApiError(400, "image is required")
    }
    // const createdUs = await Post.findById(user._id)
    const post = await Post.create({
        username: userName, 
        image: image.url,
        content,
    })

    const createdPost = await Post.findById(post._id)
    if (!createdPost) {
        throw new ApiError(500, "something went wrong while posting")
    }

    return res.status(201).json(
        new ApiResponse(200, createdPost, "User posted Successfully!!!")
    )
})



const getAllPosts = async (req, res) => {
    try {
        const loggedInUserId = req.user.id; // Get the ID of the logged-in user
        const loggedInUser = await User.findById(loggedInUserId); // Fetch the logged-in user

        // Fetch posts created by the logged-in user
        const loggedInUserPosts = await Post.find({ username: req.user.username }).populate('username', 'username avatar');

        // Fetch posts from users that the logged-in user is following
        const followingUserPosts = await Promise.all(
            loggedInUser.following.map(async (followedUserId) => {
                return await Post.find({ username: followedUserId }).populate('username', 'username avatar');
            })
        );

        // Combine the logged-in user's posts with the followed users' posts
        const allPosts = [...loggedInUserPosts, ...followingUserPosts.flat()];

        // Optionally sort the posts by createdAt date, newest first
        allPosts.sort((a, b) => b.createdAt - a.createdAt);

        return res.status(200).json({
            posts: allPosts,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while fetching posts." });
    }
};

  const getPostById = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).populate('user', 'username avatar');
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  };

  const deletePost = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      const userPostName = post.username;
      const postOwner = await User.findOne({ username: userPostName});

      if (!post) return res.status(404).json({ error: 'Post not found' });

      if (postOwner._id.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized action' });
      
      await Post.findByIdAndDelete(req.params.id);  
      
      res.status(200).json({ message: 'Post deleted successfully' });
    }
     catch (err)
      {
      res.status(500).json({ error: 'Failed to delete post' });
      }
  };


const likeOrDislike = async (req, res) => {
    try {
        const loggedInUserId = req.user.id; // Assuming you're using req.user for authenticated user
        const postId = req.params.id; // Get the post ID from the URL parameters
        const post = await Post.findById(postId); // Find the post by ID

        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        // Check if the user has already liked the post
        if (post.likes.includes(loggedInUserId)) {
            // User wants to unlike (dislike) the post
            await Post.findByIdAndUpdate(postId, { $pull: { likes: loggedInUserId } });
            return res.status(200).json({
                message: "You unliked the post."
            });
        } else {
            // User wants to like the post
            await Post.findByIdAndUpdate(postId, { $push: { likes: loggedInUserId } });
            return res.status(200).json({
                message: "You liked the post."
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred." });
    }
};


  const addComment = async (req, res) => {
    try {
        const postId= req.params.id ;
        const loggedInUserId = req.user.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        console.log(postId, loggedInUserId , post);
        await Post.findByIdAndUpdate(postId, { $push: {comments:{ user: loggedInUserId , content: req.body.content } }});
    //   post.comments.push(comment);
    
      res.status(200).json({ message: 'Comment added', post });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add comment' });
    }
  };




  const deleteComment = async (req, res) => {
    try {
        const postId= req.params.id;
        const post = await Post.findById(postId);

        
        if (!post) return res.status(404).json({ error: 'Post not found' });
        const cId= req.params.commentId;
        const comment = post.comments.id(cId);

        const userPostName = post.username;
        const postOwner = await User.findOne({ username: userPostName});
        
      if (!comment) return res.status(404).json({ error: 'Comment not found' });
 
      if (comment.user.toString() == req.user.id|| req.user.id==postOwner._id.toString())
         await Post.findByIdAndUpdate(postId, { $pull: {comments:{ _id: cId } }}); 

      else return res.status(403).json({ error: 'Unauthorized action' });   
      
      res.status(200).json({ message: 'Comment deleted'});
    }
     catch (err)
      {
        console.log(err);
      res.status(500).json({ error: 'Failed to delete comment' });
     }
  };
  const getPostsByUser = async (req, res) => {
    try {
      const posts = await Post.find({ user: req.params.userId }).populate('user', 'username avatar');
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch posts by user' });
    }
  };  
  

export { createPost, getAllPosts, getPostById, deletePost, addComment, deleteComment, getPostsByUser ,likeOrDislike};