import clientPromise from "@/lib/mongo";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const col = db.collection("noodl");
    const col_q = db.collection("noodl-questions");

    const currentQuiz = req.headers.quiz;

    let result = await col
      .find({ quiz: currentQuiz })
      .sort({ score: -1 })
      .toArray();

    let score = await col_q
      .find({ quiz: currentQuiz })
      .project({ totalScore: 1, active: 1 })
      .toArray();

    res
      .status(200)
      .json({ leaderboard: result, totalScore: score[0].totalScore, active: score[0].active });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
}
