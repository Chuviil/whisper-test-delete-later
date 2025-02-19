"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      const audioURL = URL.createObjectURL(event.data);
      setRecordings((prev) => [
        ...prev,
        { audioURL, transcription: "Transcribing...", response: "" },
      ]);
      transcribeAudio(event.data);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    try {
      const response = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const transcription = data.text;

      setRecordings((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].transcription = transcription;
        return updated;
      });

      const gptResponse = await fetch("/api/gpt4mini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcription }),
      });

      const gptData = await gptResponse.json();
      const gptResponseText = gptData.response;

      setRecordings((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].response = gptResponseText;
        return updated;
      });
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  };

  return (
    <div className="flex flex-col items-center h-screen p-5 bg-[#FFD100]">
      <div className="mb-5">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="bg-[#0033A0] text-white border-none px-5 py-2 text-lg font-bold rounded-md cursor-pointer transition duration-300 hover:bg-[#002366]"
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      <div className="w-full flex flex-col overflow-y-auto bg-white rounded-lg p-3 shadow-md">
        {recordings.map((rec, index) => (
          <div key={index} className="flex flex-col mb-4">
            <div className="bg-[#FFD100] p-3 rounded-lg max-w-[80%] self-start text-[#0033A0] font-bold mt-2">
              <audio controls src={rec.audioURL}></audio>
              <p className="italic text-gray-600 mt-1">{rec.transcription}</p>
            </div>
            <div className="bg-[#0033A0] text-white font-bold p-3 rounded-lg max-w-[80%] self-end mt-2">
              <p>{rec.response || "..."}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
