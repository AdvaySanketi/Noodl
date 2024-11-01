import clientPromise from "@/lib/mongo";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const col = db.collection("noodl");

    const currentQuiz = req.headers.quiz;

    let result = await col
      .find({ quiz: currentQuiz })
      .sort({ score: -1 })
      .toArray();

    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
}
