import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['birthday', 'anniversary', 'festival', 'general', 'joke', 'shayari', 'quote', 'love'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    overlayConfig: {
      namePosition: {
        x: { type: Number, default: 540 },
        y: { type: Number, default: 900 },
      },
      nameFont: {
        type: String,
        default: 'Outfit',
      },
      nameFontSize: {
        type: Number,
        default: 36,
      },
      nameColor: {
        type: String,
        default: '#ffffff',
      },
      photoPosition: {
        x: { type: Number, default: 540 },
        y: { type: Number, default: 700 },
      },
      photoSize: {
        type: Number,
        default: 150,
      },
      photoShape: {
        type: String,
        enum: ['circle', 'square', 'rounded'],
        default: 'circle',
      },
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isCommunity: {
      type: Boolean,
      default: false,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    creatorName: {
      type: String,
      default: '',
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Template || mongoose.model('Template', TemplateSchema);
