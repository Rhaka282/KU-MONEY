import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    createdBy: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['incomes', 'expenses'],
      required: true,
    },
  },
  { timestamps: true }
);

// Index untuk mempercepat pencarian
categorySchema.index({ 'createdBy._id': 1 });
categorySchema.index({ type: 1 });
categorySchema.index({ 'createdBy._id': 1, type: 1 });

const Category = mongoose.model('Category', categorySchema, 'categories');

export default Category;