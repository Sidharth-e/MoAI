const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
    console.log(authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  const token = authHeader.substring(7);
  try {
    // Use the same secssret as NextAuth uses for NEXTAUTH_SECRET
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    console.log(decoded);

    const email = decoded.email || decoded.user?.email;
    console.log(email);

    if (!email) {
      return res
        .status(401)
        .json({ message: "Invalid token: Email not found." });
    }

    // Find user by email
    const user = await User.findOne({ email: email }).select("_id email");
    console.log(user);
    
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Attach user info to request
    req.user = {
      _id: user._id,
      email: user.email,
      role: decoded.role, // Optional: pass through any claims from JWT
      isAdmin: decoded.isAdmin, // Optional
    };

    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};
