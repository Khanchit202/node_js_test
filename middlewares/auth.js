const jwt = require("jsonwebtoken");
const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
const SUPER_ADMIN_API_KEY = process.env.SUPER_ADMIN_API_KEY;
const redis = require("../app");

const { TokenExpiredError } = jwt;

const accessTokenCatchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res
      .status(401)
      .send({ message: "UNAUTHORIZED! Access Token was expired!" });
  }
  return res.status(401).send({ message: "UNAUTHORIZED!" });
};

const refreshTokenCatchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res
      .status(401)
      .send({ message: "UNAUTHORIZED! Refresh Token was expired!" });
  }
  return res.status(401).send({ message: "UNAUTHORIZED!" });
};

const verifyAccessToken = async (req, res, next) => {
  // แก้ไขส่วนนี้สำหรับการทดสอบในโหมดที่ไม่ต้องใช้ค่า headers จริง
  const role = req.headers["role"] || "user";  // ตั้งค่า role เป็น 'user' สำหรับการทดสอบ

  // กำหนดค่า mac-address และ hardware-id สำหรับการทดสอบ
  const macAddress = req.headers["mac-address"] || "00:14:22:01:23:45";
  const hardwareId = req.headers["hardware-id"] || "hardware123";

  if (role !== "superadmin") {
    // ไม่ตรวจสอบจริงสำหรับ mac-address และ hardware-id ในที่นี้
    if (!macAddress || !hardwareId) {
      return res
        .status(401)
        .send({ status: "error", message: "MAC address or Hardware ID is required!" });
    }

    // ถ้ามี authorization header ใช้ accessToken จากนั้นไปทำการตรวจสอบ
    const accessToken = req.headers["authorization"]?.replace("Bearer ", "");
    if (!accessToken) {
      return res.status(401).send({ status: "error", message: "TOKEN is required for authentication" });
    }

    jwt.verify(accessToken, JWT_ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return accessTokenCatchError(err, res);
      } else {
        req.user = decoded;
        return next();
      }
    });
  } else {
    const superAdminApiKey = req.headers["x-super-admin-api-key"];
    if (superAdminApiKey && superAdminApiKey === process.env.SUPER_ADMIN_API_KEY) {
      console.log("you are in super admin mode");
      return next();
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized: Invalid API key for super admin" });
    }
  }
};


const verifyRefreshToken = (req, res, next) => {
  if (!req.headers["authorization"])
    return res.status(401).send({
      status: "error",
      message: "TOKEN is required for authentication",
    });

  const refreshToken = req.headers["authorization"].replace("Bearer ", "");
  const hardwareID = req.headers["hardware-id"];

  jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return refreshTokenCatchError(err, res);
    } else {
      let savedRefreshToken = await redis.get(
        `Last_Refresh_Token_${decoded.userId}_${hardwareID}`,
        refreshToken
      );

      if (savedRefreshToken !== refreshToken) {
        return res
          .status(401)
          .send({ status: "error", message: "Incorrect Refresh Token!" });
      }

      req.user = decoded;
      return next();
    }
  });
};
const verifyAPIKey = (req, res, next) => {
  const apiKey = req.headers["authorization"];
  if (!apiKey) {
    return res
      .status(401)
      .json({ success: false, error: "API Key is required" });
  }
  // ตรวจสอบ API Key (ในที่นี้ใช้ค่าตายตัว ควรเปลี่ยนเป็นการตรวจสอบจากฐานข้อมูลหรือ env ในการใช้งานจริง)
  if (apiKey !== SUPER_ADMIN_API_KEY) {
    return res.status(403).json({ success: false, error: "Invalid API Key" });
  }
  next();
};

module.exports = { verifyAccessToken, verifyRefreshToken, verifyAPIKey };
