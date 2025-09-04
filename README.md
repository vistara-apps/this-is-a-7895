# AdRemix - AI-Powered Ad Variation Generator

AdRemix is a web application that empowers solo founders to generate and test multiple social media ad variations from a single product image, driving growth hacking with AI.

## 🚀 Features

### Core Features
- **AI Ad Variation Generator**: Upload a single product image and utilize AI to generate 3-5 distinct ad variations with different copy, headlines, and visual adjustments
- **Performance-Oriented Variations**: Generate ad variations with specific marketing angles designed to test different user motivations
- **Automated Social Deployment**: Post generated ad variations to connected social media accounts (Instagram, TikTok, Facebook, Twitter)
- **Basic Performance Insights**: Track engagement metrics for each posted ad variation

### Technical Features
- **React Frontend**: Modern, responsive UI built with React and Tailwind CSS
- **Express.js Backend**: RESTful API with comprehensive authentication and authorization
- **MongoDB Database**: Scalable document database for user data and ad generations
- **OpenAI Integration**: GPT-4 powered ad copy generation with platform-specific optimization
- **File Upload & Processing**: Image optimization and cloud storage integration
- **Subscription Management**: Tiered subscription plans with usage tracking

## 🏗️ Architecture

### Frontend (React + Vite)
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── services/           # API service functions
├── utils/              # Utility functions
└── styles/             # Global styles and Tailwind config
```

### Backend (Node.js + Express)
```
server/
├── controllers/        # Route handlers
├── middleware/         # Express middleware
├── models/            # MongoDB schemas
├── routes/            # API route definitions
├── services/          # Business logic services
├── utils/             # Utility functions
└── config/            # Configuration files
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- OpenAI API key

### 1. Clone the Repository
```bash
git clone https://github.com/vistara-apps/this-is-a-7895.git
cd this-is-a-7895
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Environment Configuration

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=AdRemix
```

**Backend (server/.env):**
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/adremix

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

### 4. Start Development Servers

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Ad Generation Endpoints
- `POST /api/ads/generate` - Generate ad variations from image
- `GET /api/ads` - Get user's ad generations (paginated)
- `GET /api/ads/:id` - Get specific ad generation
- `PUT /api/ads/:generationId/variations/:variationId` - Update variation
- `POST /api/ads/:generationId/variations/:variationId/post` - Post to social media
- `DELETE /api/ads/:id` - Delete ad generation

### User & Analytics Endpoints
- `GET /api/user/dashboard` - Get dashboard data
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/performance` - Get performance metrics
- `GET /api/social/accounts` - Get connected social accounts

## 🎨 Design System

### Colors
- **Primary**: `hsl(210, 90%, 45%)` - Main brand color
- **Accent**: `hsl(160, 100%, 40%)` - Success/accent color
- **Background**: `hsl(220, 15%, 98%)` - Light background
- **Surface**: `hsl(0, 0%, 100%)` - Card/surface color
- **Text Primary**: `hsl(210, 15%, 15%)` - Main text
- **Text Secondary**: `hsl(210, 15%, 35%)` - Secondary text

### Typography
- **Display**: `text-5xl font-bold tracking-tight` - Hero headings
- **Headline**: `text-2xl font-semibold` - Section headings
- **Body**: `text-base leading-7` - Body text
- **Caption**: `text-sm text-gray-500` - Small text

### Components
- **ImageUploader**: File upload with drag & drop
- **AdVariationCard**: Display ad variations with edit capabilities
- **SocialAccountConnector**: Connect social media accounts
- **AIGeneratorConfig**: Configure AI generation parameters

## 🔧 Configuration

### Subscription Tiers
- **Free**: 5 ad generations/month, 5 social posts/month
- **Basic ($29/month)**: 50 ad generations/month, 50 social posts/month
- **Pro ($79/month)**: Unlimited generations and posts

### Supported Platforms
- **Instagram**: Via Instagram Graph API
- **TikTok**: Limited API access (manual posting workflow)
- **Facebook**: Via Facebook Graph API
- **Twitter**: Via Twitter API v2

### AI Configuration
- **Model**: GPT-4 for text generation
- **Styles**: Balanced, Creative, Performance
- **Angles**: Performance, Emotional, Urgency, Social Proof, Educational
- **Platform Optimization**: Character limits and best practices per platform

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/adremix
JWT_SECRET=your-production-jwt-secret
OPENAI_API_KEY=your-openai-api-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=adremix-production
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
```

### Build Commands
```bash
# Build frontend
npm run build

# Start production server
cd server
npm start
```

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Backend Tests
```bash
cd server
npm run test
```

### API Testing
Use the included Postman collection or test with curl:
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Generate ads
curl -X POST http://localhost:5000/api/ads/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "platforms[]=Instagram" \
  -F "style=balanced"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@adremix.com or join our Discord community.

## 🗺️ Roadmap

- [ ] Advanced image editing with DALL-E integration
- [ ] A/B testing automation
- [ ] Advanced analytics and reporting
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Mobile app for iOS and Android
- [ ] Video ad generation support
- [ ] Multi-language support

---

Built with ❤️ by the AdRemix Team
