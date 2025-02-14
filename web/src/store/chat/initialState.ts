

export interface ChatState {    
    sideBarExpanded?: boolean;
    sessions?: any[];
    currentSession?: any;
}

export const initialState: ChatState = {
    sideBarExpanded: localStorage.getItem('sideBarExpanded') === 'true',
    sessions: [
        {
            id:1,
            name: 'session 1',
        }
    ],
    currentSession: null,
}