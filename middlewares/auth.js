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
  const role = req.headers["role"];
  console.log("Role:", role); // ตรวจสอบค่าของ role

  if (role !== "superadmin") {
    const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\.[0-9a-fA-F]{4}\.[0-9a-fA-F]{4})$/;

    // ตรวจสอบ MAC address และ Hardware ID
    if (!req.headers["mac-address"]) {
      return res.status(401).json({ status: "error", message: "MAC address is required!" });
    }

    if (!req.headers["hardware-id"]) {
      return res.status(401).json({ status: "error", message: "Hardware ID is required!" });
    }

    if (!macAddressRegex.test(req.headers["mac-address"])) {
      return res.status(401).json({ status: "error", message: "MAC address is invalid!" });
    }

    // ตรวจสอบ Authorization header
    if (!req.headers["authorization"]) {
      return res.status(401).json({ status: "error", message: "TOKEN is required for authentication" });
    }

    const accessToken = req.headers["authorization"].replace("Bearer ", "");

    jwt.verify(accessToken, JWT_ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return accessTokenCatchError(err, res);
      }

      req.user = decoded; // ตั้งค่า req.user จาก decoded token

      if (!req.user.userId) {
        return res.status(401).json({ status: "error", message: "Invalid token: User ID not found." });
      }

      try {
        // ตรวจสอบ Mac Address และ Hardware ID
        const macAddressIsMember = await redis.sIsMember(`Mac_Address_${decoded.userId}`, req.headers["mac-address"]);
        const hardwareIdIsMember = await redis.sIsMember(`Hardware_ID_${decoded.userId}`, req.headers["hardware-id"]);

        if (!macAddressIsMember && !hardwareIdIsMember) {
          return res.status(401).json({
            status: "error",
            message: "Both Mac Address AND Hardware ID do not exist!",
          });
        }
        if (!macAddressIsMember) {
          return res.status(401).json({ status: "error", message: "Mac Address does not exist!" });
        }
        if (!hardwareIdIsMember) {
          return res.status(401).json({ status: "error", message: "Hardware ID does not exist!" });
        }

        // ตรวจสอบ Access Token ล่าสุด
        const lastAccessToken = await redis.get(`Last_Access_Token_${decoded.userId}_${req.headers["hardware-id"]}`);
        if (lastAccessToken !== accessToken) {
          return res.status(401).json({ status: "error", message: "Incorrect Access Token!" });
        }
      } catch (error) {
        console.error("Redis error:", error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
      }

      return next(); // ส่งต่อไปยังฟังก์ชันถัดไป
    });
  } else {
    // ตรวจสอบ Super Admin Mode
    const superAdminApiKey = req.headers["x-super-admin-api-key"];
    if (superAdminApiKey === process.env.SUPER_ADMIN_API_KEY) {
      console.log("You are in super admin mode.");

      req.user = { userId: "superadmin-id", role: "superadmin" }; // ตั้งค่า req.user สำหรับ superadmin
      return next(); // ส่งต่อไปยังฟังก์ชันถัดไป
    }

    return res.status(403).json({
      message: "Unauthorized: Invalid API key for super admin",
    });
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
