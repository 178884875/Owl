import { useEffect, useRef } from "react";

interface CodePreviewProps {
  code: string;
  fileName: string;
  language: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, fileName, language }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // 判断是否为React代码
      const isReactCode = language === 'jsx' || language === 'tsx' || fileName.endsWith('.jsx') || fileName.endsWith('.tsx');
      
      if (isReactCode) {
        // 处理代码中的模块导入导出语句
        let processedCode = code;
        
        // 移除import语句
        processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
        processedCode = processedCode.replace(/import\s+{.*?}\s+from\s+['"].*?['"];?/g, '');
        processedCode = processedCode.replace(/import\s+['"].*?['"];?/g, '');
        
        // 移除export语句
        processedCode = processedCode.replace(/export\s+default\s+/g, '');
        processedCode = processedCode.replace(/export\s+{.*?};?/g, '');
        processedCode = processedCode.replace(/export\s+/g, '');
        
        // 为React代码准备HTML模板
        const htmlTemplate = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>${fileName}</title>
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <!-- 添加Tailwind CSS -->
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                #root { width: 100%; height: 100vh; overflow: auto; }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="text/babel">
                // 模拟模块环境
                const exports = {};
                const module = { exports };
                const require = (module) => {
                  // 模拟常用模块
                  if (module === 'react') return React;
                  if (module === 'react-dom') return ReactDOM;
                  return {};
                };
                
                // 确保React Hooks可用
                const { useState, useEffect, useRef, useContext, useMemo, useCallback, useReducer } = React;
                
                ${processedCode}
                
                // 尝试渲染组件
                try {
                  // 检查代码中是否有默认导出
                  if (typeof App !== 'undefined') {
                    const root = ReactDOM.createRoot(document.getElementById('root'));
                    root.render(React.createElement(App));
                  } else {
                    // 尝试查找代码中定义的最后一个组件
                    const components = Object.keys(window).filter(key => 
                      typeof window[key] === 'function' && 
                      /^[A-Z]/.test(key) && 
                      (String(window[key]).includes('React.createElement') || 
                       String(window[key]).includes('_jsx') || 
                       String(window[key]).includes('useState') || 
                       String(window[key]).includes('return /*#__PURE__*/'))
                    );
                    
                    if (components.length > 0) {
                      const LastComponent = window[components[components.length - 1]];
                      const root = ReactDOM.createRoot(document.getElementById('root'));
                      root.render(React.createElement(LastComponent));
                    } else if (module.exports && typeof module.exports === 'function') {
                      // 尝试使用module.exports
                      const root = ReactDOM.createRoot(document.getElementById('root'));
                      root.render(React.createElement(module.exports));
                    } else if (exports.default && typeof exports.default === 'function') {
                      // 尝试使用exports.default
                      const root = ReactDOM.createRoot(document.getElementById('root'));
                      root.render(React.createElement(exports.default));
                    } else {
                      document.getElementById('root').innerHTML = '<div style="color: #f00; padding: 20px;">无法找到可渲染的React组件</div>';
                    }
                  }
                } catch (error) {
                  document.getElementById('root').innerHTML = '<div style="color: #f00; padding: 20px;">渲染错误: ' + error.message + '</div>';
                  console.error(error);
                }
              </script>
            </body>
          </html>
        `;
        
        // 更新iframe内容
        iframeRef.current.srcdoc = htmlTemplate;
      } else {
        // 非React代码，使用原来的方式渲染
        iframeRef.current.srcdoc = code;
      }
    }
    // 如果需要在iframe加载后执行一些操作，可以在这里添加
  }, [code, fileName, language]);

  return (
    <div
      style={{
        height: '100%',
        padding: 0,
      }}
    >
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title={fileName}
        sandbox="allow-scripts"
      />
    </div>
  );
};

export default CodePreview; 