import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
	res.json({ method: "GET", message: "Hello, world!" })
});

router.post("/", (req, res) => {
	res.json({ method: "POST", message: "Hello, world!" })
});

router.put("/", (req, res) => {
	res.json({ method: "PUT", message: "Hello, world!" })
});

router.delete("/", (req, res) => {
	res.json({ method: "DELETE", message: "Hello, world!" })
});

export { router };
