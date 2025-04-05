import clientPromise from "@/lib/mongo";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { username, password, quizId } = req.body;

  if (!username || !password || !quizId) {
    return res.status(400).json({ 
      success: false, 
      message: "Username, password, and quiz ID are required" 
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db("main");
    const quiz = await db.collection("noodl-questions").findOne({ quiz: quizId });
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: "Quiz not found" 
      });
    }
    
    if (quiz.username === username && quiz.password === password) {
      return res.status(200).json({
        success: true,
        message: "Authentication successful"
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication"
    });
  }
}