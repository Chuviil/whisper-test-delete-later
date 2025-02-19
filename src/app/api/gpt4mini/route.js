import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { transcription } = await request.json();

    if (!transcription) {
      return NextResponse.json(
        { error: 'No transcription provided' },
        { status: 400 }
      );
    }

    console.log("Sending transcription to GPT-4o-mini...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {role: "user", content: transcription}
      ],
      max_tokens: 150
    });

    console.log(response.choices[0].message);

    return NextResponse.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error('Error processing transcription:', error);
    return NextResponse.json(
      { error: 'Error processing transcription' },
      { status: 500 }
    );
  }
}
