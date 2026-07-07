"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type SignaturePadHandle = {
  isEmpty: () => boolean;
  toDataURL: () => string;
  clear: () => void;
};

export const SignaturePad = forwardRef<SignaturePadHandle>(function SignaturePad(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const emptyRef = useRef(true);
  const [, setTick] = useState(0);

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDraw(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    event.preventDefault();
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (emptyRef.current) {
      emptyRef.current = false;
      setTick((n) => n + 1);
    }
    event.preventDefault();
  }

  function endDraw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);
    event.preventDefault();
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    emptyRef.current = true;
    setTick((n) => n + 1);
  }

  useImperativeHandle(ref, () => ({
    isEmpty: () => emptyRef.current,
    toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
    clear,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      emptyRef.current = true;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="space-y-2">
      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          className="block h-40 w-full cursor-crosshair"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          onPointerCancel={endDraw}
        />
      </div>
      <p className="text-xs text-slate-400">
        Le bénéficiaire signe avec le doigt dans la zone ci-dessus.
      </p>
      <button
        type="button"
        onClick={clear}
        className="text-sm font-semibold text-slate-500 hover:text-slate-700 min-h-[44px]"
      >
        Effacer la signature
      </button>
    </div>
  );
});
