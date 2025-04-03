import fs from "fs/promises";
import path from "path";

const PROGRESS_DIR =
  process.env.NODE_ENV === "production"
    ? process.env.TESTPROGRESS_DIR
    : path.join(process.cwd(), "testprogress");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { action, username, quizId, data } = req.body;

    try {
      const filename = `${username}-${quizId}.json`;
      const filePath = path.join(PROGRESS_DIR, filename);

      switch (action) {
        case "save":
          try {
            const fileData = await fs.readFile(filePath, "utf8");
            if (fileData) {
              await fs.writeFile(filePath, JSON.stringify(data));
              res
                .status(200)
                .json({ success: true, message: "Progress saved" });
            } else {
              res
                .status(404)
                .json({ success: false, message: "File does not exist" });
            }
          } catch (error) {
            res.status(500).json({
              success: false,
              message: "Error saving progress",
              error: error.message,
            });
          }
          break;

        case "delete":
          try {
            await fs.unlink(filePath);
            res
              .status(200)
              .json({ success: true, message: "Progress deleted" });
          } catch (error) {
            res
              .status(200)
              .json({ success: true, message: "No progress to delete" });
          }
          break;

        default:
          res.status(400).json({ error: "Invalid action" });
      }
    } catch (error) {
      console.error("Error handling progress:", error);
      res.status(500).json({ error: "Failed to process progress data" });
    }
  } else if (req.method === "GET") {
    const { username, quizId } = req.query;

    if (!username || !quizId) {
      return res
        .status(400)
        .json({ error: "Username and quizId are required" });
    }

    try {
      const filename = `${username}-${quizId}.json`;
      const filePath = path.join(PROGRESS_DIR, filename);

      try {
        const fileData = await fs.readFile(filePath, "utf8");
        const parsedData = JSON.parse(fileData);
        res.status(200).json({ success: true, data: parsedData });
      } catch (error) {
        res.status(200).json({ success: true, data: null });
      }
    } catch (error) {
      console.error("Error retrieving progress:", error);
      res.status(500).json({ error: "Failed to retrieve progress data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
