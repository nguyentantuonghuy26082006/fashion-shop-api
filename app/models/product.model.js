const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tên sản phẩm không được quá 200 ký tự']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Mô tả sản phẩm là bắt buộc']
  },
  price: {
    type: Number,
    required: [true, 'Giá sản phẩm là bắt buộc'],
    min: [0, 'Giá không được âm']
  },
  comparePrice: {
    type: Number, // Giá gạch (để hiển thị giảm giá)
    min: [0, 'Giá không được âm']
  },
  cost: {
    type: Number, // Giá vốn (chỉ admin thấy)
    min: [0, 'Giá vốn không được âm']
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Danh mục sản phẩm là bắt buộc']
  },
  brand: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Số lượng tồn kho là bắt buộc'],
    min: [0, 'Số lượng không được âm'],
    default: 0
  },
  sizes: [{
    name: {
      type: String,
      enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    },
    stock: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  colors: [{
    name: String,
    hexCode: String,
    stock: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  sku: {
    type: String, // Mã SKU
    unique: true,
    sparse: true
  },
  tags: [String], // Các tag để tìm kiếm
  features: [String], // Đặc điểm nổi bật
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false // Sản phẩm nổi bật
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  soldCount: {
    type: Number,
    default: 0 // Số lượng đã bán
  },
  views: {
    type: Number,
    default: 0 // Lượt xem
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index để tăng tốc tìm kiếm
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Virtual: Tính % giảm giá
productSchema.virtual('discountPercent').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Auto-generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);