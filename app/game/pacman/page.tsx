"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayIcon, ChevronLeftIcon, PauseIcon, ChevronUpIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

// --- Game Constants ---
const TILE = 26;
const COLS = 23;
const ROWS = 26;

const PATH = 0, W = 1, GATE = 2, HOUSE = 3;
const PELLET_SCORE = 10, POWER_SCORE = 50, EAT_GHOST_BASE = 200;
const FPOWER_TIME = 6000, SCATTER_TIME = 7000, CHASE_TIME = 20000;
const GHOST_SPEED = 100, PLAYER_SPEED = 120, FRIGHT_SPEED = 80, EATEN_SPEED = 200;

// --- Map Generation ---
const createGrid = () => {
    const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    for(let x=0; x<COLS; x++) { g[0][x]=W; g[ROWS-1][x]=W; }
    for(let y=0; y<ROWS; y++) { g[y][0]=W; g[y][COLS-1]=W; }
    for(let x=2; x<COLS-2; x++) g[4][x]=W;
    for(let x=2; x<COLS-2; x++) g[8][x]=W;
    for(let x=2; x<COLS-2; x++) g[ROWS-5][x]=W;
    [3,7,11,15,19].forEach(cx => {
        for(let y=2; y<ROWS-2; y++){
            if(y===12 || y===13) continue; 
            if(y%2===0) g[y][cx]=W;
        }
    });
    for(let y=11; y<=13; y++) {
        for(let x=9; x<=13; x++) {
            const border = (y===11||y===13||x===9||x===13); 
            g[y][x] = border ? W : HOUSE;
        }
    }
    g[11][11] = GATE;
    g[12][0] = PATH; g[12][COLS-1] = PATH;
    [4,8,ROWS-5].forEach(ry => { g[ry][5]=PATH; g[ry][17]=PATH; });
    g[2][3]=PATH; g[2][COLS-4]=PATH; 
    g[ROWS-3][3]=PATH; g[ROWS-3][COLS-4]=PATH;
    return g;
};

const START_POS = {
    player: { x: 11, y: 17 },
    ghosts: [
      { name:'Blaze',  color:'#ff4d4f',   x:11, y:10, dir:'left',  corner:[COLS-2,1],      mode:'scatter' },
      { name:'Pearl',  color:'#ff74c5',   x:10, y:10, dir:'up',    corner:[1,1],          mode:'scatter' },
      { name:'Indigo', color:'#45e3ff',   x:12, y:10, dir:'down',  corner:[COLS-2,ROWS-2],mode:'scatter' },
      { name:'Cedar',  color:'#f7a44c',   x:13, y:10, dir:'up',    corner:[1,ROWS-2],     mode:'scatter' },
    ]
} as const;

// --- Types ---
type Direction = 'up' | 'down' | 'left' | 'right';
type Mode = 'scatter' | 'chase' | 'frightened' | 'eaten' | 'leaving';
type Entity = {
    px: number; py: number;
    dir: Direction; nextDir?: Direction;
    speed: number; radius: number;
    mouth?: number;
    name?: string; color?: string; index?: number; 
    mode?: Mode; corner?: number[]; dead?: boolean;
};

// --- Helper Functions (Pure) ---
const nearCenter = (px: number, py: number, tx: number, ty: number) => {
    const cx = tx * TILE + TILE/2, cy = ty * TILE + TILE/2;
    return Math.abs(px - cx) < 1.2 && Math.abs(py - cy) < 1.2;
};
const snapCenter = (o: Entity, tx: number, ty: number) => {
    o.px = tx * TILE + TILE/2; o.py = ty * TILE + TILE/2;
};
const applyMove = (o: Entity, dir: Direction, sp: number) => {
    if(dir==='left') o.px-=sp; else if(dir==='right') o.px+=sp;
    else if(dir==='up') o.py-=sp; else if(dir==='down') o.py+=sp;
};
const opposite = (d: Direction): Direction => {
    if(d==='left') return 'right'; if(d==='right') return 'left';
    if(d==='up') return 'down'; return 'up';
};

export default function PacmanPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- State ---
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [highScore, setHighScore] = useState(() => {
        if (typeof window === 'undefined') return 0;
        try { return JSON.parse(localStorage.getItem('tdx_mazechase_v1') || '{}').hiscore || 0; } catch { return 0; }
    });
    const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'WIN'>('START');

    // --- Mutable Engine State ---
    const gameRef = useRef({
        grid: [] as number[][],
        pellets: [] as number[][],
        pelletCount: 0,
        running: false,
        paused: false,
        score: 0,
        highScore: 0,
        lives: 3,
        frightened: false,
        frightEnd: 0,
        eatChain: 0,
        cycleTimer: 0,
        inChase: false,
        player: {} as Entity,
        ghosts: [] as Entity[],
        gameState: 'START' as 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'WIN',
        lastDeath: 0,
    });

    const reqRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    // --- Logic Initializers ---
    const makePlayer = () => ({
        px: START_POS.player.x * TILE + TILE/2, py: START_POS.player.y * TILE + TILE/2,
        dir: 'left' as Direction, nextDir: 'left' as Direction,
        speed: PLAYER_SPEED, radius: TILE * 0.42, mouth: 0
    });

    const makeGhost = (g: typeof START_POS.ghosts[number], i: number): Entity => ({
        ...g, 
        index: i, 
        px: g.x * TILE + TILE/2, 
        py: g.y * TILE + TILE/2,
        dir: g.dir as Direction, 
        nextDir: g.dir as Direction, 
        speed: GHOST_SPEED,
        mode: (g.mode as Mode) || 'scatter', 
        radius: TILE * 0.42, 
        dead: false,
        corner: [...g.corner] as number[]
    });

    // --- Actions ---
    const saveHi = (s: number) => {
        localStorage.setItem('tdx_mazechase_v1', JSON.stringify({ hiscore: s }));
    };

    const resetPositions = () => {
        const g = gameRef.current;
        g.player = makePlayer();
        g.ghosts = START_POS.ghosts.map((ghost, i) => makeGhost(ghost, i));
        g.frightened = false; g.inChase = false; g.cycleTimer = 0;
    };

    const gameOver = () => {
        const g = gameRef.current;
        g.running = false;
        g.gameState = 'GAMEOVER';
        if(g.score > g.highScore) { g.highScore = g.score; setHighScore(g.score); saveHi(g.score); }
        setGameState('GAMEOVER');
    };

    const startGame = () => {
        const g = gameRef.current;
        g.grid = createGrid();
        const p: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        let count = 0;
        for(let y=1; y<ROWS-1; y++) for(let x=1; x<COLS-1; x++) {
            if(g.grid[y][x] === PATH) { p[y][x] = 1; count++; }
        }
        for(let y=11; y<=14; y++) for(let x=9; x<=13; x++) if(p[y]?.[x]) { p[y][x]=0; count--; }
        [[1,1],[COLS-2,1],[1,ROWS-2],[COLS-2,ROWS-2]].forEach(([x,y]) => { if(g.grid[y][x] === PATH) p[y][x] = 2; });
        
        g.pellets = p; g.pelletCount = count;
        g.score = 0; setScore(0);
        g.lives = 3; setLives(3);
        g.highScore = highScore;
        setLevel(1); resetPositions();
        g.running = true; g.paused = false;
        g.gameState = 'PLAYING'; setGameState('PLAYING');
    };

    const togglePause = () => {
        const g = gameRef.current;
        if(g.gameState === 'PLAYING') {
            g.paused = true; g.gameState = 'PAUSED'; setGameState('PAUSED');
        } else if (g.gameState === 'PAUSED') {
            g.paused = false; g.gameState = 'PLAYING'; setGameState('PLAYING');
        }
    };

    // --- Loop ---
    useEffect(() => {
        const g = gameRef.current;

        const passable = (x:number, y:number, isGhost=false, mode?: string) => {
            const t = (g.grid[y] || [])[x];
            if(t === undefined || t === W) return false;
            if(t === GATE) return isGhost && (mode === 'eaten' || mode === 'leaving');
            return true;
        };

        const targetFor = (gh: Entity) => {
            const px = Math.floor(g.player.px/TILE), py = Math.floor(g.player.py/TILE), pd = g.player.dir;
            if(gh.mode==='scatter') return gh.corner!;
            if(gh.mode==='frightened') return [px, py]; 
            if(gh.mode==='eaten' || gh.dead) return [11, 12];
            if(gh.mode==='leaving') return [11, 7];
            
            switch(gh.index) {
                case 0: return [px, py];
                case 1: return [pd==='left'?px-4:pd==='right'?px+4:px, pd==='up'?py-4:pd==='down'?py+4:py];
                case 3: return Math.hypot(gh.px - g.player.px, gh.py - g.player.py)/TILE < 8 ? gh.corner! : [px, py];
                default: return [px, py];
            }
        };

        const chooseDir = (gh: Entity, target: number[], centers: boolean): Direction => {
            const rev = opposite(gh.dir), tx = Math.floor(gh.px/TILE), ty = Math.floor(gh.py/TILE);
            if(!centers) return gh.dir;
            const opts: {d:Direction, x:number, y:number}[] = [];
            ([['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]] as [Direction, number, number][]).forEach(([d, dx, dy]) => {
                if(d !== rev && passable(tx+dx, ty+dy, true, gh.mode)) opts.push({d, x:tx+dx, y:ty+dy});
            });
            if(opts.length === 0) return rev;
            opts.sort((a, b) => {
                const da = Math.hypot(a.x - target[0], a.y - target[1]), db = Math.hypot(b.x - target[0], b.y - target[1]);
                return g.frightened && !gh.dead ? db - da : da - db;
            });
            return opts[0].d;
        };

        const loop = (time: number) => {
            const dt = Math.min((time - (lastTimeRef.current || time)) / 1000, 0.1);
            lastTimeRef.current = time;

            if (g.running && !g.paused) {
                // Modes
                if (g.frightened && performance.now() >= g.frightEnd) {
                    g.frightened = false; g.ghosts.forEach(gh => gh.mode = 'chase'); g.eatChain = 0;
                }
                g.cycleTimer += dt * 1000;
                const phase = g.inChase ? CHASE_TIME : SCATTER_TIME;
                if (!g.frightened && g.cycleTimer >= phase) {
                    g.inChase = !g.inChase; g.cycleTimer = 0;
                    g.ghosts.forEach(gh => gh.mode = g.inChase ? 'chase' : 'scatter');
                }

                // Player
                const p = g.player, sp = p.speed * dt;
                const tx = Math.floor(p.px/TILE), ty = Math.floor(p.py/TILE);
                let atC = nearCenter(p.px, p.py, tx, ty);
                if (ty===12 && tx===0 && p.dir==='left') p.px=(COLS-1)*TILE-1;
                else if (ty===12 && tx===COLS-1 && p.dir==='right') p.px=1;
                else {
                    if (p.nextDir === opposite(p.dir)) { p.dir = p.nextDir; p.nextDir = undefined; snapCenter(p, tx, ty); atC=true; }
                    if (atC && p.nextDir && p.nextDir !== p.dir) {
                        const nx = tx + (p.nextDir==='right'?1:p.nextDir==='left'?-1:0);
                        const ny = ty + (p.nextDir==='down'?1:p.nextDir==='up'?-1:0);
                        if (passable(nx, ny)) { p.dir = p.nextDir; p.nextDir = undefined; snapCenter(p, tx, ty); atC=true; }
                    }
                    if (passable(tx+(p.dir==='right'?1:p.dir==='left'?-1:0), ty+(p.dir==='down'?1:p.dir==='up'?-1:0))) applyMove(p, p.dir, sp);
                    else snapCenter(p, tx, ty);
                }
                const cx = Math.floor(p.px/TILE), cy = Math.floor(p.py/TILE);
                if (g.pellets[cy]?.[cx]) {
                    const t = g.pellets[cy][cx];
                    g.score += (t===1?PELLET_SCORE:POWER_SCORE); setScore(g.score);
                    if(g.score > g.highScore) { g.highScore = g.score; setHighScore(g.score); saveHi(g.score); }
                    if(t===2) { g.frightened=true; g.frightEnd=performance.now()+FPOWER_TIME; g.eatChain=0; g.ghosts.forEach(gh=> {if(!gh.dead) gh.mode='frightened'}); }
                    g.pellets[cy][cx]=0; g.pelletCount--;
                }
                if(p.mouth !== undefined) { p.mouth+=dt*8; if(p.mouth>Math.PI) p.mouth-=Math.PI; }

                // Ghosts
                g.ghosts.forEach(gh => {
                    const gsp = (gh.mode==='eaten'?EATEN_SPEED: g.frightened && !gh.dead ? FRIGHT_SPEED: gh.speed) * dt;
                    const gtx = Math.floor(gh.px/TILE), gty = Math.floor(gh.py/TILE);
                    if (gty===12 && gtx===0 && gh.dir==='left') gh.px=(COLS-1)*TILE-1;
                    else if (gty===12 && gtx===COLS-1 && gh.dir==='right') gh.px=1;
                    else {
                        if (nearCenter(gh.px, gh.py, gtx, gty)) gh.dir = chooseDir(gh, targetFor(gh), true);
                        else if (!passable(gtx+(gh.dir==='right'?1:gh.dir==='left'?-1:0), gty+(gh.dir==='down'?1:gh.dir==='up'?-1:0), true, gh.mode)) {
                            snapCenter(gh, gtx, gty); gh.dir = chooseDir(gh, targetFor(gh), true);
                        }
                        applyMove(gh, gh.dir, gsp);
                    }
                    if(gh.mode==='leaving' && Math.hypot(gh.px-(11*TILE+TILE/2), gh.py-(7*TILE+TILE/2))<8) gh.mode=g.inChase?'chase':'scatter';
                    if((gh.mode==='eaten'||gh.dead) && Math.hypot(gh.px-(11*TILE+TILE/2), gh.py-(12*TILE+TILE/2))<8) { gh.dead=false; gh.mode='leaving'; }
                    
                    if(Math.hypot(gh.px-p.px, gh.py-p.py) < TILE*0.6) {
                        if(g.frightened && !gh.dead) {
                            gh.mode='eaten'; gh.dead=true; g.eatChain=Math.min(4, g.eatChain+1);
                            g.score += EAT_GHOST_BASE*(2**(g.eatChain-1)); setScore(g.score);
                        } else if(!gh.dead && gh.mode!=='eaten' && performance.now()-g.lastDeath>500) {
                            g.lastDeath=performance.now(); g.lives--; setLives(Math.max(0, g.lives));
                            if(g.lives < 0) gameOver();
                            else resetPositions();
                        }
                    }
                });
                if(g.pelletCount<=0) { g.running=false; g.gameState='WIN'; setGameState('WIN'); }
            }

            // Render
            const c = canvasRef.current, ctx = c?.getContext('2d');
            if(ctx && c && g.grid.length) {
                ctx.clearRect(0, 0, c.width, c.height);
                ctx.lineWidth=3; ctx.strokeStyle='#E5E5EA'; ctx.fillStyle='#D1D1D6';
                for(let y=0; y<ROWS; y++) for(let x=0; x<COLS; x++) {
                    const t=g.grid[y][x];
                    if(t===W||t===GATE) {
                        const rx=x*TILE, ry=y*TILE;
                        if(t===GATE) { ctx.save(); ctx.strokeStyle='#93C5FD'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(rx,ry+TILE/2); ctx.lineTo(rx+TILE,ry+TILE/2); ctx.stroke(); ctx.restore(); }
                        else { ctx.beginPath(); ctx.roundRect(rx+2,ry+2,TILE-4,TILE-4,3); ctx.fill(); }
                    }
                }
                for(let y=0; y<ROWS; y++) for(let x=0; x<COLS; x++) {
                    const v=g.pellets[y]?.[x]; if(!v) continue;
                    const cx=x*TILE+TILE/2, cy=y*TILE+TILE/2;
                    ctx.fillStyle=(v===1?'#9CA3AF':'#FBBF24'); ctx.beginPath(); ctx.arc(cx,cy,v===1?3:7,0,Math.PI*2); ctx.fill();
                }
                g.ghosts.forEach(gh => {
                    if(!gh.px || gh.mode==='eaten') return;
                    ctx.fillStyle=(g.frightened && !gh.dead?'#3B82F6':gh.color!); ctx.beginPath();
                    ctx.arc(gh.px, gh.py, TILE*0.42, Math.PI, 0); ctx.lineTo(gh.px+TILE*0.42, gh.py+TILE*0.35); ctx.lineTo(gh.px-TILE*0.42, gh.py+TILE*0.35); ctx.fill();
                    ctx.fillStyle='#fff';
                    ctx.beginPath(); ctx.arc(gh.px-5, gh.py-3, 4, 0, Math.PI*2); ctx.arc(gh.px+5, gh.py-3, 4, 0, Math.PI*2); ctx.fill();
                });
                const p = g.player;
                if(p.px) {
                    const ang=Math.abs(Math.sin(p.mouth || 0))*0.6+0.2, dAng=(p.dir==='right'?0:p.dir==='down'?Math.PI/2:p.dir==='left'?Math.PI:-Math.PI/2);
                    ctx.fillStyle='#FACC15'; ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.arc(p.px, p.py, p.radius, dAng+ang, dAng-ang, false); ctx.fill();
                }
            }
            reqRef.current = requestAnimationFrame(loop);
        };
        reqRef.current = requestAnimationFrame(loop);

        const handleKeyDown = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d'].includes(k)) e.preventDefault();
            if(k==='p') togglePause();
            if(!g.running && ['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)) {
                if(g.gameState!=='PLAYING') startGame();
            }
            if(!g.running || g.paused) return;
            if(k==='arrowup'||k==='w') g.player.nextDir='up'; if(k==='arrowdown'||k==='s') g.player.nextDir='down';
            if(k==='arrowleft'||k==='a') g.player.nextDir='left'; if(k==='arrowright'||k==='d') g.player.nextDir='right';
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => { window.removeEventListener('keydown', handleKeyDown); if(reqRef.current) cancelAnimationFrame(reqRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highScore]);

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center font-inter relative outline-none select-none py-6 md:py-12">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="z-10 w-full max-w-5xl relative flex flex-col items-center">
                {/* Mobile Comprehensive Header */}
                <div className="md:hidden w-full px-5 mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="p-2.5 rounded-xl bg-white/80 border border-white/50 shadow-sm text-gray-600 backdrop-blur-md active:scale-95 transition-all">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </Link>
                        
                        <div className="flex gap-2">
                             <div className="px-5 py-2 rounded-xl bg-black shadow-xl flex flex-col items-center justify-center">
                                <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold leading-tight">Score</span>
                                <span className="text-xl font-black text-white leading-none tabular-nums">{score}</span>
                             </div>
                             <button onClick={togglePause} className="p-2.5 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                                {gameState === 'PAUSED' ? <PlayIcon className="w-6 h-6" /> : <PauseIcon className="w-6 h-6" />}
                             </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 bg-white/60 backdrop-blur-xl border border-white/80 p-3 rounded-2xl shadow-sm">
                        <div className="flex flex-col items-center border-r border-gray-200/50">
                            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Level</span>
                            <span className="text-base font-black text-gray-900 leading-none">{level}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Lives</span>
                            <div className="flex gap-1.5">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-gray-200'}`} />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-center border-l border-gray-200/50">
                            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Best</span>
                            <span className="text-base font-black text-gray-900 leading-none tabular-nums">{highScore}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:flex flex-col gap-3 w-44">
                        <Link href="/dashboard" className="px-5 py-3 rounded-lg bg-white border border-black/5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
                             <ChevronLeftIcon className="w-4 h-4" /> Kembali
                        </Link>
                        <div className="flex flex-col gap-1 p-5 bg-white/70 backdrop-blur-xl rounded-xl border border-white shadow-sm">
                             <div className="text-[13px] text-gray-400 font-semibold">Skor</div>
                             <div className="text-2xl font-bold text-gray-900 leading-tight">{score}</div>
                        </div>
                        <div className="flex flex-col gap-1 p-5 bg-white/70 backdrop-blur-xl rounded-xl border border-white shadow-sm">
                             <div className="text-[13px] text-gray-400 font-semibold">Skor Tertinggi</div>
                             <div className="text-2xl font-bold text-gray-900 leading-tight">{highScore}</div>
                        </div>
                        <div className="flex flex-col gap-1 p-5 bg-black/85 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg">
                             <div className="text-[13px] text-white/50 font-semibold">Level</div>
                             <div className="text-3xl font-bold text-white leading-tight">{level}</div>
                        </div>
                        <div className="flex flex-col gap-1 p-5 bg-white/70 backdrop-blur-xl rounded-xl border border-white shadow-sm">
                             <div className="text-[13px] text-gray-400 font-semibold">Sisa Nyawa</div>
                             <div className="flex gap-2 mt-2">
                                 {Array.from({ length: 3 }).map((_, i) => (
                                     <div key={i} className={`w-4 h-4 rounded-full ${i < lives ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-gray-200'}`} />
                                 ))}
                             </div>
                        </div>
                        <button onClick={togglePause} className="mt-1 px-5 py-4 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                            {gameState === 'PAUSED' ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
                            {gameState === 'PAUSED' ? 'Lanjut' : 'Jeda'}
                        </button>
                    </div>

                    <div className="relative bg-white/50 backdrop-blur-3xl rounded-2xl shadow-xl border border-white/90 p-4 md:p-7 touch-none w-fit mx-auto">
                        <canvas ref={canvasRef} width={COLS * TILE} height={ROWS * TILE} className="bg-white/20 rounded-2xl shadow-inner border border-white/30 relative z-0 max-w-full h-auto" />
                        <AnimatePresence>
                            {(gameState === 'START' || gameState === 'GAMEOVER' || gameState === 'WIN' || gameState === 'PAUSED') && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-20"> 
                                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="text-center p-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 min-w-[280px]">
                                        {gameState === 'PAUSED' && (
                                            <>
                                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto text-orange-600">
                                                    <PauseIcon className="w-8 h-8" />
                                                </div>
                                                <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 italic">PAUSED</h1>
                                                <p className="text-gray-400 text-sm mb-6">Game sedang dihentikan sementara</p>
                                                <button onClick={togglePause} className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                                                    Lanjutkan <PlayIcon className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                        {gameState === 'START' && (
                                            <>
                                                <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">MAZE CHASE</h1>
                                                <p className="text-gray-400 text-sm mb-8">Makan pellet, hindari hantu, dan raih skor tertinggi!</p>
                                                <button onClick={startGame} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                                                    Mulai Main <PlayIcon className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                        {gameState === 'GAMEOVER' && (
                                            <>
                                                <h1 className="text-3xl font-black text-red-600 tracking-tighter mb-2 italic">GAME OVER</h1>
                                                <p className="text-gray-400 text-sm mb-6">Skor akhir kamu: <span className="text-gray-900 font-bold">{score}</span></p>
                                                <button onClick={startGame} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-xl flex items-center justify-center gap-2">
                                                    Main Lagi <ChevronRightIcon className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                        {gameState === 'WIN' && (
                                            <>
                                                <h1 className="text-3xl font-black text-blue-600 tracking-tighter mb-2 italic">YOU WIN!</h1>
                                                <p className="text-gray-400 text-sm mb-6">Luar biasa! Skor: <span className="text-gray-900 font-bold">{score}</span></p>
                                                <button onClick={startGame} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-xl flex items-center justify-center gap-2">
                                                    Main Lagi <ChevronRightIcon className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col items-center gap-6 mb-12">
                        <div className="grid grid-cols-3 gap-3 w-max">
                            <div/><button onPointerDown={(e)=>{e.preventDefault(); if(!gameRef.current.running) startGame(); gameRef.current.player.nextDir='up'}} className="w-16 h-16 bg-white border border-black/5 shadow-lg rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all active:scale-95 active:shadow-inner"><ChevronUpIcon className="w-8 h-8"/></button><div/>
                            <button onPointerDown={(e)=>{e.preventDefault(); if(!gameRef.current.running) startGame(); gameRef.current.player.nextDir='left'}} className="w-16 h-16 bg-white border border-black/5 shadow-lg rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all active:scale-95 active:shadow-inner"><ChevronLeftIcon className="w-8 h-8"/></button>
                            <div className="w-16 h-16 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-gray-200/40"/></div>
                            <button onPointerDown={(e)=>{e.preventDefault(); if(!gameRef.current.running) startGame(); gameRef.current.player.nextDir='right'}} className="w-16 h-16 bg-white border border-black/5 shadow-lg rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all active:scale-95 active:shadow-inner"><ChevronRightIcon className="w-8 h-8"/></button>
                            <div/><button onPointerDown={(e)=>{e.preventDefault(); if(!gameRef.current.running) startGame(); gameRef.current.player.nextDir='down'}} className="w-16 h-16 bg-white border border-black/5 shadow-lg rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all active:scale-95 active:shadow-inner"><ChevronDownIcon className="w-8 h-8"/></button><div/>
                        </div>
                        <div className="hidden md:block px-6 py-2 bg-black/5 rounded-full text-[11px] font-semibold text-gray-400 tracking-wide text-center uppercase tracking-widest">Gunakan WASD atau panah pada keyboard.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
