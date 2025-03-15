

export interface ChatState {
    sideBarExpanded?: boolean;
    sessions?: any[];
    currentSession?: any;
    searchSessionValue?: string;
    sessionConfigExpanded: boolean;
    messages: any[];
    value?: string;
    files: any[];
    // 展开文件
    fileExpanded?: boolean;
    createSessionVisible?: boolean;
    chatModels: any[];
    models: any[];
    generateLoading: boolean;
    /**
     * 是否开启联网
     */
    networking: boolean;
    /**
     * 当前选中的用户提示
     */
    selectedUserPrompt?: any;

    /**
     * 是否显示代码渲染
     */
    codeRendering: {
        visible: boolean,
        index: number,
        /**
         * 代码渲染的items
         */
        items: CodeRenderingItem[]
    }
}

export interface CodeRenderingItem {
    language: string;
    code: string;
    title: string;
    description: string;
}

export const initialState: ChatState = {
    sideBarExpanded: localStorage.getItem('sideBarExpanded') === 'true',
    sessions: [],
    selectedUserPrompt: null,
    currentSession: {
        id: -1,
    },
    sessionConfigExpanded: false,
    messages: [],
    value: '',
    files: [],
    searchSessionValue: '',
    fileExpanded: false,
    chatModels: [],
    models: [],
    generateLoading: false,
    networking: false,
    codeRendering: {
        visible: false,
        index: 0,
        items: [] as CodeRenderingItem[],
    }
}