

export interface ChatState {
    sideBarExpanded?: boolean;
    sessions?: any[];
    currentSession?: any;
    searchSessionValue?: string;
    sessionConfigExpanded: boolean;
    messages?: any[];
    value?: string;
    files: any[];
    // 展开文件
    fileExpanded?: boolean;
}

export const initialState: ChatState = {
    sideBarExpanded: localStorage.getItem('sideBarExpanded') === 'true',
    sessions: [],
    currentSession: {
        id: -1,
    },
    sessionConfigExpanded: false,
    messages: [],
    value: '',
    files: [],
    searchSessionValue: '',
    fileExpanded: false,
}