import { useRef, useState } from "react";

export function useAICaption() {
  const [caption, setCaption] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function speak(text: string) {
    setCaption(text);
    const r = await fetch(`/api/zuri/tts/say?text=${encodeURIComponent(text)}`);
    if (!r.ok) throw new Error("TTS failed");
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    if (!audioRef.current) {
      const a = document.createElement("audio");
      a.setAttribute("autoplay", "true");
      document.body.appendChild(a);
      audioRef.current = a;
    }
    audioRef.current.src = url;
    await audioRef.current.play().catch(() => {});
  }

  function clearCaption() {
    setCaption("");
  }

  return { caption, speak, clearCaption };
}
