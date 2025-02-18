import { getIconByName } from "@/utils/iconutil";

interface ChannelItem {
    id: string;
    name: string;
    description: string;
    url: string;
    tags: string[];
    icon: React.ReactNode;
}

const Channel = [
    {
        id: 'OpenAI',
        name: 'OpenAI',
        description: 'OpenAI 是一个人工智能研究公司，提供各种AI服务',
        url: 'https://openai.com',
        tags: ['AI', 'OpenAI', 'ChatGPT'],
    },
    {
        id: 'Claude',
        name: 'Claude',
        description: 'Claude 是一个人工智能研究公司，提供各种AI服务',
        url: 'https://claude.ai',
        tags: ['AI', 'Claude', 'ChatGPT'],
    },
    {
        id: 'Gemini',
        name: 'Gemini',
        description: 'Gemini 是Google推出的AI模型，提供各种AI服务',
        url: 'https://gemini.google.com/',
        tags: ['AI', 'Gemini', 'Google'],
        enabled: true,
    },
    {
        id: 'Qwen',
        name: 'Qwen',
        description: 'Qwen 是阿里巴巴推出的AI模型，提供各种AI服务',
        url: 'https://www.aliyun.com/product/tongyi',
        tags: ['AI', 'Qwen', '阿里巴巴'],
        enabled: true,
    },
    {
        id: 'DeepSeek',
        name: 'DeepSeek',
        description: 'DeepSeek 是深度求索推出的AI模型，提供各种AI服务',
        url: 'https://www.deepseek.com/',
        tags: ['AI', 'DeepSeek', '深度求索'],
        enabled: true,
    },
    {
        id: 'ChatGLM',
        name: 'ChatGLM',
        description: 'ChatGLM 是清华大学推出的AI模型，提供各种AI服务',
        url: 'https://chatglm.cn/',
        tags: ['AI', 'ChatGLM', '清华大学'],
        enabled: true,
    },
    {
        id:'Doubao',
        name:'Doubao',
        description:'Doubao 是多宝推出的AI模型，提供各种AI服务',
        url:'https://team.doubao.com',
        tags:['AI','Doubao','多宝'],
        enabled:true,
    },
    {
        id:'Hunyuan',
        name:'Hunyuan',
        description:'Hunyuan 是腾讯推出的AI模型，提供各种AI服务',
        url:'https://hunyuan.tencent.com/',
        tags:['AI','Hunyuan','腾讯'],
        enabled:true,
    },
    {
        id:'GiteeAI',
        name:'GiteeAI',
        description:'GiteeAI Gitee提供的AI服务平台，提供各种AI服务',
        url:'https://ai.gitee.com/',
        tags:['AI','GiteeAI','Gitee'],
        enabled:true,
    },
    {
        id:'Ollama',
        name:'Ollama',  
        description:'Ollama 是一个开源的AI模型，提供各种AI服务',
        url:'https://ollama.com/',
        tags:['AI','Ollama','开源'],
        enabled:true,
    },
    {
        id:'SiliconCloud',
        name:'SiliconCloud',
        description:'SiliconCloud 是硅云推出的AI模型，提供各种AI服务',
        url:'https://cloud.siliconflow.cn/',
        tags:['AI','SiliconCloud','硅云'],
        enabled:true,
    }
] as ChannelItem[];

Channel.forEach(item => {
    item.icon = getIconByName(item.id,24);
})

export default Channel;
