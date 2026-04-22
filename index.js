app.post('/api/copilot', async (req, res) => {
  const { messages, userRole, context } = req.body;
  const lastMessage = messages[messages.length - 1].content.toLowerCase();

  try {
    // 1. Log the incoming request to see if it even reaches the backend
    console.log("Received request for:", lastMessage);

    let dbInfo = "";
    if (lastMessage.includes('total') || lastMessage.includes('how many')) {
      // 2. Fetch from Supabase
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error("Supabase Query Error:", error);
        dbInfo = "Database error occurred.";
      } else {
        dbInfo = `There are ${count} students in the school.`;
      }
    }

    // 3. AI Processing
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `You are Emerald. ${dbInfo}` },
        ...messages
      ],
      temperature: 0.5,
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("Critical Backend Error:", error);
    res.status(500).json({ reply: "I'm having trouble connecting to my brain. Check the logs." });
  }
});
