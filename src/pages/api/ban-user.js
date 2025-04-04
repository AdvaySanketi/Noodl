import clientPromise from "@/lib/mongo";

export default async function handler(req, res) {
    

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("main");
    const col = db.collection("noodl");
    const { username, quizId } = req.body;

    if (!username || !quizId) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const user = await col.findOne({ username, quiz: quizId });

    if (!user) {
      client.close();
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const updatedIsBanned = !user.isBanned;

    await col.updateOne(
      { username, quiz: quizId },
      { $set: { isBanned: updatedIsBanned } }
    );

    return res.json({ success: true, isBanned: updatedIsBanned });

  } catch (error) {
    console.error("Error toggling user ban status:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}