const router = require("express").Router();
const { User } = require("../../models/user");

// Route to get user by email
router.get("/:email", async (req, res) => {
	try {
	  const email = decodeURIComponent(req.params.email);
		console.log("Received email:", email);
		const user = await User.findOne({ email: email });

		if (!user) {
			return res.status(404).send({ message: "User not found" });
		}
		res.status(200).send({ message:true });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;
