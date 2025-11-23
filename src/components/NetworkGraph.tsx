'use client';

import React, { useEffect, useState, useRef } from 'react';
import { User, Connection } from '@prisma/client';

interface NetworkGraphProps {
    users: User[];
    connections: Connection[];
    highlightedUserIds?: string[];
    searchQuery?: string;
}

interface Node {
    id: string;
    name: string | null;
    profilePic: string | null;
    website: string | null;
    x: number;
    y: number;
}

export default function NetworkGraph({ users, connections, highlightedUserIds = [], searchQuery = '' }: NetworkGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const nodesRef = useRef<Node[]>([]);
    const nodeElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const dragNodeRef = useRef<string | null>(null);
    const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const isPanningRef = useRef(false);
    const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | null>(null);
    const isAnimatingRef = useRef(false);
    const [isDark, setIsDark] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const checkDarkMode = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            setIsDark(theme === 'dark');
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        isAnimatingRef.current = true;
        
        const animate = () => {
            if (isAnimatingRef.current) {
                updateVisuals();
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        if (searchQuery && highlightedUserIds.length > 0) {
            const targetNode = nodesRef.current.find(n => highlightedUserIds.includes(n.id));
            
            if (targetNode) {
                const newZoom = 2.5;
                setZoomLevel(newZoom);
                
                const targetZoomedX = (targetNode.x - width / 2) * newZoom + width / 2;
                const targetZoomedY = (targetNode.y - height / 2) * newZoom + height / 2;
                
                const offsetX = width / 2 - targetZoomedX;
                const offsetY = height / 2 - targetZoomedY;
                
                setPanOffset({ x: offsetX, y: offsetY });
            }
        }

        animate();

        const stopTimeout = setTimeout(() => {
            isAnimatingRef.current = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }, 600);

        return () => {
            clearTimeout(stopTimeout);
            isAnimatingRef.current = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [searchQuery, highlightedUserIds]);

    const updateVisuals = () => {
        const svg = svgRef.current;
        const nodes = nodesRef.current;
        const container = containerRef.current;

        if (!svg || !container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        svg.innerHTML = '';
        connections.forEach((conn) => {
            const fromNode = nodes.find(n => n.id === conn.fromId);
            const toNode = nodes.find(n => n.id === conn.toId);

            if (fromNode && toNode) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                const x1 = (fromNode.x - width / 2) * zoomLevel + width / 2 + panOffset.x;
                const y1 = (fromNode.y - height / 2) * zoomLevel + height / 2 + panOffset.y;
                const x2 = (toNode.x - width / 2) * zoomLevel + width / 2 + panOffset.x;
                const y2 = (toNode.y - height / 2) * zoomLevel + height / 2 + panOffset.y;
                
                line.setAttribute('x1', x1.toString());
                line.setAttribute('y1', y1.toString());
                line.setAttribute('x2', x2.toString());
                line.setAttribute('y2', y2.toString());
                line.setAttribute('stroke', isDark ? '#404040' : '#333');
                line.setAttribute('stroke-width', '1');
                line.setAttribute('opacity', '0.3');
                svg.appendChild(line);
            }
        });

        nodes.forEach((node) => {
            const nodeDiv = nodeElementsRef.current.get(node.id);
            if (nodeDiv) {
                const transformedX = (node.x - width / 2) * zoomLevel + width / 2 + panOffset.x;
                const transformedY = (node.y - height / 2) * zoomLevel + height / 2 + panOffset.y;
                
                nodeDiv.style.left = `${transformedX}px`;
                nodeDiv.style.top = `${transformedY}px`;
                nodeDiv.style.transform = `translate(-50%, -50%) scale(${zoomLevel})`;
                
                const img = nodeDiv.querySelector('img');
                if (img) {
                    const isHighlighted = highlightedUserIds.length === 0 || highlightedUserIds.includes(node.id);
                    if (searchQuery && isHighlighted) {
                        img.style.filter = 'grayscale(0%)';
                    } else if (searchQuery && !isHighlighted) {
                        img.style.filter = 'grayscale(100%)';
                        img.style.opacity = '0.3';
                    } else {
                        img.style.filter = 'grayscale(100%)';
                        img.style.opacity = '1';
                    }
                }
            }
        });
    };

    useEffect(() => {
        if (!containerRef.current || users.length === 0) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        container.innerHTML = '';
        nodeElementsRef.current.clear();

        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        nodesRef.current = users.map((user, i) => {
            const radius = Math.sqrt(i + 0.5) * (Math.min(width, height) / (2.5 * Math.sqrt(users.length)));
            const angle = i * goldenAngle;

            return {
        id: user.id,
        name: user.name,
                profilePic: user.profilePic,
                website: user.website,
                x: width / 2 + radius * Math.cos(angle),
                y: height / 2 + radius * Math.sin(angle),
            };
        });

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.transition = 'opacity 0.3s ease';
        svgRef.current = svg;
        container.appendChild(svg);

        nodesRef.current.forEach((node) => {
            const nodeDiv = document.createElement('div');
            nodeDiv.style.position = 'absolute';
            nodeDiv.style.cursor = 'grab';
            nodeDiv.style.userSelect = 'none';
            nodeDiv.style.transition = 'left 0.5s ease, top 0.5s ease, transform 0.5s ease';

            const img = document.createElement('img');
            img.src = node.profilePic || '/default-avatar.png';
            img.style.width = '32px';
            img.style.height = '32px';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            img.style.filter = 'grayscale(100%)';
            img.style.transition = 'filter 0.3s ease';
            img.style.display = 'block';
            img.draggable = false;
            img.style.transition = 'filter 0.3s ease, opacity 0.3s ease';

            const nameLabel = document.createElement('div');
            nameLabel.textContent = node.name || 'Unknown';
            nameLabel.style.position = 'absolute';
            nameLabel.style.top = '100%';
            nameLabel.style.left = '50%';
            nameLabel.style.transform = 'translateX(-50%)';
            nameLabel.style.marginTop = '4px';
            nameLabel.style.padding = '2px 6px';
            nameLabel.style.background = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
            nameLabel.style.color = isDark ? '#fff' : '#000';
            nameLabel.style.fontSize = '11px';
            nameLabel.style.fontWeight = '500';
            nameLabel.style.borderRadius = '4px';
            nameLabel.style.whiteSpace = 'nowrap';
            nameLabel.style.pointerEvents = 'none';
            nameLabel.style.opacity = '0';
            nameLabel.style.transition = 'opacity 0.2s ease';
            nameLabel.style.zIndex = '1000';
            nameLabel.style.fontFamily = 'Inter, sans-serif';

            nodeDiv.addEventListener('mouseenter', () => {
                img.style.filter = 'grayscale(0%)';
                img.style.opacity = '1';
                nameLabel.style.opacity = '1';
            });

            nodeDiv.addEventListener('mouseleave', () => {
                const isHighlighted = highlightedUserIds.length === 0 || highlightedUserIds.includes(node.id);
                if (searchQuery && isHighlighted) {
                    img.style.filter = 'grayscale(0%)';
                    img.style.opacity = '1';
                } else if (searchQuery && !isHighlighted) {
                    img.style.filter = 'grayscale(100%)';
                    img.style.opacity = '0.3';
                } else {
                    img.style.filter = 'grayscale(100%)';
                    img.style.opacity = '1';
                }
                nameLabel.style.opacity = '0';
            });

            nodeDiv.addEventListener('mousedown', (e) => {
                (nodeDiv as any).__isDragging = false;
                dragStartRef.current = { x: e.clientX, y: e.clientY };
                isDraggingRef.current = false;
                dragNodeRef.current = node.id;
                nodeDiv.style.cursor = 'grabbing';
                nodeDiv.style.transition = 'none';
                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const transformedX = (node.x - width / 2) * zoomLevel + width / 2 + panOffset.x;
                const transformedY = (node.y - height / 2) * zoomLevel + height / 2 + panOffset.y;
                
                dragOffsetRef.current = {
                    x: (mouseX - transformedX) * zoomLevel,
                    y: (mouseY - transformedY) * zoomLevel
                };
            });

            nodeDiv.addEventListener('click', (e) => {
                const wasDragging = (nodeDiv as any).__isDragging === true;
                if (!wasDragging && !isDraggingRef.current && node.website) {
                    const url = node.website.startsWith('http') ? node.website : `https://${node.website}`;
                    window.open(url, '_blank');
                }
                (nodeDiv as any).__isDragging = false;
            });

            nodeDiv.appendChild(img);
            nodeDiv.appendChild(nameLabel);
            container.appendChild(nodeDiv);
            nodeElementsRef.current.set(node.id, nodeDiv);
        });

        const handleContainerMouseDown = (e: MouseEvent) => {
            if (e.target === container || e.target === svgRef.current) {
                isPanningRef.current = true;
                container.style.cursor = 'grabbing';
                panStartRef.current = {
                    x: e.clientX - panOffset.x,
                    y: e.clientY - panOffset.y
                };
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (dragNodeRef.current && dragStartRef.current) {
                const moveDistance = Math.abs(e.clientX - dragStartRef.current.x) + Math.abs(e.clientY - dragStartRef.current.y);
                if (moveDistance > 3) {
                    isDraggingRef.current = true;
                    const nodeDiv = nodeElementsRef.current.get(dragNodeRef.current);
                    if (nodeDiv) {
                        (nodeDiv as any).__isDragging = true;
                    }
                }

                const rect = container.getBoundingClientRect();
                const node = nodesRef.current.find(n => n.id === dragNodeRef.current);
                if (node) {
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    
                    node.x = ((mouseX - panOffset.x - width / 2) / zoomLevel) + width / 2 - dragOffsetRef.current.x / zoomLevel;
                    node.y = ((mouseY - panOffset.y - height / 2) / zoomLevel) + height / 2 - dragOffsetRef.current.y / zoomLevel;

                    const padding = 20;
                    node.x = Math.max(padding, Math.min(width - padding, node.x));
                    node.y = Math.max(padding, Math.min(height - padding, node.y));

                    updateVisuals();
                }
            } else if (isPanningRef.current) {
                const newPanX = e.clientX - panStartRef.current.x;
                const newPanY = e.clientY - panStartRef.current.y;
                setPanOffset({ x: newPanX, y: newPanY });
                updateVisuals();
            }
        };

        const handleMouseUp = () => {
            if (dragNodeRef.current) {
                const nodeDiv = nodeElementsRef.current.get(dragNodeRef.current);
                if (nodeDiv) {
                    nodeDiv.style.cursor = 'grab';
                    nodeDiv.style.transition = 'left 0.5s ease, top 0.5s ease, transform 0.5s ease';
                }
                isDraggingRef.current = false;
                dragNodeRef.current = null;
            }
            
            if (isPanningRef.current) {
                isPanningRef.current = false;
                container.style.cursor = '';
            }
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            
            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const zoomDelta = e.deltaY > 0 ? 0.97 : 1.03;
            const newZoom = Math.min(Math.max(zoomLevel * zoomDelta, 0.5), 5);
            
            const zoomPointX = (mouseX - panOffset.x - width / 2) / zoomLevel + width / 2;
            const zoomPointY = (mouseY - panOffset.y - height / 2) / zoomLevel + height / 2;
            
            const newPanX = mouseX - (zoomPointX - width / 2) * newZoom - width / 2;
            const newPanY = mouseY - (zoomPointY - height / 2) * newZoom - height / 2;
            
            setZoomLevel(newZoom);
            setPanOffset({ x: newPanX, y: newPanY });
            
            setTimeout(() => updateVisuals(), 0);
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('mousedown', handleContainerMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        updateVisuals();

        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('mousedown', handleContainerMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [users, connections, isDark, zoomLevel, panOffset]);

    return (
        <div 
            ref={containerRef}
            className="network-graph-container" 
            style={{ 
                width: '100%', 
                height: '400px'
            }}
        />
    );
}
