import Logo from "@/components/Logo";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* Glow effect behind the logo */}
        <div className="absolute inset-0 bg-primary-container/20 blur-3xl rounded-full w-40 h-40 animate-pulse"></div>
        
        {/* Animated Logo */}
        <Logo className="w-32 h-32 animate-pulse relative z-10 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
        
        <div className="mt-8 font-headline-md text-xl tracking-widest text-primary-container uppercase animate-pulse">
          Veyronix
        </div>
      </div>
    </div>
  );
}
