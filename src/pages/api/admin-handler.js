import clientPromise from "@/lib/mongo";

async function handleGetActiveStatus(req, res) {
  const { quizId } = req.query;
  
  if (!quizId) {
    return res.status(400).json({ 
      success: false, 
      message: "Quiz ID is required" 
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
    
    const isActive = quiz.active === undefined ? true : quiz.active;
    
    return res.status(200).json({
      success: true,
      active: isActive
    });
  } catch (error) {
    console.error("Error fetching quiz active status:", error);
    return res.status(500).json({
      success: false, 
      message: "Failed to fetch quiz active status"
    });
  }
}

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    try {
      const { quizId } = req.body;
      
      if (!quizId) {
        return res.status(400).json({ success: false, message: "Quiz ID is required" });
      }
      
      const client = await clientPromise;
      const db = client.db("main");
      const questionsResult = await db.collection("noodl-questions").deleteMany({ quiz: quizId });
      const attemptsResult = await db.collection("noodl").deleteMany({ quiz: quizId });
      
      return res.status(200).json({
        success: true,
        message: "Quiz deleted successfully",
        deletedQuestions: questionsResult.deletedCount,
        deletedAttempts: attemptsResult.deletedCount
      });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      return res.status(500).json({ success: false, message: "Failed to delete quiz" });
    }
  }
  
  else if (req.method === "POST") {
    const { action } = req.body;
    
    switch(action) {
      case "authenticate":
        return handleAuthentication(req, res);
        
      case "toggle-active":
        return handleToggleActive(req, res);
        
      default:
        if (req.body.username && req.body.password && req.body.quizId) {
          return handleAuthentication(req, res);
        }
        
        return res.status(400).json({ 
          success: false, 
          message: "Invalid action specified" 
        });
    }
  }
  
  else {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}

async function handleAuthentication(req, res) {
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

async function handleToggleActive(req, res) {
  const { quizId, value } = req.body;
  
  if (!quizId) {
    return res.status(400).json({ 
      success: false, 
      message: "Quiz ID is required" 
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
    const currentActive = quiz.active === undefined ? true : quiz.active;
    
    if (currentActive !== value) {
      const result = await db.collection("noodl-questions").updateOne(
        { quiz: quizId },
        { $set: { active: value } }
      );
      
      return res.status(200).json({
        success: true,
        message: `Quiz ${quizId} active status set to ${value}`,
        modified: result.modifiedCount > 0
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Quiz ${quizId} already has active status of ${value}`,
        modified: false
      });
    }
  } catch (error) {
    console.error("Error updating quiz active status:", error);
    return res.status(500).json({
      success: false, 
      message: "Failed to update quiz active status"
    });
  }
}