
const express = require("express");
const path = require("path");
const { connectDB, closeDB } = require("../mongodb");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let members;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Get all members
app.get("/api/members", async (req, res) => {
    try {
        const data = await members.find({}, { projection: { _id: 0 } }).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a member
app.post("/api/members", async (req, res) => {
    try {
        const { memberId, name, club, year, role, points, interests, status } = req.body;

        if (!memberId || !name || !club) {
            return res.status(400).json({
                message: "Member ID, name and club are required."
            });
        }

        const existing = await members.findOne({ memberId });
        if (existing) {
            return res.status(409).json({
                message: "Member ID already exists."
            });
        }

        const member = {
            memberId,
            name,
            club,
            year,
            role,
            points: Number(points) || 0,
            interests: interests || [],
            status: status || "Active"
        };

        await members.insertOne(member);
        res.status(201).json({
            message: "Member added successfully.",
            member
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a member
app.put("/api/members/:memberId", async (req, res) => {
    try {
        const { name, club, year, role, points, interests, status } = req.body;

        const result = await members.updateOne(
            { memberId: req.params.memberId },
            {
                $set: {
                    name,
                    club,
                    year,
                    role,
                    points: Number(points) || 0,
                    interests: interests || [],
                    status
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Member not found."
            });
        }

        res.json({ message: "Member updated successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a member
app.delete("/api/members/:memberId", async (req, res) => {
    try {
        const result = await members.deleteOne({
            memberId: req.params.memberId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Member not found."
            });
        }

        res.json({ message: "Member deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

async function startServer() {
    try {
        members = await connectDB();
        console.log("Connected to MongoDB.");

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Campus Club Members app running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start:", error.message);
        await closeDB();
    }
}

startServer();