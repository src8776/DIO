const uploadVolunteerHours = async (req, res) => {
    try {
        const { eventType } = req.body;

        if (!eventType) {
            return res.status(400).json({ message: "Event type is required" });
        }

        // Assuming filePath is obtained after the upload process
        const filePath = req.file.path;

        await processCsv(filePath, eventType);

        res.status(200).json({ message: "Volunteer hours uploaded successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { uploadVolunteerHours };
