import FlowField from '@/components/FlowField';

export default function Home() {
  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden">
      
      {/* Title Overlay */}
      <div className="absolute top-5 left-5 z-10 text-white font-mono pointer-events-none select-none">
        <h1 className="text-4xl font-bold tracking-tighter">FLOW</h1>
        <p className="text-sm opacity-60">Generative Noise Field</p>
      </div>

      {/* The P5 Sketch */}
      <div className="absolute inset-0 z-0">
        <FlowField />
      </div>
      
    </main>
  );
}
