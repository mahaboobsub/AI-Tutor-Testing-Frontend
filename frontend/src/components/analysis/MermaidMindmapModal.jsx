// src/components/analysis/MermaidMindmapModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import Modal from '../core/Modal.jsx';
import Button from '../core/Button.jsx';
import { Download, RefreshCw, Maximize, Minimize, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Ensure mermaid is loaded globally from index.html
// const mermaid = window.mermaid; // This might not be available immediately on module load. Access inside useEffect.

function MermaidMindmapModal({ isOpen, onClose, mermaidCode, documentName, onRefresh }) {
    const chartRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMaximized, setIsMaximized] = useState(false); // For modal size toggle

    // Generate unique id per component instance (on mount or when modal opens)
    const [chartId] = useState(() => "mermaidChart_" + Math.random().toString(36).substring(2, 11));

    useEffect(() => {
        if (!isOpen) {
            setIsLoading(true); // Reset loading state when modal closes
            setError('');
            if (chartRef.current) chartRef.current.innerHTML = ''; // Clear previous diagram
            return;
        }
        
        if (!mermaidCode || !chartRef.current) {
            setIsLoading(false);
            if(!mermaidCode) setError('No mind map code provided.');
            return;
        }

        const mermaid = window.mermaid; // Access mermaid here
        if (!mermaid) {
            setError('Mermaid library not loaded.');
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError('');

        // It's good practice to initialize per render if it's not globally done,
        // or if you want to re-apply specific themes/configs.
        mermaid.initialize({
            startOnLoad: false, // We control rendering
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
            // securityLevel: 'loose', // if you have complex HTML in nodes, but use with caution
        });
        
        // mermaid.parse() can validate syntax. If it throws, mermaid.render() will also fail.
        try {
            mermaid.parse(mermaidCode); // Throws error on syntax issue
            // console.log(`Mermaid parsing successful for ID: ${chartId}`);
        } catch (e) {
            console.error("Mermaid Parse Error:", e);
            setError(`Syntax error in mind map data: ${e.str || e.message}`);
            if (chartRef.current) {
                chartRef.current.innerHTML = `<pre class="text-red-500 p-2 text-xs">${e.str || e.message}</pre>`;
            }
            setIsLoading(false);
            return;
        }

        mermaid.render(chartId, mermaidCode)
            .then(({ svg, bindFunctions }) => {
                if (chartRef.current) {
                    chartRef.current.innerHTML = svg;
                    if (bindFunctions) {
                        bindFunctions(chartRef.current); // For interactivity if any
                    }
                }
                // console.log(`Mermaid rendering complete for ID: ${chartId}`);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Mermaid Render Error:", err);
                setError(`Failed to render mind map: ${err.message}`);
                if (chartRef.current) {
                    chartRef.current.innerHTML = `<pre class="text-red-500 p-2 text-xs">Render error: ${err.message}</pre>`;
                }
                setIsLoading(false);
            });

    }, [isOpen, mermaidCode, chartId, document.documentElement.classList.contains('dark')]); // Re-render if theme changes

    const handleDownloadSVG = () => {
        if (chartRef.current && chartRef.current.querySelector('svg')) {
            const svgElement = chartRef.current.querySelector('svg');
            // Add XML namespace if missing, for proper SVG rendering as standalone file
            if (!svgElement.getAttribute('xmlns')) {
                svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${documentName || 'mindmap'}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('SVG downloaded!');
        } else {
            toast.error('No SVG found to download.');
        }
    };
    
    const toggleMaximize = () => setIsMaximized(!isMaximized);

    // const modalSize = isMaximized ? '4xl' : '2xl'; // Adjust as needed, Tailwind needs these defined
    const modalSize = isMaximized ? '5xl' : '3xl';

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Mind Map: ${documentName || 'Analysis'}`} 
            size={modalSize} // Use dynamic size
        >
            <div className="flex items-center justify-end gap-2 mb-3 -mt-2 border-b pb-2 border-border-light dark:border-border-dark">
                {onRefresh && (
                    <Button onClick={onRefresh} size="sm" variant="outline" leftIcon={<RefreshCw size={14}/>} title="Refresh Mind Map Data">
                        Refresh
                    </Button>
                )}
                 <Button onClick={toggleMaximize} size="sm" variant="outline" leftIcon={isMaximized ? <Minimize size={14}/> : <Maximize size={14}/>}>
                    {isMaximized ? 'Restore' : 'Maximize'}
                </Button>
                <Button onClick={handleDownloadSVG} size="sm" variant="primary" leftIcon={<Download size={14}/>} disabled={isLoading || !!error}>
                    Download SVG
                </Button>
            </div>

            <div className={`relative w-full ${isMaximized ? 'h-[75vh]' : 'h-[60vh]'} min-h-[400px] overflow-auto custom-scrollbar border border-border-light dark:border-border-dark rounded bg-white dark:bg-gray-800`}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 bg-surface-light dark:bg-surface-dark">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                )}
                {error && !isLoading && (
                     <div className="p-4 text-red-500 text-sm font-medium whitespace-pre-wrap">{error}</div>
                )}
                {/* The ref where Mermaid will render its SVG */}
                <div ref={chartRef} id={`container-${chartId}`} className="p-2 w-full h-full flex items-center justify-center">
                    {/* Content is injected by useEffect */}
                </div>
            </div>
        </Modal>
    );
}

export default MermaidMindmapModal;



