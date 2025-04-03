import fs from "fs/promises";
import path from "path";

const PROGRESS_DIR = path.join(process.cwd(), "testprogress");

async function ensureProgressDir() {
  try {
    await fs.mkdir(PROGRESS_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating progress directory:", error);
  }
}

export default async function handler(req, res) {
  await ensureProgressDir();

  if (req.method === "POST") {
    const { username, quizId, data } = req.body;

    try {
      const filename = `${username}-${quizId}.json`;
      const filePath = path.join(PROGRESS_DIR, filename);
      const fileData = await fs.readFile(filePath, "utf8");
      if (!fileData) {
        await fs.writeFile(filePath, JSON.stringify(data));
        res
          .status(200)
          .json({ success: true, message: "Test Initialized Successfully" });
      } else {
        res
          .status(304)
          .json({ success: false, message: "File already exists" });
      }
    } catch (error) {
      console.error("Error init test:", error);
      res.status(500).json({ error: "Failed to init test" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
