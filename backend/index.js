const { Configuration, OpenAIApi } = require("openai");
const prompt = require("prompt-sync")();
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const util = require("util");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 3000;
let isAudioReady = false; // Add a flag to track audio readiness

app.use(cors());

process.env.GOOGLE_APPLICATION_CREDENTIALS =
  "./jarvis-393104-6d001c1aa343.json";

const projectId = "jarvis-393104";
const client = new textToSpeech.TextToSpeechClient({
  projectId,
});

const configuration = new Configuration({
  apiKey: "key",
});

const openai = new OpenAIApi(configuration);

const chatHistory = [
  { role: "system", content: "You are a helpful assistant." },
];

async function quickStart(msg) {
  const text = msg;

  const request = {
    input: { text: text },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };

  const [response] = await client.synthesizeSpeech(request);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile("output.mp3", response.audioContent, "binary");
  console.log("Audio content written to file: output.mp3");
}

async function runChatCompletion(msg) {
  chatHistory.push({ role: "user", content: msg });

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: chatHistory,
  });

  chatHistory.push({
    role: "assistant",
    content: completion.data.choices[0].message.content,
  });

  let response = completion.data.choices[0].message.content;
  return response;
}


async function chat(msg) {
  if (msg === "exit") {
    process.exit();
  } else {
    isAudioReady = false;
    const response = await runChatCompletion(msg);
    await quickStart(response);
    console.log(response);
    isAudioReady = true;
  }
}

app.use(bodyParser.json());

app.get("/", (req, res) => {
  if (isAudioReady) {
    const filePath = __dirname + "/output.mp3";
    res.sendFile(filePath);
  } else {
    res.status(404).send("not ready");
  }
});

app.post('/messages', (req, res) => {
    const msg = req.body.msg;
    chat(msg);
    res.status(200).json({ success: true });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
