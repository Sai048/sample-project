// 'use client';

// import { useState } from 'react';
// import Head from 'next/head';
// import { Rnd } from 'react-rnd';

// type BlockType = 'text' | 'block' | 'note';

// interface BlockItem {
//   id: string;
//   type: BlockType;
//   content: string;
//   color: string;
//   position: { x: number; y: number };
//   size: { width: number; height: number };
// }

// interface CanvasItem {
//   id: string;
//   label: string;
//   color: string;
//   position: { x: number; y: number };
//   size: { width: number; height: number };
//   blocks: BlockItem[];
// }

// const getInitialContent = (type: BlockType) => {
//   if (type === 'text') return 'Text Block';
//   if (type === 'block') return 'Block';
//   return "I'm a note\n\nDouble click to edit me. Guide";
// };

// const getInitialColor = (type: BlockType) => {
//   if (type === 'text') return '#fff';
//   if (type === 'block') return '#fff';
//   return '#fdf6e3';
// };

// const getInitialSize = (type: BlockType) => {
//   if (type === 'text') return { width: 200, height: 70 };
//   if (type === 'block') return { width: 350, height: 100 };
//   return { width: 220, height: 150 };
// };

// const initialCanvases: CanvasItem[] = [
//   {
//     id: 'canvas-1',
//     label: 'Block',
//     color: '#ffc107',
//     position: { x: 220, y: 60 },
//     size: { width: 700, height: 400 },
//     blocks: [
//       {
//         id: '1',
//         type: 'block',
//         content: 'Test Block',
//         color: '#fff',
//         position: { x: 200, y: 120 },
//         size: { width: 350, height: 100 },
//       },
//       {
//         id: '2',
//         type: 'note',
//         content: "I'm a note\n\nDouble click to edit me. Guide",
//         color: '#fdf6e3',
//         position: { x: 40, y: 20 },
//         size: { width: 220, height: 150 },
//       },
//     ],
//   },
// ];

// export default function Home() {
//   const [canvases, setCanvases] = useState<CanvasItem[]>(initialCanvases);
//   const [showDelete, setShowDelete] = useState<{ canvasId?: string; blockId?: string }>({});
//   const [optionsId, setOptionsId] = useState<string | null>(null);
//   const [draggedType, setDraggedType] = useState<BlockType | null>(null);

//   // Sidebar drag start
//   const handleDragStart = (e: React.DragEvent, type: BlockType) => {
//     setDraggedType(type);
//     e.dataTransfer.setData('block-type', type);
//   };

//   // Drop handler for main area (for new canvas)
//   const handleMainDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     const type = draggedType;
//     setDraggedType(null);
//     if (type !== 'block') return;
//     const mainRect = (e.target as HTMLDivElement).getBoundingClientRect();
//     const x = e.clientX - mainRect.left;
//     const y = e.clientY - mainRect.top;
//     const id = `canvas-${Date.now()}`;
//     setCanvases([
//       ...canvases,
//       {
//         id,
//         label: 'Block',
//         color: '#ffc107',
//         position: { x, y },
//         size: { width: 700, height: 400 },
//         blocks: [],
//       },
//     ]);
//   };

//   // Allow drop
//   const handleAllowDrop = (e: React.DragEvent) => e.preventDefault();

//   // Drop handler for canvas (for inner blocks)
//   const handleCanvasDrop = (canvasId: string, e: React.DragEvent) => {
//     e.preventDefault();
//     const type = draggedType;
//     setDraggedType(null);
//     if (!type || type === 'block') return; // Only allow text/note inside
    
//     // Find the scrollable content area
//     const contentArea = (e.currentTarget as HTMLElement).querySelector('.overflow-auto');
//     if (!contentArea) return;
    
//     const contentRect = contentArea.getBoundingClientRect();
    
//     // Calculate position relative to content area, accounting for scroll
//     const x = e.clientX - contentRect.left;
//     const y = e.clientY - contentRect.top + (contentArea.scrollTop || 0);
    
//     const id = `${Date.now()}`;
//     setCanvases(canvases =>
//       canvases.map(c =>
//         c.id === canvasId
//           ? {
//               ...c,
//               blocks: [
//                 ...c.blocks,
//                 {
//                   id,
//                   type,
//                   content: getInitialContent(type),
//                   color: getInitialColor(type),
//                   position: { x, y },
//                   size: getInitialSize(type),
//                 },
//               ],
//             }
//           : c
//       )
//     );
//   };

//   // Block actions
//   const handleDuplicate = (canvasId: string, blockId: string) => {
//     setCanvases(canvases =>
//       canvases.map(c =>
//         c.id === canvasId
//           ? {
//               ...c,
//               blocks: c.blocks.concat(
//                 c.blocks
//                   .filter(b => b.id === blockId)
//                   .map(b => ({
//                     ...b,
//                     id: `${Date.now()}`,
//                     position: { x: b.position.x + 30, y: b.position.y + 30 },
//                   }))
//               ),
//             }
//           : c
//       )
//     );
//   };

//   const handleDeleteBlock = (canvasId: string, blockId: string) => {
//     setCanvases(canvases =>
//       canvases.map(c =>
//         c.id === canvasId
//           ? { ...c, blocks: c.blocks.filter(b => b.id !== blockId) }
//           : c
//       )
//     );
//     setShowDelete({});
//   };

//   const handleDeleteCanvas = (canvasId: string) => {
//     setCanvases(canvases => canvases.filter(c => c.id !== canvasId));
//     setShowDelete({});
//   };

//   const handleEditBlock = (canvasId: string, blockId: string) => {
//     const c = canvases.find(c => c.id === canvasId);
//     const b = c?.blocks.find(b => b.id === blockId);
//     const newContent = prompt('Edit content:', b?.content || '');
//     if (newContent !== null)
//       setCanvases(canvases =>
//         canvases.map(c =>
//           c.id === canvasId
//             ? {
//                 ...c,
//                 blocks: c.blocks.map(b =>
//                   b.id === blockId ? { ...b, content: newContent } : b
//                 ),
//               }
//             : c
//         )
//       );
//     setOptionsId(null);
//   };

//   const handleColorBlock = (canvasId: string, blockId: string) => {
//     const c = canvases.find(c => c.id === canvasId);
//     const b = c?.blocks.find(b => b.id === blockId);
//     const newColor = prompt('Enter color (name or hex):', b?.color || '');
//     if (newColor !== null)
//       setCanvases(canvases =>
//         canvases.map(c =>
//           c.id === canvasId
//             ? {
//                 ...c,
//                 blocks: c.blocks.map(b =>
//                   b.id === blockId ? { ...b, color: newColor } : b
//                 ),
//               }
//             : c
//         )
//       );
//     setOptionsId(null);
//   };

//   const updateBlockPosition = (canvasId: string, blockId: string, position: { x: number; y: number }) => {
//     setCanvases(canvases =>
//       canvases.map(c =>
//         c.id === canvasId
//           ? {
//               ...c,
//               blocks: c.blocks.map(b =>
//                 b.id === blockId ? { ...b, position } : b
//               ),
//             }
//           : c
//       )
//     );
//   };

//   const updateBlockSize = (canvasId: string, blockId: string, size: { width: number; height: number }) => {
//     setCanvases(canvases =>
//       canvases.map(c =>
//         c.id === canvasId
//           ? {
//               ...c,
//               blocks: c.blocks.map(b =>
//                 b.id === blockId ? { ...b, size } : b
//               ),
//             }
//           : c
//       )
//     );
//   };

//   // Canvas drag/resize
//   const updateCanvas = (canvasId: string, data: { x?: number; y?: number; width?: number; height?: number }) => {
//     setCanvases(canvases =>
//       canvases.map(c =>
//         c.id === canvasId
//           ? {
//               ...c,
//               position: {
//                 x: data.x !== undefined ? data.x : c.position.x,
//                 y: data.y !== undefined ? data.y : c.position.y,
//               },
//               size: {
//                 width: data.width !== undefined ? data.width : c.size.width,
//                 height: data.height !== undefined ? data.height : c.size.height,
//               },
//             }
//           : c
//       )
//     );
//   };

//   // Canvas options handlers
//   const handleCanvasLabel = (canvasId: string) => {
//     const c = canvases.find(c => c.id === canvasId);
//     const label = prompt('Edit canvas label:', c?.label || '');
//     if (label !== null)
//       setCanvases(canvases =>
//         canvases.map(c =>
//           c.id === canvasId ? { ...c, label } : c
//         )
//       );
//     setOptionsId(null);
//   };

//   const handleCanvasColor = (canvasId: string) => {
//     const c = canvases.find(c => c.id === canvasId);
//     const color = prompt('Enter canvas color (name or hex):', c?.color || '');
//     if (color !== null)
//       setCanvases(canvases =>
//         canvases.map(c =>
//           c.id === canvasId ? { ...c, color } : c
//         )
//       );
//     setOptionsId(null);
//   };

//   // Utility for optionsId
//   const getCanvasOptionId = (canvasId: string) => `canvas-${canvasId}`;
//   const getBlockOptionId = (canvasId: string, blockId: string) => `block-${canvasId}-${blockId}`;

//   return (
//     <div className="flex h-screen bg-gray-100 font-mono">
//       <Head>
//         <title>Blocks App</title>
//         <meta name="description" content="Draggable and resizable blocks" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       {/* Sidebar */}
//       <div className="w-56 h-screen flex flex-col justify-center items-center space-y-4 border-r border-blue-300">
//         {(['text', 'block', 'note'] as BlockType[]).map((type) => (
//           <div
//             key={type}
//             draggable
//             onDragStart={(e) => handleDragStart(e, type)}
//             className="border w-32 py-2 mb-2 text-center bg-white cursor-move text-black"
//             style={{ userSelect: 'none', color: '#000' }}
//           >
//             {type.charAt(0).toUpperCase() + type.slice(1)}
//           </div>
//         ))}
//       </div>

//       {/* Main Area: drop here for new canvas */}
//       <div
//         className="flex-1 p-8 relative h-screen"
//         onDrop={handleMainDrop}
//         onDragOver={handleAllowDrop}
//         style={{ minHeight: '100vh', overflowY: 'auto' }}
//         id="main-drop-area"
//       >
//         {canvases.map((canvas, i) => (
//           <Rnd
//             key={canvas.id}
//             size={{ width: canvas.size.width, height: canvas.size.height }}
//             position={{ x: canvas.position.x, y: canvas.position.y }}
//             onDragStop={(_, d) => updateCanvas(canvas.id, { x: d.x, y: d.y })}
//             onResize={(_, __, ref, ___, pos) =>
//               updateCanvas(canvas.id, {
//                 width: ref.offsetWidth,
//                 height: ref.offsetHeight,
//                 x: pos.x,
//                 y: pos.y,
//               })
//             }
//             minWidth={350}
//             minHeight={200}
//             bounds="parent"
//             className="absolute"
//             style={{ zIndex: 10 + i }}
//           >
//                           <div
//               className="relative rounded-lg"
//               style={{
//                 backgroundColor: canvas.color,
//                 width: '100%',
//                 height: '100%',
//                 position: 'relative',
//                 overflow: 'hidden',
//               }}
//               onDrop={(e) => handleCanvasDrop(canvas.id, e)}
//               onDragOver={handleAllowDrop}
//               data-canvas-id={canvas.id}
//             >
//               {/* Canvas options button */}
//               <div className="absolute top-2 right-2 z-50">
//                 <button
//                   onClick={() =>
//                     setOptionsId(optionsId === getCanvasOptionId(canvas.id) ? null : getCanvasOptionId(canvas.id))
//                   }
//                   className="text-black bg-white rounded px-2 py-1 shadow hover:bg-gray-100"
//                 >
//                   ⋯
//                 </button>
//                 {optionsId === getCanvasOptionId(canvas.id) && (
//                   <div className="absolute right-0 mt-2 bg-white shadow-lg rounded py-2 px-4 w-32 text-sm z-50 text-black">
//                     <button onClick={() => handleCanvasLabel(canvas.id)} className="block w-full text-left py-1 hover:bg-gray-100 text-black">Edit Label</button>
//                     <button onClick={() => handleCanvasColor(canvas.id)} className="block w-full text-left py-1 hover:bg-gray-100 text-black">Color</button>
//                     <button onClick={() => setShowDelete({ canvasId: canvas.id })} className="block w-full text-left py-1 hover:bg-red-100 text-red-600">Delete</button>
//                   </div>
//                 )}
//               </div>
//               {/* Canvas label */}
//               <div className="absolute left-4 top-2 text-lg font-bold text-black">{canvas.label}</div>
              
//               {/* Canvas content area with scrolling */}
//               <div className="pt-10 w-full h-full overflow-auto" style={{ position: "relative" }}>
//                 {/* Draggable blocks */}
//                 {canvas.blocks.map((item, idx) => (
//                   <Rnd
//                     key={item.id}
//                     size={{ width: item.size.width, height: item.size.height }}
//                     position={{ x: item.position.x, y: item.position.y }}
//                     onDragStop={(_, d) => updateBlockPosition(canvas.id, item.id, { x: d.x, y: d.y })}
//                     onResize={(_, __, ref, ___, pos) => {
//                       updateBlockSize(canvas.id, item.id, { width: ref.offsetWidth, height: ref.offsetHeight });
//                       updateBlockPosition(canvas.id, item.id, pos);
//                     }}
//                     bounds=".overflow-auto"
//                     minWidth={140}
//                     minHeight={70}
//                     className="absolute"
//                     style={{ zIndex: 20 + idx }}
//                   >
//                     <div
//                       style={{
//                         backgroundColor: item.color,
//                         color: '#000',
//                         width: '100%',
//                         height: '100%',
//                         borderRadius: '8px',
//                         boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         position: 'relative',
//                         overflow: 'hidden',
//                       }}
//                     >
//                       {/* Top: Drag handle and Options Button */}
//                       <div className="flex justify-end items-center drag-handle cursor-move select-none px-2 py-1" style={{ minHeight: '30px' }}>
//                         <div className="flex-grow" />
//                         <button
//                           onClick={() =>
//                             setOptionsId(
//                               optionsId === getBlockOptionId(canvas.id, item.id)
//                                 ? null
//                                 : getBlockOptionId(canvas.id, item.id)
//                             )
//                           }
//                           className="text-black hover:text-gray-800"
//                         >
//                           ⋯
//                         </button>
//                       </div>
//                       {/* Content: selectable, not draggable */}
//                       <div className="flex-grow flex items-center justify-center overflow-auto whitespace-pre-line px-3 pb-3 cursor-text select-text">
//                         <p className="text-center break-words w-full" style={{ color: '#000', userSelect: 'text', cursor: 'text' }}>
//                           {item.content}
//                         </p>
//                       </div>
//                       {/* Options Menu */}
//                       {optionsId === getBlockOptionId(canvas.id, item.id) && (
//                         <div className="absolute top-8 right-0 bg-white shadow-lg rounded py-2 px-4 w-32 text-sm z-[9999] text-black">
//                           <button onClick={() => handleEditBlock(canvas.id, item.id)} className="block w-full text-left py-1 hover:bg-gray-100 text-black">Edit</button>
//                           <button onClick={() => handleColorBlock(canvas.id, item.id)} className="block w-full text-left py-1 hover:bg-gray-100 text-black">Color</button>
//                           <button onClick={() => handleDuplicate(canvas.id, item.id)} className="block w-full text-left py-1 hover:bg-gray-100 text-black">Duplicate</button>
//                           <button onClick={() => setShowDelete({ canvasId: canvas.id, blockId: item.id })} className="block w-full text-left py-1 hover:bg-red-100 text-red-600">Delete</button>
//                         </div>
//                       )}
//                     </div>
//                   </Rnd>
//                 ))}
//               </div>
//             </div>
//           </Rnd>
//         ))}

//         {/* Delete Confirmation Popup */}
//         {(showDelete.blockId || (showDelete.canvasId && !showDelete.blockId)) && (
//           <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-60 z-[99999]">
//             <div className="bg-white p-6 rounded shadow-xl">
//               <div className="mb-4 text-black">
//                 {showDelete.blockId
//                   ? "Are you sure you want to delete this block?"
//                   : "Are you sure you want to delete this canvas?"}
//               </div>
//               <div className="flex justify-end gap-2">
//                 <button onClick={() => setShowDelete({})} className="px-4 py-2 border rounded text-black">No</button>
//                 {showDelete.blockId ? (
//                   <button onClick={() => handleDeleteBlock(showDelete.canvasId!, showDelete.blockId!)} className="px-4 py-2 bg-red-600 text-white rounded">Yes</button>
//                 ) : (
//                   <button onClick={() => handleDeleteCanvas(showDelete.canvasId!)} className="px-4 py-2 bg-red-600 text-white rounded">Yes</button>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


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
}

interface CanvasItem {
  id: string;
  label: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  blocks: BlockItem[];
}

const getInitialContent = (type: BlockType) => {
  if (type === 'text') return 'Text Block';
  if (type === 'block') return 'Block';
  return "I'm a note\n\nDouble click to edit me. Guide";
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

const initialCanvases: CanvasItem[] = [
  {
    id: 'canvas-1',
    label: 'Block',
    color: '#ffc107',
    position: { x: 220, y: 60 },
    size: { width: 700, height: 400 },
    blocks: [
      {
        id: '1',
        type: 'block',
        content: 'Test Block',
        color: '#0d6e9a',
        position: { x: 200, y: 120 },
        size: { width: 350, height: 100 },
      },
      {
        id: '2',
        type: 'note',
        content: "I'm a note\n\nDouble click to edit me. Guide",
        color: '#fdf6e3',
        position: { x: 40, y: 20 },
        size: { width: 220, height: 150 },
      },
    ],
  },
];

export default function Home() {
  const [canvases, setCanvases] = useState<CanvasItem[]>(initialCanvases);
  const [showDelete, setShowDelete] = useState<{ canvasId?: string; blockId?: string }>({});
  const [optionsId, setOptionsId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<BlockType | null>(null);

  // Sidebar drag start
  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    setDraggedType(type);
    e.dataTransfer.setData('block-type', type);
  };

  // Drop handler for main area (for new canvas)
  const handleMainDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = draggedType;
    setDraggedType(null);
    if (type !== 'block') return;
    const mainRect = (e.target as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - mainRect.left;
    const y = e.clientY - mainRect.top;
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
      },
    ]);
  };

  // Allow drop
  const handleAllowDrop = (e: React.DragEvent) => e.preventDefault();

  // Drop handler for canvas (for inner blocks)
  const handleCanvasDrop = (canvasId: string, e: React.DragEvent) => {
    e.preventDefault();
    const type = draggedType;
    setDraggedType(null);
    if (!type || type === 'block') return; // Only allow text/note inside
    
    // Find the scrollable content area
    const contentArea = (e.currentTarget as HTMLElement).querySelector('.overflow-auto');
    if (!contentArea) return;
    
    const contentRect = contentArea.getBoundingClientRect();
    
    // Calculate position relative to content area, accounting for scroll
    const x = e.clientX - contentRect.left;
    const y = e.clientY - contentRect.top + (contentArea.scrollTop || 0);
    
    const id = `${Date.now()}`;
    setCanvases(canvases =>
      canvases.map(c =>
        c.id === canvasId
          ? {
              ...c,
              blocks: [
                ...c.blocks,
                {
                  id,
                  type,
                  content: getInitialContent(type),
                  color: getInitialColor(type),
                  position: { x, y },
                  size: getInitialSize(type),
                },
              ],
            }
          : c
      )
    );
  };

  // Block actions
  const handleDuplicate = (canvasId: string, blockId: string) => {
    setCanvases(canvases =>
      canvases.map(c =>
        c.id === canvasId
          ? {
              ...c,
              blocks: c.blocks.concat(
                c.blocks
                  .filter(b => b.id === blockId)
                  .map(b => ({
                    ...b,
                    id: `${Date.now()}`,
                    position: { x: b.position.x + 30, y: b.position.y + 30 },
                  }))
              ),
            }
          : c
      )
    );
  };

  const handleDeleteBlock = (canvasId: string, blockId: string) => {
    setCanvases(canvases =>
      canvases.map(c =>
        c.id === canvasId
          ? { ...c, blocks: c.blocks.filter(b => b.id !== blockId) }
          : c
      )
    );
    setShowDelete({});
  };

  const handleDeleteCanvas = (canvasId: string) => {
    setCanvases(canvases => canvases.filter(c => c.id !== canvasId));
    setShowDelete({});
  };

  const handleEditBlock = (canvasId: string, blockId: string) => {
    const c = canvases.find(c => c.id === canvasId);
    const b = c?.blocks.find(b => b.id === blockId);
    const newContent = prompt('Edit content:', b?.content || '');
    if (newContent !== null)
      setCanvases(canvases =>
        canvases.map(c =>
          c.id === canvasId
            ? {
                ...c,
                blocks: c.blocks.map(b =>
                  b.id === blockId ? { ...b, content: newContent } : b
                ),
              }
            : c
        )
      );
    setOptionsId(null);
  };

  const handleColorBlock = (canvasId: string, blockId: string) => {
    const c = canvases.find(c => c.id === canvasId);
    const b = c?.blocks.find(b => b.id === blockId);
    const newColor = prompt('Enter color (name or hex):', b?.color || '');
    if (newColor !== null)
      setCanvases(canvases =>
        canvases.map(c =>
          c.id === canvasId
            ? {
                ...c,
                blocks: c.blocks.map(b =>
                  b.id === blockId ? { ...b, color: newColor } : b
                ),
              }
            : c
        )
      );
    setOptionsId(null);
  };

  const updateBlockPosition = (canvasId: string, blockId: string, position: { x: number; y: number }) => {
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
  };

  const updateBlockSize = (canvasId: string, blockId: string, size: { width: number; height: number }) => {
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

  // Canvas options handlers
  const handleCanvasLabel = (canvasId: string) => {
    const c = canvases.find(c => c.id === canvasId);
    const label = prompt('Edit canvas label:', c?.label || '');
    if (label !== null)
      setCanvases(canvases =>
        canvases.map(c =>
          c.id === canvasId ? { ...c, label } : c
        )
      );
    setOptionsId(null);
  };

  const handleCanvasColor = (canvasId: string) => {
    const c = canvases.find(c => c.id === canvasId);
    const color = prompt('Enter canvas color (name or hex):', c?.color || '');
    if (color !== null)
      setCanvases(canvases =>
        canvases.map(c =>
          c.id === canvasId ? { ...c, color } : c
        )
      );
    setOptionsId(null);
  };

  // Utility for optionsId
  const getCanvasOptionId = (canvasId: string) => `canvas-${canvasId}`;
  const getBlockOptionId = (canvasId: string, blockId: string) => `block-${canvasId}-${blockId}`;

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

      {/* Main Area: drop here for new canvas */}
      <div
        className="flex-1 p-8 relative h-screen"
        onDrop={handleMainDrop}
        onDragOver={handleAllowDrop}
        style={{ minHeight: '100vh', overflowY: 'auto' }}
        id="main-drop-area"
      >
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
              <div className='flex align-middle text-center  '>
              <div className='text-black font-bold mr-2'>Block</div>
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
                    <button onClick={() => handleCanvasLabel(canvas.id)} className="block w-full text-left py-1 hover:bg-gray-100 text-black">Edit</button>
                    <button onClick={() => handleCanvasColor(canvas.id)} className="block w-full text-left py-1 hover:bg-gray-100 text-black">Color</button>
                    <button onClick={() => setShowDelete({ canvasId: canvas.id })} className="block w-full text-left py-1 hover:bg-red-100 text-red-600">Delete</button>
                  </div>
                )}
              </div>
              
             
              {/* Canvas content area with scrolling */}
              <div className="pt-10 w-full h-full overflow-auto" style={{ position: "relative" }}>
                {/* Draggable blocks */}
                {canvas.blocks.map((item, idx) => (
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
                    style={{ zIndex: 20 + idx }}
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
                      <div className="flex-grow flex items-center justify-center overflow-auto whitespace-pre-line px-3 pb-3 cursor-text select-text">
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
                          <button onClick={() => handleEditBlock(canvas.id, item.id)} className="block w-full text-left py-1 hover:bg-gray-100 text-black">Edit</button>
                          <button onClick={() => handleColorBlock(canvas.id, item.id)} className="block w-full text-left py-1 hover:bg-gray-100 text-black">Color</button>
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
        {(showDelete.blockId || (showDelete.canvasId && !showDelete.blockId)) && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-60 z-[99999]">
            <div className="bg-white p-6 rounded shadow-xl">
              <div className="mb-4 text-black">
                {showDelete.blockId
                  ? "Are you sure you want to delete this block?"
                  : "Are you sure you want to delete this canvas?"}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowDelete({})} className="px-4 py-2 border rounded text-black">No</button>
                {showDelete.blockId ? (
                  <button onClick={() => handleDeleteBlock(showDelete.canvasId!, showDelete.blockId!)} className="px-4 py-2 bg-red-600 text-white rounded">Yes</button>
                ) : (
                  <button onClick={() => handleDeleteCanvas(showDelete.canvasId!)} className="px-4 py-2 bg-red-600 text-white rounded">Yes</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}