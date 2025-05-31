// frontend/src/components/analysis/MindmapViewerModal.jsx
import React, { useEffect, useRef } from 'react';
import Modal from '../core/Modal.jsx';
import toast from 'react-hot-toast';
// Ensure Markmap libraries are loaded globally (from index.html or via npm import if preferred)

function MindmapViewerModal({ isOpen, onClose, markdownContent, documentName }) {
    const svgRef = useRef(null);
    const toolbarRef = useRef(null); // Ref to hold the toolbar DOM element
    const markmapInstanceRef = useRef(null); // Ref to hold the Markmap instance

    useEffect(() => {
        if (!isOpen || !markdownContent || !svgRef.current || !window.markmap) {
            // Clear previous if modal is closed or no content
            if (svgRef.current) svgRef.current.innerHTML = '';
            if (toolbarRef.current) {
                toolbarRef.current.remove();
                toolbarRef.current = null;
            }
            if (markmapInstanceRef.current && typeof markmapInstanceRef.current.destroy === 'function') {
                markmapInstanceRef.current.destroy();
                markmapInstanceRef.current = null;
            }
            return;
        }

        const { Transformer, Markmap, Toolbar } = window.markmap;
        let mm, tbNode;

        try {
            const transformer = new Transformer();
            const { root } = transformer.transform(markdownContent);
            
            svgRef.current.innerHTML = ''; // Clear before re-rendering
            mm = Markmap.create(svgRef.current, null, root);
            markmapInstanceRef.current = mm;

            // Create and prepend toolbar if it doesn't exist
            if (!toolbarRef.current) {
                tbNode = Toolbar.create(mm).el;
                svgRef.current.parentNode.insertBefore(tbNode, svgRef.current);
                toolbarRef.current = tbNode;
            }
            
            setTimeout(() => mm.fit(), 100); // Fit after render

        } catch (e) {
            console.error("Error rendering Markmap in modal:", e);
            toast.error("Failed to render mind map.");
            if (svgRef.current) svgRef.current.innerHTML = '<p class="text-xs text-red-500 p-2">Error rendering mind map data.</p>';
        }
        
        // Cleanup function
        return () => {
            if (mm && typeof mm.destroy === 'function') {
                mm.destroy();
            }
             // Remove toolbar specifically by its ref when cleaning up
            if (toolbarRef.current && toolbarRef.current.parentNode) {
                toolbarRef.current.parentNode.removeChild(toolbarRef.current);
                toolbarRef.current = null;
            }
            markmapInstanceRef.current = null;
        };
    }, [isOpen, markdownContent]); // Rerun when isOpen or markdownContent changes

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Mind Map: ${documentName || 'Analysis'}`} 
            size="2xl" // Larger modal for mind map
        >
            <div className="relative w-full h-[60vh] min-h-[400px]"> 
                {/* Toolbar will be prepended here by useEffect */}
                <svg ref={svgRef} className="w-full h-full border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-gray-800 shadow-inner"></svg>
            </div>
            {/* No explicit footer buttons here, modal provides close */}
        </Modal>
    );
}

export default MindmapViewerModal;