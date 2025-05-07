
'use client';

import { useState } from 'react';
import Head from 'next/head';
import { Rnd } from 'react-rnd';

type BlockType = 'text' | 'block' | 'note';

interface BlockItem {
  id: string;
  type: BlockType;
  content: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number; // Track z-index for front/back functionality
}

interface CanvasItem {
  id: string;
  label: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  blocks: BlockItem[];
  nextZIndex: number; // Track the next z-index to assign
}

interface EditPanelProps {
  type: 'block' | 'canvas';
  canvasId: string;
  blockId?: string;
  item: BlockItem | CanvasItem;
  onUpdate: (updates: Partial<BlockItem | CanvasItem>) => void;
  onClose: () => void;
}

const getInitialContent = (type: BlockType) => {
  if (type === 'text') return 'Text Block';
  if (type === 'block') return 'Block';
  return "I&apos;m a note\n\nDouble click to edit me. Guide";
};

const getInitialColor = (type: BlockType) => {
  if (type === 'text') return '#fff';
  if (type === 'block') return '#fff';
  return '#fdf6e3';
};

const getInitialSize = (type: BlockType) => {
  if (type === 'text') return { width: 200, height: 70 };
  if (type === 'block') return { width: 350, height: 100 };
  return { width: 220, height: 150 };
};

// Empty initial state - no canvases or blocks by default
const initialCanvases: CanvasItem[] = [];
const initialBlocks: BlockItem[] = [];

// Add window interface extension for TypeScript
declare global {
  interface Window {
    bringToFront?: (canvasId: string, blockId: string) => void;
    sendToBack?: (canvasId: string, blockId: string) => void;
    bringBlockToFront?: (blockId: string) => void;
    sendBlockToBack?: (blockId: string) => void;
  }
}

// Edit Panel Component
// Edit Panel Component
const EditPanel = ({ type, canvasId, blockId, item, onUpdate, onClose }: EditPanelProps) => {
  // Use correct typing instead of 'any'
  const [content, setContent] = useState(
    (item as BlockItem).content !== undefined ? (item as BlockItem).content : ''
  );
  const [color, setColor] = useState(item.color || '#ffffff');
  const [label, setLabel] = useState(
    (item as CanvasItem).label !== undefined ? (item as CanvasItem).label : ''
  );

  const handleSave = () => {
    // Use proper types for updates
    const updates: Partial<BlockItem & CanvasItem> = { color };
    if (type === 'block') {
      updates.content = content;
    } else {
      updates.label = label;
    }
    onUpdate(updates);
    onClose(); // Close the panel after saving
  };

  return (
    <div className="bg-blue-50 w-64 p-4 h-full shadow-lg flex flex-col border-l-4 border-blue-500">
      <div className="flex justify-between items-center mb-4 bg-blue-500 p-2 rounded text-white">
        <h3 className="font-bold">Edit {type}</h3>
        <button onClick={onClose} className="text-white hover:text-gray-200 text-xl">×</button>
      </div>
      
      {type === 'canvas' && (
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1 text-blue-800">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full p-2 border rounded bg-white text-black"
          />
        </div>
      )}
      
      {type === 'block' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1 text-blue-800">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded h-32 bg-white text-black"
            />
          </div>
          
          {/* Layer controls for block */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1 text-blue-800">Layer</label>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (canvasId === 'main') {
                    if (blockId && window.bringBlockToFront) window.bringBlockToFront(blockId);
                  } else {
                    if (blockId && window.bringToFront) window.bringToFront(canvasId, blockId);
                  }
                }}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1 font-bold"
              >
                Bring to Front
              </button>
              <button 
                onClick={() => {
                  if (canvasId === 'main') {
                    if (blockId && window.sendBlockToBack) window.sendBlockToBack(blockId);
                  } else {
                    if (blockId && window.sendToBack) window.sendToBack(canvasId, blockId);
                  }
                }}
                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 flex-1 font-bold"
              >
                Send to Back
              </button>
            </div>
          </div>
        </>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-bold mb-1 text-blue-800">Color</label>
        <div className="flex items-center">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mr-2 w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1 p-2 border rounded bg-white text-black"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full font-bold"
        >
          Save
        </button>
      </div>
    </div>
  );
};


export default function Home() {
  const [canvases, setCanvases] = useState<CanvasItem[]>(initialCanvases);
  const [blocks, setBlocks] = useState<BlockItem[]>(initialBlocks); // For blocks directly on main canvas
  const [nextMainZIndex, setNextMainZIndex] = useState<number>(1); // For tracking z-index of main blocks
  const [showDelete, setShowDelete] = useState<{ canvasId?: string; blockId?: string }>({});
  const [optionsId, setOptionsId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<BlockType | null>(null);
  const [editPanel, setEditPanel] = useState<{
    type: 'block' | 'canvas';
    canvasId: string;
    blockId?: string;
  } | null>(null);
  
  // Adding front/back functionality through window object
  if (typeof window !== 'undefined') {
    // For blocks inside canvases
    window.bringToFront = (canvasId: string, blockId: string) => {
      handleBringToFront(canvasId, blockId);
    };
    
    window.sendToBack = (canvasId: string, blockId: string) => {
      handleSendToBack(canvasId, blockId);
    };

    // For blocks on main canvas
    window.bringBlockToFront = (blockId: string) => {
      handleBringBlockToFront(blockId);
    };
    
    window.sendBlockToBack = (blockId: string) => {
      handleSendBlockToBack(blockId);
    };
  }

  // Sidebar drag start
  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    setDraggedType(type);
    e.dataTransfer.setData('block-type', type);
  };

  // Drop handler for main area (for new canvas or standalone blocks)
  const handleMainDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = draggedType;
    setDraggedType(null);
    if (!type) return;
    
    const mainRect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - mainRect.left;
    const y = e.clientY - mainRect.top;
    
    if (type === 'block') {
      // Create a new canvas
      const id = `canvas-${Date.now()}`;
      setCanvases([
        ...canvases,
        {
          id,
          label: 'Block',
          color: '#ffc107',
          position: { x, y },
          size: { width: 700, height: 400 },
          blocks: [],
          nextZIndex: 1,
        },
      ]);
    } else {
      // Create a new standalone block directly on the main canvas
      const id = `standalone-${Date.now()}`;
      const newZ = nextMainZIndex;
      setNextMainZIndex(newZ + 1);
      
      setBlocks([
        ...blocks,
        {
          id,
          type,
          content: getInitialContent(type),
          color: getInitialColor(type),
          position: { x, y },
          size: getInitialSize(type),
          zIndex: newZ,
        },
      ]);
    }
  };

  // Allow drop
  const handleAllowDrop = (e: React.DragEvent) => e.preventDefault();

  // Drop handler for canvas (for inner blocks)
  const handleCanvasDrop = (canvasId: string, e: React.DragEvent) => {
    e.preventDefault();
    const type = draggedType;
    setDraggedType(null);
    if (!type || type === 'block') return; // Only allow text/note inside
    
    // Find the canvas content area
    const contentArea = e.currentTarget.querySelector('.overflow-auto') as HTMLElement;
    if (!contentArea) return;
    
    // Get content area's position
    const contentRect = contentArea.getBoundingClientRect();
    
    // Calculate position relative to content area, accounting for scroll
    const x = e.clientX - contentRect.left;
    const y = e.clientY - contentRect.top + contentArea.scrollTop;
    
    const id = `${Date.now()}`;
    setCanvases(canvases =>
      canvases.map(c => {
        if (c.id !== canvasId) return c;
        
        // Get the next z-index value
        const nextZ = c.nextZIndex || 1;
        
        return {
          ...c,
          nextZIndex: nextZ + 1,
          blocks: [
            ...c.blocks,
            {
              id,
              type,
              content: getInitialContent(type),
              color: getInitialColor(type),
              position: { x, y },
              size: getInitialSize(type),
              zIndex: nextZ,
            },
          ],
        };
      })
    );
  };

  // Block actions for blocks inside canvases
  const handleDuplicate = (canvasId: string, blockId: string) => {
    if (canvasId === 'main') {
      // Handle duplication for blocks on main canvas
      setBlocks(blocks => {
        const blockToDuplicate = blocks.find(b => b.id === blockId);
        if (!blockToDuplicate) return blocks;
        
        const newZ = nextMainZIndex;
        setNextMainZIndex(newZ + 1);
        
        return [
          ...blocks,
          {
            ...blockToDuplicate,
            id: `standalone-${Date.now()}`,
            position: { 
              x: blockToDuplicate.position.x + 30, 
              y: blockToDuplicate.position.y + 30 
            },
            zIndex: newZ,
          }
        ];
      });
    } else {
      // Handle duplication for blocks in canvases
      setCanvases(canvases =>
        canvases.map(c => {
          if (c.id !== canvasId) return c;
          
          // Get the next z-index for the duplicate
          const nextZ = c.nextZIndex || 1;
          
          return {
            ...c,
            nextZIndex: nextZ + 1,
            blocks: c.blocks.concat(
              c.blocks
                .filter(b => b.id === blockId)
                .map(b => ({
                  ...b,
                  id: `${Date.now()}`,
                  position: { x: b.position.x + 30, y: b.position.y + 30 },
                  zIndex: nextZ,
                }))
            ),
          };
        })
      );
    }
    setOptionsId(null);
  };

  const handleDeleteBlock = (canvasId: string | undefined, blockId: string | undefined) => {
    if (canvasId === 'main') {
      // Delete block from main canvas
      setBlocks(blocks => blocks.filter(b => b.id !== blockId));
    } else {
      // Delete block from canvas
      setCanvases(canvases =>
        canvases.map(c =>
          c.id === canvasId
            ? { ...c, blocks: c.blocks.filter(b => b.id !== blockId) }
            : c
        )
      );
    }
    setShowDelete({});
    setEditPanel(null);
  };

  const handleDeleteCanvas = (canvasId: string | undefined) => {
    setCanvases(canvases => canvases.filter(c => c.id !== canvasId));
    setShowDelete({});
    setEditPanel(null);
  };

  // New handler for opening the edit panel
  const handleOpenEditPanel = (type: 'block' | 'canvas', canvasId: string, blockId?: string) => {
    setEditPanel({ type, canvasId, blockId });
    setOptionsId(null); // Close options menu
  };

  // Handler for updating block or canvas from edit panel
  const handleUpdateFromPanel = (updates: Partial<BlockItem | CanvasItem>) => {
    if (!editPanel) return;
    
    if (editPanel.type === 'block' && editPanel.blockId) {
      if (editPanel.canvasId === 'main') {
        // Update block on main canvas
        setBlocks(blocks =>
          blocks.map(b =>
            b.id === editPanel.blockId ? { ...b, ...updates } : b
          )
        );
      } else {
        // Update block in canvas
        setCanvases(canvases =>
          canvases.map(c =>
            c.id === editPanel.canvasId
              ? {
                  ...c,
                  blocks: c.blocks.map(b =>
                    b.id === editPanel.blockId ? { ...b, ...updates } : b
                  ),
                }
              : c
          )
        );
      }
    } else if (editPanel.type === 'canvas') {
      setCanvases(canvases =>
        canvases.map(c =>
          c.id === editPanel.canvasId ? { ...c, ...updates } : c
        )
      );
    }
  };

  // Update position for blocks inside canvases
  const updateBlockPosition = (canvasId: string, blockId: string, position: { x: number; y: number }) => {
    if (canvasId === 'main') {
      // Update position for blocks on main canvas
      setBlocks(blocks =>
        blocks.map(b =>
          b.id === blockId ? { ...b, position } : b
        )
      );
    } else {
      // Update position for blocks in canvases
      setCanvases(canvases =>
        canvases.map(c =>
          c.id === canvasId
            ? {
                ...c,
                blocks: c.blocks.map(b =>
                  b.id === blockId ? { ...b, position } : b
                ),
              }
            : c
        )
      );
    }
  };

  // Update size for blocks
  const updateBlockSize = (canvasId: string, blockId: string, size: { width: number; height: number }) => {
    if (canvasId === 'main') {
      // Update size for blocks on main canvas
      setBlocks(blocks =>
        blocks.map(b =>
          b.id === blockId ? { ...b, size } : b
        )
      );
    } else {
      // Update size for blocks in canvases
      setCanvases(canvases =>
        canvases.map(c =>
          c.id === canvasId
            ? {
                ...c,
                blocks: c.blocks.map(b =>
                  b.id === blockId ? { ...b, size } : b
                ),
              }
            : c
        )
      );
    }
  };
  
  // Front/back functionality for blocks inside canvases
  const handleBringToFront = (canvasId: string, blockId: string) => {
    setCanvases(canvases =>
      canvases.map(c => {
        if (c.id !== canvasId) return c;
        
        // Get the highest z-index and add 1
        const highestZ = Math.max(...c.blocks.map(b => b.zIndex || 0), 0) + 1;
        
        return {
          ...c,
          nextZIndex: highestZ + 1,
          blocks: c.blocks.map(b =>
            b.id === blockId ? { ...b, zIndex: highestZ } : b
          ),
        };
      })
    );
  };

  const handleSendToBack = (canvasId: string, blockId: string) => {
    setCanvases(canvases =>
      canvases.map(c => {
        if (c.id !== canvasId) return c;
        
        // Get the lowest z-index and subtract 1
        const lowestZ = Math.min(...c.blocks.map(b => b.zIndex || 0), 0) - 1;
        
        return {
          ...c,
          blocks: c.blocks.map(b =>
            b.id === blockId ? { ...b, zIndex: lowestZ } : b
          ),
        };
      })
    );
  };

  // Front/back functionality for blocks on main canvas
  const handleBringBlockToFront = (blockId: string) => {
    // Get the highest z-index and add 1
    const highestZ = Math.max(...blocks.map(b => b.zIndex || 0), 0) + 1;
    
    setNextMainZIndex(highestZ + 1);
    setBlocks(blocks =>
      blocks.map(b =>
        b.id === blockId ? { ...b, zIndex: highestZ } : b
      )
    );
  };

  const handleSendBlockToBack = (blockId: string) => {
    // Get the lowest z-index and subtract 1
    const lowestZ = Math.min(...blocks.map(b => b.zIndex || 0), 0) - 1;
    
    setBlocks(blocks =>
      blocks.map(b =>
        b.id === blockId ? { ...b, zIndex: lowestZ } : b
      )
    );
  };

  // Canvas drag/resize
  const updateCanvas = (canvasId: string, data: { x?: number; y?: number; width?: number; height?: number }) => {
    setCanvases(canvases =>
      canvases.map(c =>
        c.id === canvasId
          ? {
              ...c,
              position: {
                x: data.x !== undefined ? data.x : c.position.x,
                y: data.y !== undefined ? data.y : c.position.y,
              },
              size: {
                width: data.width !== undefined ? data.width : c.size.width,
                height: data.height !== undefined ? data.height : c.size.height,
              },
            }
          : c
      )
    );
  };

  // Utility for optionsId
  const getCanvasOptionId = (canvasId: string) => `canvas-${canvasId}`;
  const getBlockOptionId = (canvasId: string, blockId: string) => `block-${canvasId}-${blockId}`;

  // Get the current item being edited
  const getEditItem = () => {
    if (!editPanel) return null;
    
    if (editPanel.type === 'canvas') {
      return canvases.find(c => c.id === editPanel.canvasId);
    } else if (editPanel.blockId) {
      if (editPanel.canvasId === 'main') {
        return blocks.find(b => b.id === editPanel.blockId);
      } else {
        const canvas = canvases.find(c => c.id === editPanel.canvasId);
        return canvas?.blocks.find(b => b.id === editPanel.blockId);
      }
    }
    
    return null;
  };

  const editItem = getEditItem();

  return (
    <div className="flex h-screen bg-gray-100 font-mono">
      <Head>
        <title>Blocks App</title>
        <meta name="description" content="Draggable and resizable blocks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <div className="w-56 h-screen flex flex-col justify-center items-center space-y-4 border-r border-blue-300">
        {(['text', 'block', 'note'] as BlockType[]).map((type) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            className="border w-32 py-2 mb-2 text-center bg-white cursor-move text-black"
            style={{ userSelect: 'none', color: '#000' }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
      </div>

      {/* Main Area: Can now accept all block types */}
      <div
        className="flex-1 p-8 relative h-screen"
        onDrop={handleMainDrop}
        onDragOver={handleAllowDrop}
        style={{ minHeight: '100vh', overflowY: 'auto' }}
        id="main-drop-area"
      >
        {/* Add a help message when empty */}
        {canvases.length === 0 && blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="mb-4">Drag any item from the sidebar and drop here:</p>
              <p>- &apos;Block&apos; creates a new canvas</p>
              <p>- &apos;Text&apos; or &apos;Note&apos; creates standalone items</p>
            </div>
          </div>
        )}
        
        {/* Standalone blocks on main canvas */}
        {blocks.map((block) => (
          <Rnd
            key={block.id}
            size={{ width: block.size.width, height: block.size.height }}
            position={{ x: block.position.x, y: block.position.y }}
            onDragStop={(_, d) => updateBlockPosition('main', block.id, { x: d.x, y: d.y })}
            onResize={(_, __, ref, ___, pos) => {
              updateBlockSize('main', block.id, { width: ref.offsetWidth, height: ref.offsetHeight });
              updateBlockPosition('main', block.id, pos);
            }}
            bounds="parent"
            minWidth={140}
            minHeight={70}
            className="absolute"
            style={{ zIndex: (block.zIndex || 0) + 20 }}
          >
            <div
              style={{
                backgroundColor: block.color,
                color: block.type === 'block' && block.color === '#0d6e9a' ? '#fff' : '#000',
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top: Drag handle and Options Button */}
              <div className="flex justify-end items-center drag-handle cursor-move select-none px-2 py-1" style={{ minHeight: '30px' }}>
                <div className="flex-grow" />
                <button
                  onClick={() =>
                    setOptionsId(
                      optionsId === getBlockOptionId('main', block.id)
                        ? null
                        : getBlockOptionId('main', block.id)
                    )
                  }
                  className="hover:text-gray-800"
                  style={{ color: block.type === 'block' && block.color === '#0d6e9a' ? '#fff' : '#000' }}
                >
                  ⋯
                </button>
              </div>
              
              {/* Content: selectable, not draggable */}
              <div 
                className="flex-grow flex items-center justify-center overflow-auto whitespace-pre-line px-3 pb-3 cursor-text select-text"
                onDoubleClick={() => handleOpenEditPanel('block', 'main', block.id)}
              >
                <p 
                  className="text-center break-words w-full"
                  style={{ 
                    color: block.type === 'block' && block.color === '#0d6e9a' ? '#fff' : '#000',
                    userSelect: 'text', 
                    cursor: 'text',
                    textAlign: 'center',
                    width: '100%',
                    fontWeight: block.type === 'block' ? 'bold' : 'normal'
                  }}
                >
                  {block.content}
                </p>
              </div>
              
              {/* Options Menu */}
              {optionsId === getBlockOptionId('main', block.id) && (
                <div className="absolute top-8 right-0 bg-white shadow-lg rounded py-2 px-4 w-32 text-sm z-[9999] text-black">
                  <button 
                    onClick={() => handleOpenEditPanel('block', 'main', block.id)} 
                    className="block w-full text-left py-1 hover:bg-gray-100 text-black"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDuplicate('main', block.id)} className="block w-full text-left py-1 hover:bg-gray-100 text-black">Duplicate</button>
                  <button onClick={() => setShowDelete({ canvasId: 'main', blockId: block.id })} className="block w-full text-left py-1 hover:bg-red-100 text-red-600">Delete</button>
                </div>
              )}
            </div>
          </Rnd>
        ))}
        
        {/* Canvas blocks */}
        {canvases.map((canvas, i) => (
          <Rnd
            key={canvas.id}
            size={{ width: canvas.size.width, height: canvas.size.height }}
            position={{ x: canvas.position.x, y: canvas.position.y }}
            onDragStop={(_, d) => updateCanvas(canvas.id, { x: d.x, y: d.y })}
            onResize={(_, __, ref, ___, pos) =>
              updateCanvas(canvas.id, {
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: pos.x,
                y: pos.y,
              })
            }
            minWidth={350}
            minHeight={200}
            bounds="parent"
            className="absolute"
            style={{ zIndex: 10 + i }}
          >
            <div
              className="relative rounded-lg"
              style={{
                backgroundColor: canvas.color,
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
              onDrop={(e) => handleCanvasDrop(canvas.id, e)}
              onDragOver={handleAllowDrop}
              data-canvas-id={canvas.id}
            >
              {/* Canvas options button */}
              <div className="absolute top-2 right-2 z-50">
              <div className='flex align-middle text-center'>
              <div className='text-black font-bold mr-2'>{canvas.label}</div>
                <button
                  onClick={() =>
                    setOptionsId(optionsId === getCanvasOptionId(canvas.id) ? null : getCanvasOptionId(canvas.id))
                  }
                  className="text-black bg-white rounded px-2 py-1 shadow hover:bg-gray-100"
                >
                   ⋯
                </button>
              </div>
                {optionsId === getCanvasOptionId(canvas.id) && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg rounded py-2 px-4 w-32 text-sm z-50 text-black">
                    <button 
                      onClick={() => handleOpenEditPanel('canvas', canvas.id)} 
                      className="block w-full text-left py-1 hover:bg-gray-100 text-black"
                    >
                      Edit
                    </button>
                    <button onClick={() => setShowDelete({ canvasId: canvas.id })} className="block w-full text-left py-1 hover:bg-red-100 text-red-600">Delete</button>
                  </div>
                )}
              </div>
              
              {/* Canvas content area with scrolling */}
              <div className="pt-10 w-full h-full overflow-auto" style={{ position: "relative" }}>
                {/* Empty canvas message */}
                {canvas.blocks.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-600">
                    <p>Drag Text or Note items here</p>
                  </div>
                )}
                
                {/* Dragg
                
                {/* Draggable blocks */}
                {canvas.blocks.map((item) => (
                  <Rnd
                    key={item.id}
                    size={{ width: item.size.width, height: item.size.height }}
                    position={{ x: item.position.x, y: item.position.y }}
                    onDragStop={(_, d) => updateBlockPosition(canvas.id, item.id, { x: d.x, y: d.y })}
                    onResize={(_, __, ref, ___, pos) => {
                      updateBlockSize(canvas.id, item.id, { width: ref.offsetWidth, height: ref.offsetHeight });
                      updateBlockPosition(canvas.id, item.id, pos);
                    }}
                    bounds=".overflow-auto"
                    minWidth={140}
                    minHeight={70}
                    className="absolute"
                    style={{ zIndex: (item.zIndex || 0) + 20 }}
                  >
                    <div
                      style={{
                        backgroundColor: item.color,
                        color: item.type === 'block' && item.color === '#0d6e9a' ? '#fff' : '#000',
                        width: '100%',
                        height: '100%',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Top: Drag handle and Options Button */}
                      <div className="flex justify-end items-center drag-handle cursor-move select-none px-2 py-1" style={{ minHeight: '30px' }}>
                        <div className="flex-grow" />
                        <button
                          onClick={() =>
                            setOptionsId(
                              optionsId === getBlockOptionId(canvas.id, item.id)
                                ? null
                                : getBlockOptionId(canvas.id, item.id)
                            )
                          }
                          className="hover:text-gray-800"
                          style={{ color: item.type === 'block' && item.color === '#0d6e9a' ? '#fff' : '#000' }}
                        >
                          ⋯
                        </button>
                      </div>
                      
                      {/* Content: selectable, not draggable */}
                      <div 
                        className="flex-grow flex items-center justify-center overflow-auto whitespace-pre-line px-3 pb-3 cursor-text select-text"
                        onDoubleClick={() => handleOpenEditPanel('block', canvas.id, item.id)}
                      >
                        <p 
                          className="text-center break-words w-full"
                          style={{ 
                            color: item.type === 'block' && item.color === '#0d6e9a' ? '#fff' : '#000',
                            userSelect: 'text', 
                            cursor: 'text',
                            textAlign: 'center',
                            width: '100%',
                            fontWeight: item.type === 'block' ? 'bold' : 'normal'
                          }}
                        >
                          {item.content}
                        </p>
                      </div>
                      
                      {/* Options Menu */}
                      {optionsId === getBlockOptionId(canvas.id, item.id) && (
                        <div className="absolute top-8 right-0 bg-white shadow-lg rounded py-2 px-4 w-32 text-sm z-[9999] text-black">
                          <button 
                            onClick={() => handleOpenEditPanel('block', canvas.id, item.id)} 
                            className="block w-full text-left py-1 hover:bg-gray-100 text-black"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDuplicate(canvas.id, item.id)} className="block w-full text-left py-1 hover:bg-gray-100 text-black">Duplicate</button>
                          <button onClick={() => setShowDelete({ canvasId: canvas.id, blockId: item.id })} className="block w-full text-left py-1 hover:bg-red-100 text-red-600">Delete</button>
                        </div>
                      )}
                    </div>
                  </Rnd>
                ))}
              </div>
            </div>
          </Rnd>
        ))}

        {/* Delete Confirmation Popup */}
        {showDelete.canvasId && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-60 z-[99999]">
            <div className="bg-white p-6 rounded shadow-xl">
              <div className="mb-4 text-black">
                {showDelete.blockId
                  ? "Are you sure you want to delete this block?"
                  : "Are you sure you want to delete this canvas?"}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowDelete({})} className="px-4 py-2 border rounded text-black">No</button>
                <button 
                  onClick={() => {
                    if (showDelete.blockId) {
                      handleDeleteBlock(showDelete.canvasId, showDelete.blockId);
                    } else {
                      handleDeleteCanvas(showDelete.canvasId);
                    }
                  }} 
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side Edit Panel */}
      {editPanel && editItem && (
        <div className="h-screen border-l border-gray-300">
          <EditPanel
            type={editPanel.type}
            canvasId={editPanel.canvasId}
            blockId={editPanel.blockId}
            item={editItem}
            onUpdate={handleUpdateFromPanel}
            onClose={() => setEditPanel(null)}
          />
        </div>
      )}
    </div>
  );
}




