
export function renderQuota(quota: number, digits = 2) {
    let quotaPerUnit = localStorage.getItem('quota_per_unit') ?? '500000';
    let displayInCurrency = localStorage.getItem('display_in_currency') ?? "true";
    if (displayInCurrency === 'true') {
        return '$' + (quota / parseFloat(quotaPerUnit as string)).toFixed(digits);
    }
    return renderNumber(quota);
}

export function renderQuotaWithPrompt(quota: any, digits: number | undefined) {
    let displayInCurrency = localStorage.getItem('display_in_currency');
    if ((displayInCurrency === 'true')) {
        return `（等价金额：${renderQuota(quota, digits)}）`;
    }
    return '';
}


export function renderNumber(num: number) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 10000) {
        return (num / 1000).toFixed(1) + 'k';
    } else {
        return num;
    }
}



/**
 * 解析accumulatedText代码块，得到代码中所有的代码块，并且提取```csharp|[BubbleSort.cs:实现冒泡排序算法] 这种格式的信息
 * @param state ChatState
 * @param accumulatedText 包含代码块的文本
 * @returns 解析后的代码块信息数组
 */
export const getCodeBlocks = (accumulatedText: string) => {
    if (!accumulatedText) return [];

    const result = [];

    try {
        // 首先尝试匹配完整的代码块
        const completeCodeBlockRegex = /```([\w\+\#]+)?\|?\[?([^\]:\n]*):?([^\]\n]*)\]?(?:\n|\s)([\s\S]*?)```/g;
        let match;
        let lastIndex = 0;

        // 处理完整的代码块
        while ((match = completeCodeBlockRegex.exec(accumulatedText)) !== null) {
            const [fullMatch, language, fileName, description, code] = match;
            lastIndex = completeCodeBlockRegex.lastIndex;

            result.push({
                language: language || 'text', // 如果没有指定语言，默认为text
                fileName: fileName || '',
                description: description || '',
                code: code.trim(),
                fullMatch,
                isComplete: true
            });
        }

        // 检查是否有未完成的代码块（只有开始标记，没有结束标记）
        // 查找最后一个 ``` 开始的代码块
        const remainingText = accumulatedText.slice(lastIndex);
        const lastCodeBlockStart = remainingText.lastIndexOf('```');

        if (lastCodeBlockStart !== -1) {
            // 找到了可能的未完成代码块
            const incompleteBlockText = remainingText.slice(lastCodeBlockStart);
            // 使用更简单的正则表达式来匹配未完成的代码块头部
            const headerRegex = /```([\w\+\#]+)?\|?\[?([^\]:\n]*):?([^\]\n]*)\]?(?:\n|\s)/;
            const headerMatch = headerRegex.exec(incompleteBlockText);

            if (headerMatch) {
                const [_, language, fileName, description] = headerMatch;
                // 提取代码部分 (去掉头部后的所有内容)
                const code = incompleteBlockText.slice(headerMatch[0].length);

                result.push({
                    language: language || 'text',
                    fileName: fileName || '',
                    description: description || '',
                    code: code.trim(),
                    fullMatch: incompleteBlockText,
                    isComplete: false
                });
            }
        }
    } catch (error) {
        console.error('解析代码块时出错:', error);
        // 出错时返回已解析的结果，不中断流程
    }

    return result;
}
