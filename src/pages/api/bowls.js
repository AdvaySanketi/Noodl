import clientPromise from "@/lib/mongo";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const col = db.collection("noodl-questions");
    
    const includeInactive = req.query.includeInactive === "true";
    let query = includeInactive ? {} : { active: true };
    
    let result = await col.find(query).toArray();
    
    const quizArray = result.map((item) => item.quiz); 
    res.status(200).json(quizArray);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get questions" });
  }
}