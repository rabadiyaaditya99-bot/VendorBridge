const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { registerSchema, loginSchema } = require("../validations/auth.validation");

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      throw new ApiError(409, "User with this email already exists.");
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: validated.username },
    });

    if (existingUsername) {
      throw new ApiError(409, "Username is already taken.");
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(validated.password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        username: validated.username,
        phone: validated.phone || null,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = generateToken(user.id, user.role);

    res.status(201).json(
      new ApiResponse(201, "User registered successfully.", { user, token })
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    // Compare password
    const isMatch = await bcrypt.compare(validated.password, user.password);

    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password.");
    }

    // Generate JWT
    const token = generateToken(user.id, user.role);

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    res.status(200).json(
      new ApiResponse(200, "Login successful.", {
        user: userWithoutPassword,
        token,
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.status(200).json(
      new ApiResponse(200, "User profile fetched.", { user: req.user })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
