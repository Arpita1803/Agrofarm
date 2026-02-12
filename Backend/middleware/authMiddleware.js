import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;


// import jwt from "jsonwebtoken";

// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token, authorization denied" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = {
//       id: decoded.id,
//       role: decoded.role,
//     };

//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Token is not valid" });
//   }
// };

// export default authMiddleware;




   // import bcrypt from "bcryptjs";
// import User from "../models/User.js";

// export const changePassword = async (req, res) => {
//   try {
//     const { oldPassword, newPassword } = req.body;

//     // user id comes from JWT (set by protect middleware)
//     const userId = req.user.id;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // check old password
//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Old password is incorrect" });
//     }

//     // hash new password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     await user.save();

//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
