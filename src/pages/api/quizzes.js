import clientPromise from "@/lib/mongo";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("main");
    const collection = db.collection("noodl-questions");
    
    const quizData = {
      quiz: req.body.quiz,
      active: req.body.active,
      totalScore: req.body.totalScore,
      password: req.body.password,
      username: req.body.username,
      questions: req.body.questions
    };
    
    const result = await collection.insertOne(quizData);

    return res.status(201).json({ 
      message: 'Quiz created successfully', 
      quizId: quizData.quiz
    });
    
  } catch (error) {
    console.error('Error creating quiz:', error);
    return res.status(500).json({ message: 'Failed to create quiz', error: error.message });
  }
}