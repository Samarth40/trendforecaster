export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Overlay */}
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 opacity-10 transform rotate-45"></div>
      
      {/* Animated Circles */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-cyan-500 rounded-full filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0">
        {/* Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

        {/* Animated Shapes */}
        <div className="absolute top-1/4 left-1/3 w-12 h-12 border border-purple-500/20 rounded-lg transform rotate-45 animate-float"></div>
        <div className="absolute top-2/3 right-1/4 w-16 h-16 border border-cyan-500/20 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-8 h-8 border border-purple-500/20 rounded-lg transform -rotate-12 animate-float animation-delay-2000"></div>
        
        {/* Glowing Dots */}
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-glow"></div>
        <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-glow animation-delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/2 w-2 h-2 bg-purple-400 rounded-full animate-glow animation-delay-2000"></div>

        {/* Gradient Lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-slide"></div>
          <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-slide animation-delay-1000"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-slide animation-delay-2000"></div>
        </div>
      </div>
    </div>
  );
} 