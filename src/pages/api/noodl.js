import clientPromise from "@/lib/mongo";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { action, data } = req.body;

    try {
      const client = await clientPromise;
      const db = client.db("main");
      const col = db.collection("noodl");

      let result;

      switch (action) {
        case "add":
          if (!data) {
            return res
              .status(400)
              .json({ error: "Data is required for adding" });
          }

          const existingUser = await col.findOne({
            username: data.username,
            quiz: data.quiz,
          });
          if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
          }

          result = await col.insertOne(data);
          res
            .status(200)
            .json({ message: "Record added successfully", result });
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to add record" });
    }
  } else if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("main");
      const col = db.collection("noodl");

      const currentUsername = req.headers.username;
      const currentQuiz = req.headers.quiz;

      let result = await col
        .find({ quiz: currentQuiz })
        .sort({ score: -1 })
        .limit(10)
        .toArray();

      console.log(result);

      if (currentUsername && result.length > 0) {
        const isCurrentUserInTopTen = result.some(
          (user) => user.username === currentUsername
        );

        if (!isCurrentUserInTopTen) {
          const currentUserRecord = await col.findOne({
            username: currentUsername,
          });

          if (currentUserRecord) {
            const allUsers = await col
              .find({ quiz: currentQuiz })
              .sort({ score: -1 })
              .toArray();

            const currentUserRank =
              allUsers.findIndex((user) => user.username === currentUsername) +
              1;
            currentUserRecord.rank = currentUserRank;
            result.push(currentUserRecord);
          }
        }
      }
      res.status(200).json(result);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to get records" });
    }
  }
}
