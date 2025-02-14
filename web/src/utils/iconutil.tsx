import { IconAvatar } from "@lobehub/icons";
import React, { lazy, Suspense } from 'react';
import { theme } from "antd";

const OpenAI = lazy(() => import('@lobehub/icons').then(module => ({ default: module.OpenAI })));
const ChatGLM = lazy(() => import('@lobehub/icons').then(module => ({ default: module.ChatGLM })));
const Claude = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Claude })));
const Baichuan = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Baichuan })));
const Ai21 = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Ai21 })));
const Google = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Google })));
const Grok = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Grok })));
const Hunyuan = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Hunyuan })));
const Minimax = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Minimax })));
const Spark = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Spark })));
const Moonshot = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Moonshot })));
const Wenxin = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Wenxin })));
const Yi = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Yi })));
const Zhipu = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Zhipu })));
const DeepSeek = lazy(() => import('@lobehub/icons').then(module => ({ default: module.DeepSeek })));
const Qingyan = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Qingyan })));
const Qwen = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Qwen })));

const Adobe = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Adobe })));
const AdobeFirefly = lazy(() => import('@lobehub/icons').then(module => ({ default: module.AdobeFirefly })));
const Ai360 = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Ai360 })));
const AiMass = lazy(() => import('@lobehub/icons').then(module => ({ default: module.AiMass })));
const Alibaba = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Alibaba })));
const AlibabaCloud = lazy(() => import('@lobehub/icons').then(module => ({ default: module.AlibabaCloud })));
const AntGroup = lazy(() => import('@lobehub/icons').then(module => ({ default: module.AntGroup })));
const Anthropic = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Anthropic })));
const Automatic = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Automatic })));
const Aws = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Aws })));
const Aya = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Aya })));
const Azure = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Azure })));
const Baidu = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Baidu })));
const BaiduCloud = lazy(() => import('@lobehub/icons').then(module => ({ default: module.BaiduCloud })));
const Bedrock = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Bedrock })));
const Bing = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Bing })));
const ByteDance = lazy(() => import('@lobehub/icons').then(module => ({ default: module.ByteDance })));
const Civitai = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Civitai })));
const Clipdrop = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Clipdrop })));
const Cloudflare = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Cloudflare })));
const CodeGeeX = lazy(() => import('@lobehub/icons').then(module => ({ default: module.CodeGeeX })));
const CogVideo = lazy(() => import('@lobehub/icons').then(module => ({ default: module.CogVideo })));
const CogView = lazy(() => import('@lobehub/icons').then(module => ({ default: module.CogView })));
const Cohere = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Cohere })));
const Colab = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Colab })));
const ComfyUI = lazy(() => import('@lobehub/icons').then(module => ({ default: module.ComfyUI })));
const Copilot = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Copilot })));
const Coze = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Coze })));
const Cursor = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Cursor })));
const Dalle = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Dalle })));
const Dbrx = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Dbrx })));
const DeepAI = lazy(() => import('@lobehub/icons').then(module => ({ default: module.DeepAI })));
const DeepMind = lazy(() => import('@lobehub/icons').then(module => ({ default: module.DeepMind })));
const Dify = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Dify })));
const Doubao = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Doubao })));
const Fal = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Fal })));
const Fireworks = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Fireworks })));
const FishAudio = lazy(() => import('@lobehub/icons').then(module => ({ default: module.FishAudio })));
const Flux = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Flux })));
const Gemini = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Gemini })));
const Gemma = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Gemma })));
const GiteeAI = lazy(() => import('@lobehub/icons').then(module => ({ default: module.GiteeAI })));
const Github = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Github })));
const GithubCopilot = lazy(() => import('@lobehub/icons').then(module => ({ default: module.GithubCopilot })));
const Glif = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Glif })));
const Groq = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Groq })));
const Hailuo = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Hailuo })));
const Haiper = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Haiper })));
const Hedra = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Hedra })));
const Higress = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Higress })));
const HuggingFace = lazy(() => import('@lobehub/icons').then(module => ({ default: module.HuggingFace })));
const Ideogram = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Ideogram })));
const InternLM = lazy(() => import('@lobehub/icons').then(module => ({ default: module.InternLM })));
const Jina = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Jina })));
const Kimi = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Kimi })));
const Kling = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Kling })));
const LangChain = lazy(() => import('@lobehub/icons').then(module => ({ default: module.LangChain })));
const Langfuse = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Langfuse })));
const Lightricks = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Lightricks })));
const LiveKit = lazy(() => import('@lobehub/icons').then(module => ({ default: module.LiveKit })));
const LLaVA = lazy(() => import('@lobehub/icons').then(module => ({ default: module.LLaVA })));
const LmStudio = lazy(() => import('@lobehub/icons').then(module => ({ default: module.LmStudio })));
const LobeHub = lazy(() => import('@lobehub/icons').then(module => ({ default: module.LobeHub })));
const Luma = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Luma })));
const Magic = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Magic })));
const Meta = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Meta })));
const Midjourney = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Midjourney })));
const Mistral = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Mistral })));
const ModelScope = lazy(() => import('@lobehub/icons').then(module => ({ default: module.ModelScope })));
const MyShell = lazy(() => import('@lobehub/icons').then(module => ({ default: module.MyShell })));
const Notion = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Notion })));
const Nova = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Nova })));
const Novita = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Novita })));
const Nvidia = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Nvidia })));
const Ollama = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Ollama })));
const OpenChat = lazy(() => import('@lobehub/icons').then(module => ({ default: module.OpenChat })));
const OpenRouter = lazy(() => import('@lobehub/icons').then(module => ({ default: module.OpenRouter })));
const PaLM = lazy(() => import('@lobehub/icons').then(module => ({ default: module.PaLM })));
const Perplexity = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Perplexity })));
const Pika = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Pika })));
const PixVerse = lazy(() => import('@lobehub/icons').then(module => ({ default: module.PixVerse })));
const Poe = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Poe })));
const Pollinations = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Pollinations })));
const PPIO = lazy(() => import('@lobehub/icons').then(module => ({ default: module.PPIO })));
const Recraft = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Recraft })));
const Replicate = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Replicate })));
const Replit = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Replit })));
const Runway = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Runway })));
const Rwkv = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Rwkv })));
const SenseNova = lazy(() => import('@lobehub/icons').then(module => ({ default: module.SenseNova })));
const SiliconCloud = lazy(() => import('@lobehub/icons').then(module => ({ default: module.SiliconCloud })));
const Stability = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Stability })));
const Stepfun = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Stepfun })));
const Suno = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Suno })));
const Sync = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Sync })));
const Tencent = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Tencent })));
const TencentCloud = lazy(() => import('@lobehub/icons').then(module => ({ default: module.TencentCloud })));
const Tiangong = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Tiangong })));
const TII = lazy(() => import('@lobehub/icons').then(module => ({ default: module.TII })));
const Together = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Together })));
const Tripo = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Tripo })));
const Udio = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Udio })));
const Upstage = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Upstage })));
const V0 = lazy(() => import('@lobehub/icons').then(module => ({ default: module.V0 })));
const Vercel = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Vercel })));
const VertexAI = lazy(() => import('@lobehub/icons').then(module => ({ default: module.VertexAI })));
const Vidu = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Vidu })));
const Viggle = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Viggle })));
const Vllm = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Vllm })));

const WorkersAI = lazy(() => import('@lobehub/icons').then(module => ({ default: module.WorkersAI })));
const XAI = lazy(() => import('@lobehub/icons').then(module => ({ default: module.XAI })));
const Xuanyuan = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Xuanyuan })));
const Zeabur = lazy(() => import('@lobehub/icons').then(module => ({ default: module.Zeabur })));
const ZeroOne = lazy(() => import('@lobehub/icons').then(module => ({ default: module.ZeroOne })));
const { 
  useToken
} = theme;
const iconMap: { [key: string]: React.LazyExoticComponent<any> } = {
  OpenAI, ChatGLM, Claude, Baichuan, Ai21, Google, Grok, Hunyuan, Minimax, Spark,
  Moonshot, Wenxin, Yi, Zhipu, DeepSeek, Qingyan, Qwen, Adobe, AdobeFirefly, Ai360,
  AiMass, Alibaba, AlibabaCloud, AntGroup, Anthropic, Automatic, Aws, Aya, Azure,
  Baidu, BaiduCloud, Bedrock, Bing, ByteDance, Civitai, Clipdrop, Cloudflare,
  CodeGeeX, CogVideo, CogView, Cohere, Colab, ComfyUI, Copilot, Coze, Cursor,
  Dalle, Dbrx, DeepAI, DeepMind, Dify, Doubao, Fal, Fireworks, FishAudio, Flux,
  Gemini, Gemma, GiteeAI, Github, GithubCopilot, Glif, Groq, Hailuo, Haiper,
  Hedra, Higress, HuggingFace, Ideogram, InternLM, Jina, Kimi, Kling, LangChain,
  Langfuse, Lightricks, LiveKit, LLaVA, LmStudio, LobeHub, Luma, Magic, Meta,
  Midjourney, Mistral, ModelScope, MyShell, Notion, Nova, Novita, Nvidia, Ollama,
  OpenChat, OpenRouter, PaLM, Perplexity, Pika, PixVerse, Poe, Pollinations, PPIO,
  Recraft, Replicate, Replit, Runway, Rwkv, SenseNova, SiliconCloud, Stability,
  Stepfun, Suno, Sync, Tencent, TencentCloud, Tiangong, TII, Together, Tripo,
  Udio, Upstage, V0, Vercel, VertexAI, Vidu, Viggle, Vllm, WorkersAI, XAI,
  Xuanyuan, Zeabur, ZeroOne
};

// 根据名称获取对应的图标
export function getIconByName(name: string, size: number = 36) {
  const IconComponent = iconMap[name] || OpenAI;
  const {token} = useToken();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IconAvatar 
        Icon={IconComponent} 
        color={token.colorText}
        size={size} />
    </Suspense>
  );
}