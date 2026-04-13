import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization || "";

		if (!authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				success: false,
				message: "Authorization token is required",
			});
		}

		const token = authHeader.split(" ")[1];
		const secret = process.env.JWT_SECRET;

		if (!secret) {
			return res.status(500).json({
				success: false,
				message: "Server auth is not configured",
			});
		}

		const decoded = jwt.verify(token, secret);
		req.user = decoded;

		return next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: "Invalid or expired token",
		});
	}
};

