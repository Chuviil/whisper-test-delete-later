import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert audio file to a supported format if necessary
    const supportedFormats = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm'];
    const fileType = audioFile.type.split('/')[1];
    if (!supportedFormats.includes(fileType)) {
      return NextResponse.json(
        { error: `Invalid file format. Supported formats: ${supportedFormats.join(', ')}` },
        { status: 400 }
      );
    }

    console.log("Transcribing audio...");
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      language: "es",
      model: "whisper-1"
    });

    console.log(transcription.text);
    
    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: 'Error processing audio' },
      { status: 500 }
    );
  }
}
