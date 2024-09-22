import mongoose from 'mongoose';



const postSchema = new mongoose.Schema({

  username: {
    type: mongoose.Schema.Types.String,
    ref: 'User', // Refers to the user who created the post
    required: true
  },
  content: {
    type: String,
    required: true, // Post content
    maxlength: 500 // Limit the post content length
  },
  image: {
    type: String, // URL of the post image (optional)
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Array of users who liked the post
    
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Refers to the user who commented
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now()// Automatically set when the post is created
  },
  updatedAt: {
    type: Date
  }
});

// Middleware to update the 'updatedAt' field before saving
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Post=mongoose.model("Post",postSchema)


